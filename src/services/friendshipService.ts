import { supabase } from '../lib/supabase';
import type { Friendship, FriendshipWithUser, UserData } from '../lib/supabase';

/**
 * 发送好友请求
 * @param requesterId 发起请求的用户ID
 * @param addresseeId 接收请求的用户ID
 * @param meetingId 可选，关联的会议ID
 */
export async function sendFriendRequest(
  requesterId: string,
  addresseeId: string,
  meetingId?: string
): Promise<Friendship> {
  console.log('发送好友请求:', { requesterId, addresseeId, meetingId });

  // 检查是否已有反向请求
  const { data: reverseRequest } = await supabase
    .from('friendships')
    .select('*')
    .eq('requester_id', addresseeId)
    .eq('addressee_id', requesterId)
    .eq('status', 'pending')
    .maybeSingle();

  if (reverseRequest) {
    // 直接接受对方的请求
    console.log('发现反向请求，直接接受:', reverseRequest.id);
    await acceptFriendRequest(reverseRequest.id, requesterId);
    return reverseRequest;
  }

  // 检查是否已存在请求
  const { data: existingRequest } = await supabase
    .from('friendships')
    .select('*')
    .eq('requester_id', requesterId)
    .eq('addressee_id', addresseeId)
    .maybeSingle();

  if (existingRequest) {
    if (existingRequest.status === 'pending') {
      console.log('好友请求已存在');
      return existingRequest;
    } else if (existingRequest.status === 'rejected') {
      // 如果之前被拒绝，更新为 pending
      const { data: updated, error: updateError } = await supabase
        .from('friendships')
        .update({ status: 'pending', meeting_id: meetingId })
        .eq('id', existingRequest.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`重新发送请求失败: ${updateError.message}`);
      }
      return updated;
    } else if (existingRequest.status === 'accepted') {
      console.log('已经是好友了');
      return existingRequest;
    }
  }

  // 创建新请求
  const { data, error } = await supabase
    .from('friendships')
    .insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'pending',
      meeting_id: meetingId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`发送好友请求失败: ${error.message}`);
  }

  console.log('✅ 好友请求已发送:', data.id);
  return data;
}

/**
 * 接受好友请求
 * @param friendshipId 好友关系ID
 * @param userId 当前用户ID（必须是 addressee）
 */
export async function acceptFriendRequest(
  friendshipId: string,
  userId: string
): Promise<void> {
  console.log('接受好友请求:', { friendshipId, userId });

  // 验证用户是请求的接收者
  const { data: friendship } = await supabase
    .from('friendships')
    .select('*')
    .eq('id', friendshipId)
    .single();

  if (!friendship) {
    throw new Error('好友请求不存在');
  }

  if (friendship.addressee_id !== userId) {
    throw new Error('只有请求接收者可以接受请求');
  }

  if (friendship.status !== 'pending') {
    throw new Error('该请求已被处理');
  }

  // 更新状态
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', friendshipId);

  if (error) {
    throw new Error(`接受好友请求失败: ${error.message}`);
  }

  console.log('✅ 好友请求已接受');
}

/**
 * 拒绝好友请求
 * @param friendshipId 好友关系ID
 * @param userId 当前用户ID（必须是 addressee）
 */
export async function rejectFriendRequest(
  friendshipId: string,
  userId: string
): Promise<void> {
  console.log('拒绝好友请求:', { friendshipId, userId });

  // 验证用户是请求的接收者
  const { data: friendship } = await supabase
    .from('friendships')
    .select('*')
    .eq('id', friendshipId)
    .single();

  if (!friendship) {
    throw new Error('好友请求不存在');
  }

  if (friendship.addressee_id !== userId) {
    throw new Error('只有请求接收者可以拒绝请求');
  }

  if (friendship.status !== 'pending') {
    throw new Error('该请求已被处理');
  }

  // 更新状态
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'rejected' })
    .eq('id', friendshipId);

  if (error) {
    throw new Error(`拒绝好友请求失败: ${error.message}`);
  }

  console.log('✅ 好友请求已拒绝');
}

