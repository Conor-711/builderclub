import { supabase } from '../lib/supabase';
import type {
  UserAvailability,
  ScheduledMeeting,
  ScheduledMeetingWithUsers,
  TimeSlot,
  MeetingDuration,
  UserData,
} from '../lib/supabase';
import { calculateMatchScore } from './aiService';
import { hasTimeConflict, isPastTime } from '../lib/timeUtils';
import { getBlockedUsers, getUsersWhoBlockedMe } from './blockService';

/**
 * 时间匹配服务
 * 处理用户可用时间、会面安排等功能
 */

/**
 * 保存用户的可用时间
 * @param userId 用户ID
 * @param timeSlots 时间段数组
 * @returns 保存的availability记录数组
 */
export async function saveUserAvailability(
  userId: string,
  timeSlots: TimeSlot[]
): Promise<UserAvailability[]> {
  console.log('保存用户可用时间:', userId, timeSlots);
  
  // 验证时间段不能是过去的时间
  for (const slot of timeSlots) {
    if (isPastTime(slot.date, slot.time)) {
      throw new Error('不能选择过去的时间');
    }
  }
  
  // 获取用户已有的时间段，检查冲突
  const { data: existingSlots, error: fetchError } = await supabase
    .from('user_availability')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['available', 'scheduled']);
  
  if (fetchError) {
    console.error('Error fetching existing slots:', fetchError);
    throw fetchError;
  }
  
  // 检查时间冲突
  for (const newSlot of timeSlots) {
    if (hasTimeConflict(newSlot.date, newSlot.time, newSlot.duration, existingSlots || [])) {
      throw new Error(`时间冲突：${newSlot.date} ${newSlot.time}`);
    }
  }
  
  // 批量插入新时间段
  const slotsToInsert = timeSlots.map(slot => ({
    user_id: userId,
    date: slot.date,
    time_slot: slot.time,
    duration: slot.duration,
    status: 'available' as const,
  }));
  
  const { data, error } = await supabase
    .from('user_availability')
    .insert(slotsToInsert)
    .select();
  
  if (error) {
    console.error('Error saving availability:', error);
    throw error;
  }
  
  console.log('成功保存时间段:', data);
  return data;
}

export interface MatchFilters {
  sameCityRequired?: boolean;
  stageFilter?: 'IDEA' | 'BUILDING' | 'DISTRIBUTING';
}

/**
 * 查找在相同时间段可用的其他用户
 * @param userId 当前用户ID
 * @param date 日期
 * @param timeSlot 时间
 * @param duration 持续时间
 * @param filters 筛选条件
 * @returns 候选用户的availability记录
 */
export async function findMatchingUsersForTimeSlot(
  userId: string,
  date: string,
  timeSlot: string,
  duration: MeetingDuration,
  filters?: MatchFilters
): Promise<UserAvailability[]> {
  console.log('查找匹配用户:', { userId, date, timeSlot, duration, filters });
  
  // 1. 查找相同时间段的其他用户
  const { data: candidates, error } = await supabase
    .from('user_availability')
    .select('*')
    .eq('date', date)
    .eq('time_slot', timeSlot)
    .eq('duration', duration)
    .eq('status', 'available')
    .neq('user_id', userId);
  
  if (error) {
    console.error('Error finding matching users:', error);
    throw error;
  }
  
  if (!candidates || candidates.length === 0) {
    console.log('没有找到匹配的用户');
    return [];
  }
  
  console.log(`找到 ${candidates.length} 个候选用户`);
  
  // 2. 排除已经安排过会面的用户
  const { data: existingMeetings } = await supabase
    .from('scheduled_meetings')
    .select('user_a_id, user_b_id')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .in('status', ['scheduled', 'completed']);
  
  const metUserIds = new Set<string>();
  existingMeetings?.forEach(meeting => {
    if (meeting.user_a_id === userId) {
      metUserIds.add(meeting.user_b_id);
    } else {
      metUserIds.add(meeting.user_a_id);
    }
  });
  
  console.log(`排除已见过的用户后，剩余 ${candidates.filter(c => !metUserIds.has(c.user_id)).length} 个候选用户`);
  
  // 3. 排除被忽略的用户（双向检查）
  const blockedByMe = await getBlockedUsers(userId);
  const blockedByMeIds = new Set(blockedByMe.map(b => b.blocked_id));
  
  const whoBlockedMe = await getUsersWhoBlockedMe(userId);
  const whoBlockedMeIds = new Set(whoBlockedMe);
  
  const excludedUserIds = new Set([
    ...metUserIds,
    ...blockedByMeIds,
    ...whoBlockedMeIds
  ]);
  
  let filteredCandidates = candidates.filter(
    candidate => !excludedUserIds.has(candidate.user_id)
  );
  
  console.log(`排除所有不可匹配用户后，剩余 ${filteredCandidates.length} 个候选用户`);
  
  // 4. 应用额外筛选条件
  if (filters) {
    // 获取当前用户信息（用于同城筛选）
    const { data: currentUser } = await supabase
      .from('users')
      .select('city, idea_status')
      .eq('id', userId)
      .single();
    
    // 获取所有候选用户的详细信息（用于筛选）
    const candidateUserIds = filteredCandidates.map(c => c.user_id);
    const { data: candidateUsers } = await supabase
      .from('users')
      .select('id, city, idea_status')
      .in('id', candidateUserIds);
    
    if (candidateUsers && currentUser) {
      // 应用同城筛选
      if (filters.sameCityRequired) {
        const sameCityUserIds = new Set(
          candidateUsers
            .filter(u => u.city && u.city.toLowerCase() === currentUser.city?.toLowerCase())
            .map(u => u.id)
        );
        filteredCandidates = filteredCandidates.filter(c => sameCityUserIds.has(c.user_id));
        console.log(`应用同城筛选后，剩余 ${filteredCandidates.length} 个候选用户`);
      }
      
      // 应用阶段筛选
      if (filters.stageFilter) {
        const matchingStageUserIds = new Set(
          candidateUsers
            .filter(u => {
              // 将 idea_status 映射到阶段
              const userStage = mapIdeaStatusToStage(u.idea_status);
              return userStage === filters.stageFilter;
            })
            .map(u => u.id)
        );
        filteredCandidates = filteredCandidates.filter(c => matchingStageUserIds.has(c.user_id));
        console.log(`应用阶段筛选后，剩余 ${filteredCandidates.length} 个候选用户`);
      }
    }
  }
  
  return filteredCandidates;
}

