import { supabase } from '../lib/supabase';
import type { UserBlock } from '../lib/supabase';

/**
 * 忽略/拉黑用户
 * @param blockerId 执行忽略的用户ID
 * @param blockedId 被忽略的用户ID
 * @param reason 忽略原因
 * @param meetingId 可选，关联的会议ID
 */
export async function blockUser(
  blockerId: string,
  blockedId: string,
  reason: string = 'ignored_after_meeting',
  meetingId?: string
): Promise<UserBlock> {
  console.log('忽略用户:', { blockerId, blockedId, reason, meetingId });

  // 检查是否已经忽略过
  const { data: existingBlock } = await supabase
    .from('user_blocks')
    .select('*')
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId)
    .maybeSingle();

  if (existingBlock) {
    console.log('用户已被忽略');
    return existingBlock;
  }

  // 创建黑名单记录
  const { data, error } = await supabase
    .from('user_blocks')
    .insert({
      blocker_id: blockerId,
      blocked_id: blockedId,
      reason,
      meeting_id: meetingId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`忽略用户失败: ${error.message}`);
  }

  console.log('✅ 用户已被忽略:', data.id);
  return data;
}

/**
 * 取消忽略用户（如果需要该功能）
 * @param blockerId 执行操作的用户ID
 * @param blockedId 被忽略的用户ID
 */
export async function unblockUser(
  blockerId: string,
  blockedId: string
): Promise<void> {
  console.log('取消忽略用户:', { blockerId, blockedId });

  const { error } = await supabase
    .from('user_blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) {
    throw new Error(`取消忽略失败: ${error.message}`);
  }

  console.log('✅ 已取消忽略');
}

/**
 * 获取用户的黑名单
 * @param userId 用户ID
 */
export async function getBlockedUsers(
  userId: string
): Promise<UserBlock[]> {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('*')
    .eq('blocker_id', userId);

  if (error) {
    throw new Error(`获取黑名单失败: ${error.message}`);
  }

  return data || [];
}

/**
 * 检查两个用户之间是否存在忽略关系（双向检查）
 * @returns true 如果 A 忽略了 B 或 B 忽略了 A
 */
export async function isBlocked(
  userAId: string,
  userBId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('id')
    .or(`and(blocker_id.eq.${userAId},blocked_id.eq.${userBId}),and(blocker_id.eq.${userBId},blocked_id.eq.${userAId})`)
    .maybeSingle();

  if (error) {
    console.error('检查黑名单状态失败:', error);
    return false;
  }

  return data !== null;
}

/**
 * 获取忽略了当前用户的人的ID列表
 * @param userId 当前用户ID
 */
export async function getUsersWhoBlockedMe(
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_blocks')
    .select('blocker_id')
    .eq('blocked_id', userId);

  if (error) {
    throw new Error(`获取屏蔽列表失败: ${error.message}`);
  }

  return (data || []).map((block) => block.blocker_id);
}