/**
 * 获取用户的所有好友（status = 'accepted'）
 * @param userId 用户ID
 */
export async function getUserFriends(
  userId: string
): Promise<FriendshipWithUser[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error) {
    throw new Error(`获取好友列表失败: ${error.message}`);
  }

  // 获取对方用户信息
  const friendshipsWithUsers = await Promise.all(
    (data || []).map(async (friendship) => {
      const otherUserId =
        friendship.requester_id === userId
          ? friendship.addressee_id
          : friendship.requester_id;

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (userError) {
        console.error('获取用户信息失败:', userError);
        return null;
      }

      return {
        ...friendship,
        user: user as UserData,
      } as FriendshipWithUser;
    })
  );

  return friendshipsWithUsers.filter((f) => f !== null) as FriendshipWithUser[];
}

/**
 * 获取收到的好友请求（status = 'pending'，addressee = userId）
 * @param userId 用户ID
 */
export async function getReceivedFriendRequests(
  userId: string
): Promise<FriendshipWithUser[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .eq('addressee_id', userId)
    .eq('status', 'pending');

  if (error) {
    throw new Error(`获取好友请求失败: ${error.message}`);
  }

  // 获取请求者信息
  const friendshipsWithUsers = await Promise.all(
    (data || []).map(async (friendship) => {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', friendship.requester_id)
        .single();

      if (userError) {
        console.error('获取用户信息失败:', userError);
        return null;
      }

      return {
        ...friendship,
        user: user as UserData,
      } as FriendshipWithUser;
    })
  );

  return friendshipsWithUsers.filter((f) => f !== null) as FriendshipWithUser[];
}

/**
 * 获取发出的好友请求（status = 'pending'，requester = userId）
 * @param userId 用户ID
 */
export async function getSentFriendRequests(
  userId: string
): Promise<FriendshipWithUser[]> {
  const { data, error } = await supabase
    .from('friendships')
    .select('*')
    .eq('requester_id', userId)
    .eq('status', 'pending');

  if (error) {
    throw new Error(`获取已发送请求失败: ${error.message}`);
  }

  // 获取接收者信息
  const friendshipsWithUsers = await Promise.all(
    (data || []).map(async (friendship) => {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', friendship.addressee_id)
        .single();

      if (userError) {
        console.error('获取用户信息失败:', userError);
        return null;
      }

      return {
        ...friendship,
        user: user as UserData,
      } as FriendshipWithUser;
    })
  );

  return friendshipsWithUsers.filter((f) => f !== null) as FriendshipWithUser[];
}

/**
 * 检查两个用户之间的好友关系状态
 * @returns 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected'
 */
export async function checkFriendshipStatus(
  userAId: string,
  userBId: string
): Promise<{
  status: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected';
  friendship?: Friendship;
}> {
  // 检查 A -> B 的请求
  const { data: sentRequest } = await supabase
    .from('friendships')
    .select('*')
    .eq('requester_id', userAId)
    .eq('addressee_id', userBId)
    .maybeSingle();

  if (sentRequest) {
    if (sentRequest.status === 'pending') {
      return { status: 'pending_sent', friendship: sentRequest };
    } else if (sentRequest.status === 'accepted') {
      return { status: 'accepted', friendship: sentRequest };
    } else if (sentRequest.status === 'rejected') {
      return { status: 'rejected', friendship: sentRequest };
    }
  }

  // 检查 B -> A 的请求
  const { data: receivedRequest } = await supabase
    .from('friendships')
    .select('*')
    .eq('requester_id', userBId)
    .eq('addressee_id', userAId)
    .maybeSingle();

  if (receivedRequest) {
    if (receivedRequest.status === 'pending') {
      return { status: 'pending_received', friendship: receivedRequest };
    } else if (receivedRequest.status === 'accepted') {
      return { status: 'accepted', friendship: receivedRequest };
    } else if (receivedRequest.status === 'rejected') {
      return { status: 'rejected', friendship: receivedRequest };
    }
  }

  return { status: 'none' };
}

