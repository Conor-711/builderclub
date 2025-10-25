import { supabase, MeetingRecord, MeetingInsight } from '@/lib/supabase';
import { analyzeMeetingTranscript, updateUserProfileWithInsights } from './aiService';

/**
 * 创建会议记录
 */
export async function createMeetingRecord(
  userId: string,
  transcript: string,
  participantName?: string,
  meetingDate?: Date,
  connectionId?: string
): Promise<MeetingRecord> {
  try {
    const { data, error } = await supabase
      .from('meeting_records')
      .insert({
        user_id: userId,
        transcript,
        participant_name: participantName,
        meeting_date: meetingDate?.toISOString(),
        connection_id: connectionId,
        ai_model: import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat',
      })
      .select()
      .single();

    if (error) throw error;

    return data as MeetingRecord;
  } catch (error) {
    console.error('Error creating meeting record:', error);
    throw error;
  }
}

/**
 * 分析会议并返回insights
 */
export async function analyzeMeeting(
  userId: string,
  transcript: string,
  participantName?: string
): Promise<{ insights: any[]; summary: string }> {
  try {
    const result = await analyzeMeetingTranscript(userId, transcript, participantName);
    return result;
  } catch (error) {
    console.error('Error analyzing meeting:', error);
    throw error;
  }
}

/**
 * 保存会议insights
 */
export async function saveMeetingInsights(
  meetingRecordId: string,
  userId: string,
  insights: Array<{
    text: string;
    category?: string;
    order: number;
  }>
): Promise<MeetingInsight[]> {
  try {
    // 删除该会议的旧insights
    await supabase
      .from('meeting_insights')
      .delete()
      .eq('meeting_record_id', meetingRecordId);

    // 插入新insights
    const insightsToInsert = insights.map(insight => ({
      meeting_record_id: meetingRecordId,
      user_id: userId,
      insight_text: insight.text,
      insight_order: insight.order,
      category: insight.category,
      is_active: true,
    }));

    const { data, error } = await supabase
      .from('meeting_insights')
      .insert(insightsToInsert)
      .select();

    if (error) throw error;

    // 触发用户画像更新（后台异步执行）
    updateUserProfileWithInsights(userId).catch(err => {
      console.error('Failed to update user profile with insights:', err);
    });

    return data as MeetingInsight[];
  } catch (error) {
    console.error('Error saving meeting insights:', error);
    throw error;
  }
}

/**
 * 获取用户的所有会议记录
 */
export async function getMeetingRecords(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<MeetingRecord[]> {
  try {
    const { data, error } = await supabase
      .from('meeting_records')
      .select('*')
      .eq('user_id', userId)
      .order('meeting_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data as MeetingRecord[];
  } catch (error) {
    console.error('Error fetching meeting records:', error);
    throw error;
  }
}

/**
 * 获取指定会议的所有insights
 */
export async function getMeetingInsights(
  meetingRecordId: string
): Promise<MeetingInsight[]> {
  try {
    const { data, error } = await supabase
      .from('meeting_insights')
      .select('*')
      .eq('meeting_record_id', meetingRecordId)
      .eq('is_active', true)
      .order('insight_order', { ascending: true });

    if (error) throw error;

    return data as MeetingInsight[];
  } catch (error) {
    console.error('Error fetching meeting insights:', error);
    throw error;
  }
}

/**
 * 更新insight的顺序
 */
export async function updateInsightOrder(
  insightId: string,
  newOrder: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('meeting_insights')
      .update({ insight_order: newOrder })
      .eq('id', insightId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating insight order:', error);
    throw error;
  }
}

/**
 * 批量更新insights的顺序
 */
export async function updateInsightsOrder(
  insights: Array<{ id: string; order: number }>
): Promise<void> {
  try {
    const promises = insights.map(insight =>
      supabase
        .from('meeting_insights')
        .update({ insight_order: insight.order })
        .eq('id', insight.id)
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('Error updating insights order:', error);
    throw error;
  }
}

/**
 * 删除或停用insight
 */
export async function deleteInsight(insightId: string): Promise<void> {
  try {
    // 软删除：设置is_active为false
    const { error } = await supabase
      .from('meeting_insights')
      .update({ is_active: false })
      .eq('id', insightId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting insight:', error);
    throw error;
  }
}

/**
 * 永久删除insight
 */
export async function permanentlyDeleteInsight(insightId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('meeting_insights')
      .delete()
      .eq('id', insightId);

    if (error) throw error;
  } catch (error) {
    console.error('Error permanently deleting insight:', error);
    throw error;
  }
}

/**
 * 删除会议记录（级联删除insights）
 */
export async function deleteMeetingRecord(meetingRecordId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('meeting_records')
      .delete()
      .eq('id', meetingRecordId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting meeting record:', error);
    throw error;
  }
}

/**
 * 获取用户的所有insights（跨会议）
 */
export async function getAllUserInsights(
  userId: string,
  activeOnly: boolean = true
): Promise<MeetingInsight[]> {
  try {
    let query = supabase
      .from('meeting_insights')
      .select('*')
      .eq('user_id', userId);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data as MeetingInsight[];
  } catch (error) {
    console.error('Error fetching user insights:', error);
    throw error;
  }
}