/**
 * 将 idea_status 映射到阶段
 */
function mapIdeaStatusToStage(ideaStatus?: string): 'IDEA' | 'BUILDING' | 'DISTRIBUTING' | null {
  if (!ideaStatus) return null;
  
  // 根据 SelectIdea 页面的选项映射
  if (ideaStatus === 'clear' || ideaStatus === 'open') {
    return 'IDEA'; // 有想法的用户处于 IDEA 阶段
  } else if (ideaStatus === 'no-idea') {
    return 'IDEA'; // 没想法的用户也在寻找 IDEA
  }
  
  // 这里可以扩展，例如根据其他字段判断 BUILDING 或 DISTRIBUTING 阶段
  // 目前简化处理，都归为 IDEA 阶段
  return 'IDEA';
}

/**
 * 为时间段找到最佳匹配用户
 * @param userId 当前用户ID
 * @param date 日期
 * @param timeSlot 时间
 * @param duration 持续时间
 * @param filters 筛选条件
 * @returns 最佳匹配的用户availability和匹配分数
 */
export async function findBestMatchForTimeSlot(
  userId: string,
  date: string,
  timeSlot: string,
  duration: MeetingDuration,
  filters?: MatchFilters
): Promise<{
  availability: UserAvailability;
  matchScore: number;
  matchReasons: any;
} | null> {
  console.log('查找最佳匹配:', { userId, date, timeSlot, duration, filters });
  
  // 查找候选用户
  const candidates = await findMatchingUsersForTimeSlot(userId, date, timeSlot, duration, filters);
  
  if (candidates.length === 0) {
    return null;
  }
  
  // 计算每个候选用户的匹配分数
  console.log(`开始为 ${candidates.length} 个候选用户计算匹配分数...`);
  
  const matchResults = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        console.log(`计算与用户 ${candidate.user_id} 的匹配度...`);
        const matchResult = await calculateMatchScore(userId, candidate.user_id);
        console.log(`✅ 匹配成功! 分数: ${matchResult.score}`);
        return {
          availability: candidate,
          matchScore: matchResult.score,
          matchReasons: matchResult.reasons,
        };
      } catch (error) {
        console.error(`❌ Error calculating match for ${candidate.user_id}:`, error);
        return null;
      }
    })
  );
  
  console.log('所有匹配结果:', matchResults);
  
  // 过滤掉失败的结果
  const validMatches = matchResults.filter(m => m !== null) as Array<{
    availability: UserAvailability;
    matchScore: number;
    matchReasons: any;
  }>;
  
  console.log(`有效匹配数: ${validMatches.length}`);
  
  if (validMatches.length === 0) {
    console.warn('⚠️ 所有匹配计算都失败了！');
    return null;
  }
  
  // 按分数排序，返回最佳匹配
  validMatches.sort((a, b) => b.matchScore - a.matchScore);
  const bestMatch = validMatches[0];
  
  console.log('✅ 找到最佳匹配:', bestMatch);
  return bestMatch;
}

