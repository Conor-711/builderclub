import { supabase } from '../lib/supabase';
import { checkFriendshipStatus, getUserFriends } from './friendshipService';
import type { UserData, ConversationStarter, FriendshipWithUser } from '../lib/supabase';

export type UserRelationship = 'self' | 'friend' | 'stranger';

/**
 * 检查查看者与目标用户之间的关系
 * @param viewerId 查看者ID
 * @param targetUserId 目标用户ID
 * @returns 'self' | 'friend' | 'stranger'
 */
export async function checkUserRelationship(
  viewerId: string,
  targetUserId: string
): Promise<UserRelationship> {
  // 如果是查看自己的资料
  if (viewerId === targetUserId) {
    return 'self';
  }

  // 检查是否是好友
  const { status } = await checkFriendshipStatus(viewerId, targetUserId);
  return status === 'accepted' ? 'friend' : 'stranger';
}

/**
 * 判断查看者是否可以查看目标用户的完整资料
 * @param viewerId 查看者ID
 * @param targetUserId 目标用户ID
 * @returns true 如果可以查看完整资料（自己或好友），否则 false
 */
export async function canViewFullProfile(
  viewerId: string,
  targetUserId: string
): Promise<boolean> {
  const relationship = await checkUserRelationship(viewerId, targetUserId);
  return relationship === 'self' || relationship === 'friend';
}

/**
 * 根据查看权限获取用户数据
 * @param viewerId 查看者ID
 * @param targetUserId 目标用户ID
 * @returns 包含用户数据、对话启动器和好友列表的对象
 */
export async function getVisibleUserData(
  viewerId: string,
  targetUserId: string
): Promise<{
  relationship: UserRelationship;
  userData: Partial<UserData> | null;
  conversationStarters: ConversationStarter[];
  friends: FriendshipWithUser[];
}> {
  // 检查关系
  const relationship = await checkUserRelationship(viewerId, targetUserId);
  console.log('🔍 User relationship check:', { viewerId, targetUserId, relationship });

  // 如果是陌生人，只返回基本信息
  if (relationship === 'stranger') {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, avatar_url, city, intro')
      .eq('id', targetUserId)
      .single();

    if (error) {
      console.error('Error fetching basic user data:', error);
      return {
        relationship,
        userData: null,
        conversationStarters: [],
        friends: [],
      };
    }

    return {
      relationship,
      userData: data,
      conversationStarters: [],
      friends: [],
    };
  }

  // 如果是自己或好友，返回完整信息
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', targetUserId)
    .single();

  if (userError) {
    console.error('Error fetching full user data:', userError);
    return {
      relationship,
      userData: null,
      conversationStarters: [],
      friends: [],
    };
  }

  // 获取对话启动器
  console.log('📝 Fetching conversation starters for user:', targetUserId);
  const { data: starters, error: startersError } = await supabase
    .from('conversation_starters')
    .select('*')
    .eq('user_id', targetUserId);

  if (startersError) {
    console.error('❌ Error fetching conversation starters:', startersError);
  } else {
    console.log('✅ Conversation starters fetched:', starters?.length || 0, 'items');
    console.log('Starters data:', starters);
  }

  // 获取好友列表
  let friends: FriendshipWithUser[] = [];
  try {
    friends = await getUserFriends(targetUserId);
  } catch (error) {
    console.error('Error fetching friends list:', error);
  }

  return {
    relationship,
    userData,
    conversationStarters: starters || [],
    friends,
  };
}

