import { supabase, Connection, ConnectionWithUser, UserData, ConnectionStatus } from '@/lib/supabase';
import { findPotentialMatches } from './aiService';

/**
 * 获取推荐连接（优先使用缓存）
 */
export async function getRecommendedConnections(
  userId: string,
  forceRefresh: boolean = false
): Promise<ConnectionWithUser[]> {
  try {
    // 检查是否有有效的缓存推荐（24小时内）
    if (!forceRefresh) {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: cachedConnections, error } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'suggested')
        .gte('suggested_at', twentyFourHoursAgo.toISOString())
        .order('match_score', { ascending: false })
        .limit(10);

      if (!error && cachedConnections && cachedConnections.length > 0) {
        console.log(`找到 ${cachedConnections.length} 个缓存的推荐`);
        
        // 获取目标用户信息
        const targetUserIds = cachedConnections.map(c => c.target_user_id);
        const { data: targetUsers } = await supabase
          .from('users')
          .select('*')
          .in('id', targetUserIds);

        if (targetUsers) {
          const connectionsWithUsers = cachedConnections.map(conn => {
            const targetUser = targetUsers.find(u => u.id === conn.target_user_id);
            return {
              ...conn,
              target_user: targetUser as UserData
            } as ConnectionWithUser;
          }).filter(c => c.target_user);

          return connectionsWithUsers;
        }
      }
    }

    // 没有缓存或强制刷新，生成新推荐
    console.log('生成新的推荐连接...');
    const matches = await findPotentialMatches(userId, 10);

    if (matches.length === 0) {
      return [];
    }

    // 删除旧的suggested状态连接
    await supabase
      .from('connections')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'suggested');

    // 保存新推荐到数据库
    const newConnections = matches.map(match => ({
      user_id: userId,
      target_user_id: match.userId,
      match_score: match.score,
      match_reasons: {
        reasons: match.reasons,
        common_goals: match.commonGoals,
        common_interests: match.commonInterests
      },
      status: 'suggested' as ConnectionStatus,
      suggested_at: new Date().toISOString(),
    }));

    const { data: savedConnections, error: saveError } = await supabase
      .from('connections')
      .insert(newConnections)
      .select();

    if (saveError) {
      console.error('Error saving connections:', saveError);
      throw saveError;
    }

    // 获取用户信息
    const targetUserIds = matches.map(m => m.userId);
    const { data: targetUsers } = await supabase
      .from('users')
      .select('*')
      .in('id', targetUserIds);

    if (!targetUsers) {
      return [];
    }

    const connectionsWithUsers = (savedConnections || []).map(conn => {
      const targetUser = targetUsers.find(u => u.id === conn.target_user_id);
      return {
        ...conn,
        target_user: targetUser as UserData
      } as ConnectionWithUser;
    }).filter(c => c.target_user);

    return connectionsWithUsers;
  } catch (error) {
    console.error('Error getting recommended connections:', error);
    throw error;
  }
}

/**
 * 发送连接请求
 */
export async function sendConnectionRequest(
  connectionId: string
): Promise<Connection> {
  try {
    const { data, error } = await supabase
      .from('connections')
      .update({
        status: 'pending',
        responded_at: new Date().toISOString(),
      })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) throw error;

    // TODO: 可以在这里添加通知逻辑，通知目标用户有新的连接请求

    return data as Connection;
  } catch (error) {
    console.error('Error sending connection request:', error);
    throw error;
  }
}

/**
 * 接受连接
 */
export async function acceptConnection(
  connectionId: string
): Promise<Connection> {
  try {
    const { data, error } = await supabase
      .from('connections')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
      })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) throw error;

    // 创建反向连接（如果需要双向连接）
    const connection = data as Connection;
    
    // 检查是否已存在反向连接
    const { data: reverseConnection } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id', connection.target_user_id)
      .eq('target_user_id', connection.user_id)
      .single();

    if (!reverseConnection) {
      // 创建反向连接
      await supabase
        .from('connections')
        .insert({
          user_id: connection.target_user_id,
          target_user_id: connection.user_id,
          match_score: connection.match_score,
          match_reasons: connection.match_reasons,
          status: 'accepted',
          suggested_at: connection.suggested_at,
          responded_at: new Date().toISOString(),
        });
    }

    return data as Connection;
  } catch (error) {
    console.error('Error accepting connection:', error);
    throw error;
  }
}

/**
 * 拒绝连接
 */
export async function rejectConnection(
  connectionId: string
): Promise<Connection> {
  try {
    const { data, error } = await supabase
      .from('connections')
      .update({
        status: 'rejected',
        responded_at: new Date().toISOString(),
      })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) throw error;

    return data as Connection;
  } catch (error) {
    console.error('Error rejecting connection:', error);
    throw error;
  }
}

/**
 * 获取连接历史
 */
export async function getConnectionHistory(
  userId: string,
  status?: ConnectionStatus
): Promise<ConnectionWithUser[]> {
  try {
    let query = supabase
      .from('connections')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    } else {
      // 默认不显示suggested状态
      query = query.in('status', ['pending', 'accepted', 'rejected']);
    }

    const { data: connections, error } = await query
      .order('responded_at', { ascending: false });

    if (error) throw error;

    if (!connections || connections.length === 0) {
      return [];
    }

    // 获取目标用户信息
    const targetUserIds = connections.map(c => c.target_user_id);
    const { data: targetUsers } = await supabase
      .from('users')
      .select('*')
      .in('id', targetUserIds);

    if (!targetUsers) {
      return [];
    }

    const connectionsWithUsers = connections.map(conn => {
      const targetUser = targetUsers.find(u => u.id === conn.target_user_id);
      return {
        ...conn,
        target_user: targetUser as UserData
      } as ConnectionWithUser;
    }).filter(c => c.target_user);

    return connectionsWithUsers;
  } catch (error) {
    console.error('Error getting connection history:', error);
    throw error;
  }
}

/**
 * 获取已接受的连接（好友列表）
 */
export async function getAcceptedConnections(
  userId: string
): Promise<ConnectionWithUser[]> {
  return getConnectionHistory(userId, 'accepted');
}

/**
 * 获取待处理的连接请求
 */
export async function getPendingConnections(
  userId: string
): Promise<ConnectionWithUser[]> {
  return getConnectionHistory(userId, 'pending');
}

/**
 * 获取用户收到的连接请求（作为目标用户）
 */
export async function getReceivedConnectionRequests(
  userId: string
): Promise<ConnectionWithUser[]> {
  try {
    const { data: connections, error } = await supabase
      .from('connections')
      .select('*')
      .eq('target_user_id', userId)
      .eq('status', 'pending')
      .order('responded_at', { ascending: false });

    if (error) throw error;

    if (!connections || connections.length === 0) {
      return [];
    }

    // 获取发起用户信息
    const userIds = connections.map(c => c.user_id);
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);

    if (!users) {
      return [];
    }

    // 注意：这里的target_user实际上是发起连接的用户
    const connectionsWithUsers = connections.map(conn => {
      const user = users.find(u => u.id === conn.user_id);
      return {
        ...conn,
        target_user: user as UserData
      } as ConnectionWithUser;
    }).filter(c => c.target_user);

    return connectionsWithUsers;
  } catch (error) {
    console.error('Error getting received connection requests:', error);
    throw error;
  }
}