/**
 * 批量为多个时间段查找最佳匹配
 * @param userId 用户ID
 * @param timeSlots 时间段数组
 * @param filters 筛选条件
 * @returns 每个时间段的最佳匹配
 */
export async function findBestMatchesForTimeSlots(
  userId: string,
  timeSlots: TimeSlot[],
  filters?: MatchFilters
): Promise<Array<{
  timeSlot: TimeSlot;
  match: {
    availability: UserAvailability;
    matchScore: number;
    matchReasons: any;
  } | null;
}>> {
  console.log('批量查找最佳匹配:', timeSlots, filters);
  
  const results = await Promise.all(
    timeSlots.map(async (slot) => {
      const match = await findBestMatchForTimeSlot(
        userId,
        slot.date,
        slot.time,
        slot.duration,
        filters
      );
      return {
        timeSlot: slot,
        match,
      };
    })
  );
  
  return results;
}

/**
 * 安排会面
 * @param userAId 用户A的ID
 * @param userBId 用户B的ID
 * @param availabilityAId 用户A的availability ID
 * @param availabilityBId 用户B的availability ID
 * @param date 会面日期
 * @param time 会面时间
 * @param duration 持续时间
 * @param matchScore 匹配分数
 * @param matchReasons 匹配原因
 * @returns 创建的会面记录
 */
export async function scheduleMeeting(
  userAId: string,
  userBId: string,
  availabilityAId: string,
  availabilityBId: string,
  date: string,
  time: string,
  duration: number,
  matchScore?: number,
  matchReasons?: any
): Promise<ScheduledMeeting> {
  console.log('安排会面:', {
    userAId,
    userBId,
    date,
    time,
    duration,
  });
  
  // 生成会议链接（简化版）
  const meetingId = crypto.randomUUID();
  const meetingLink = `${window.location.origin}/meeting/${meetingId}`;
  
  // 在事务中执行：创建会面 + 更新两个availability状态
  const { data: meeting, error: meetingError } = await supabase
    .from('scheduled_meetings')
    .insert({
      user_a_id: userAId,
      user_b_id: userBId,
      availability_a_id: availabilityAId,
      availability_b_id: availabilityBId,
      meeting_date: date,
      meeting_time: time,
      duration,
      match_score: matchScore,
      match_reasons: matchReasons,
      status: 'scheduled',
      meeting_link: meetingLink,
    })
    .select()
    .single();
  
  if (meetingError) {
    console.error('Error creating meeting:', meetingError);
    throw meetingError;
  }
  
  // 更新两个用户的availability状态
  const { error: updateAError } = await supabase
    .from('user_availability')
    .update({ status: 'scheduled' })
    .eq('id', availabilityAId);
  
  if (updateAError) {
    console.error('Error updating availability A:', updateAError);
    throw updateAError;
  }
  
  const { error: updateBError } = await supabase
    .from('user_availability')
    .update({ status: 'scheduled' })
    .eq('id', availabilityBId);
  
  if (updateBError) {
    console.error('Error updating availability B:', updateBError);
    throw updateBError;
  }
  
  console.log('成功安排会面:', meeting);
  return meeting;
}

/**
 * 获取用户的可用时间
 * @param userId 用户ID
 * @param dateFrom 开始日期（可选）
 * @param dateTo 结束日期（可选）
 * @param status 状态筛选（可选）
 * @returns 可用时间数组
 */
export async function getUserAvailability(
  userId: string,
  dateFrom?: string,
  dateTo?: string,
  status?: string
): Promise<UserAvailability[]> {
  let query = supabase
    .from('user_availability')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .order('time_slot', { ascending: true });
  
  if (dateFrom) {
    query = query.gte('date', dateFrom);
  }
  
  if (dateTo) {
    query = query.lte('date', dateTo);
  }
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * 获取用户的已安排会面
 * @param userId 用户ID
 * @param status 状态筛选（可选）
 * @returns 会面数组（包含对方用户信息）
 */
export async function getUserScheduledMeetings(
  userId: string,
  status?: string
): Promise<ScheduledMeetingWithUsers[]> {
  let query = supabase
    .from('scheduled_meetings')
    .select('*')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order('meeting_date', { ascending: true })
    .order('meeting_time', { ascending: true });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data: meetings, error } = await query;
  
  if (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
  
  if (!meetings || meetings.length === 0) {
    return [];
  }
  
  // 获取所有涉及的用户ID
  const userIds = new Set<string>();
  meetings.forEach(meeting => {
    userIds.add(meeting.user_a_id);
    userIds.add(meeting.user_b_id);
  });
  
  // 批量获取用户信息
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .in('id', Array.from(userIds));
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    throw usersError;
  }
  
  // 构建用户ID到用户数据的映射
  const userMap = new Map<string, UserData>();
  users?.forEach(user => {
    userMap.set(user.id, user);
  });
  
  // 组合会面和用户信息
  const meetingsWithUsers: ScheduledMeetingWithUsers[] = meetings.map(meeting => {
    const userA = userMap.get(meeting.user_a_id);
    const userB = userMap.get(meeting.user_b_id);
    
    if (!userA || !userB) {
      throw new Error('User data not found for meeting');
    }
    
    return {
      ...meeting,
      user_a: userA,
      user_b: userB,
    };
  });
  
  return meetingsWithUsers;
}

/**
 * 取消会面
 * @param meetingId 会面ID
 * @param userId 取消操作的用户ID（用于验证权限）
 * @returns 更新后的会面记录
 */
export async function cancelMeeting(
  meetingId: string,
  userId: string
): Promise<ScheduledMeeting> {
  console.log('取消会面:', meetingId, userId);
  
  // 获取会面信息
  const { data: meeting, error: fetchError } = await supabase
    .from('scheduled_meetings')
    .select('*')
    .eq('id', meetingId)
    .single();
  
  if (fetchError || !meeting) {
    throw new Error('Meeting not found');
  }
  
  // 验证权限
  if (meeting.user_a_id !== userId && meeting.user_b_id !== userId) {
    throw new Error('Unauthorized');
  }
  
  // 更新会面状态
  const { data: updatedMeeting, error: updateError } = await supabase
    .from('scheduled_meetings')
    .update({ status: 'cancelled' })
    .eq('id', meetingId)
    .select()
    .single();
  
  if (updateError) {
    console.error('Error cancelling meeting:', updateError);
    throw updateError;
  }
  
  // 将两个availability状态改回available
  await supabase
    .from('user_availability')
    .update({ status: 'available' })
    .eq('id', meeting.availability_a_id);
  
  await supabase
    .from('user_availability')
    .update({ status: 'available' })
    .eq('id', meeting.availability_b_id);
  
  console.log('成功取消会面');
  return updatedMeeting;
}

/**
 * 标记会面完成
 * @param meetingId 会面ID
 * @param userId 操作的用户ID（用于验证权限）
 * @returns 更新后的会面记录
 */
export async function completeMeeting(
  meetingId: string,
  userId: string
): Promise<ScheduledMeeting> {
  console.log('标记会面完成:', meetingId, userId);
  
  // 获取会面信息
  const { data: meeting, error: fetchError } = await supabase
    .from('scheduled_meetings')
    .select('*')
    .eq('id', meetingId)
    .single();
  
  if (fetchError || !meeting) {
    throw new Error('Meeting not found');
  }
  
  // 验证权限
  if (meeting.user_a_id !== userId && meeting.user_b_id !== userId) {
    throw new Error('Unauthorized');
  }
  
  // 更新会面状态
  const { data: updatedMeeting, error: updateError } = await supabase
    .from('scheduled_meetings')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', meetingId)
    .select()
    .single();
  
  if (updateError) {
    console.error('Error completing meeting:', updateError);
    throw updateError;
  }
  
  // 将两个availability状态改为completed
  await supabase
    .from('user_availability')
    .update({ status: 'completed' })
    .eq('id', meeting.availability_a_id);
  
  await supabase
    .from('user_availability')
    .update({ status: 'completed' })
    .eq('id', meeting.availability_b_id);
  
  console.log('成功标记会面完成');
  return updatedMeeting;
}

/**
 * 删除用户的可用时间段
 * @param availabilityId availability ID
 * @param userId 用户ID（用于验证权限）
 */
export async function deleteAvailability(
  availabilityId: string,
  userId: string
): Promise<void> {
  console.log('删除可用时间段:', availabilityId, userId);
  
  // 获取availability信息
  const { data: availability, error: fetchError } = await supabase
    .from('user_availability')
    .select('*')
    .eq('id', availabilityId)
    .single();
  
  if (fetchError || !availability) {
    throw new Error('Availability not found');
  }
  
  // 验证权限
  if (availability.user_id !== userId) {
    throw new Error('Unauthorized');
  }
  
  // 只能删除available状态的时间段
  if (availability.status !== 'available') {
    throw new Error('Can only delete available time slots');
  }
  
  // 删除
  const { error: deleteError } = await supabase
    .from('user_availability')
    .delete()
    .eq('id', availabilityId);
  
  if (deleteError) {
    console.error('Error deleting availability:', deleteError);
    throw deleteError;
  }
  
  console.log('成功删除时间段');
}

