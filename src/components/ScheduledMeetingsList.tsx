import { useEffect, useState } from 'react';
import { ScheduledMeetingCard } from './ScheduledMeetingCard';
import { Card } from './ui/card';
import { Loader2 } from 'lucide-react';
import type { ScheduledMeetingWithUsers, MeetingStatus } from '../lib/supabase';
import {
  getUserScheduledMeetings,
  cancelMeeting,
  completeMeeting,
} from '../services/timeMatchingService';
import {
  sendFriendRequest,
  acceptFriendRequest,
  checkFriendshipStatus,
} from '../services/friendshipService';
import { blockUser, isBlocked } from '../services/blockService';
import { toast } from '../hooks/use-toast';

interface ScheduledMeetingsListProps {
  userId: string;
  status?: MeetingStatus;
  onMeetingComplete?: () => void;
  onAnalyzeMeeting?: (meeting: ScheduledMeetingWithUsers) => void;
}

export function ScheduledMeetingsList({
  userId,
  status,
  onMeetingComplete,
  onAnalyzeMeeting,
}: ScheduledMeetingsListProps) {
  const [meetings, setMeetings] = useState<ScheduledMeetingWithUsers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friendshipStatuses, setFriendshipStatuses] = useState<Map<string, any>>(new Map());
  const [blockStatuses, setBlockStatuses] = useState<Set<string>>(new Set());

  const loadMeetings = async () => {
    try {
      setIsLoading(true);
      const data = await getUserScheduledMeetings(userId, status);
      setMeetings(data);

      // 如果是已完成的会议，加载好友和黑名单状态
      if (status === 'completed' && data.length > 0) {
        const otherUserIds = data.map(m => 
          m.user_a_id === userId ? m.user_b_id : m.user_a_id
        );

        // 批量检查好友状态
        const friendshipStatusMap = new Map();
        for (const otherId of otherUserIds) {
          try {
            const statusResult = await checkFriendshipStatus(userId, otherId);
            friendshipStatusMap.set(otherId, statusResult);
          } catch (error) {
            console.error(`Error checking friendship status for ${otherId}:`, error);
          }
        }
        setFriendshipStatuses(friendshipStatusMap);

        // 批量检查黑名单状态
        const blockChecks = await Promise.all(
          otherUserIds.map(otherId => 
            isBlocked(userId, otherId).catch(() => false)
          )
        );
        const blockedSet = new Set(
          otherUserIds.filter((_, index) => blockChecks[index])
        );
        setBlockStatuses(blockedSet);
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast({
        title: '加载失败',
        description: '无法加载会面列表',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, [userId, status]);

  const handleCancel = async (meetingId: string) => {
    if (!confirm('确定要取消这个会面吗？')) return;

    try {
      await cancelMeeting(meetingId, userId);
      toast({
        title: '已取消',
        description: '会面已成功取消',
      });
      loadMeetings();
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      toast({
        title: '取消失败',
        description: '无法取消会面，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async (meetingId: string) => {
    try {
      await completeMeeting(meetingId, userId);
      toast({
        title: '已完成',
        description: '会面已标记为完成',
      });
      loadMeetings();
      onMeetingComplete?.();
    } catch (error) {
      console.error('Error completing meeting:', error);
      toast({
        title: '操作失败',
        description: '无法标记会面完成，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleAddFriend = async (otherUserId: string, meetingId: string) => {
    try {
      const friendshipStatus = friendshipStatuses.get(otherUserId);
      
      if (friendshipStatus?.status === 'pending_received') {
        // 如果是接受对方的请求
        await acceptFriendRequest(friendshipStatus.friendship.id, userId);
        toast({
          title: '已接受好友请求',
          description: '你们现在是好友了',
        });
      } else {
        // 发送新请求
        await sendFriendRequest(userId, otherUserId, meetingId);
        toast({
          title: '好友请求已发送',
          description: '等待对方接受',
        });
      }
      
      loadMeetings(); // 刷新以更新状态
    } catch (error: any) {
      console.error('Error adding friend:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法发送好友请求',
        variant: 'destructive',
      });
    }
  };

  const handleIgnoreUser = async (otherUserId: string, meetingId: string) => {
    if (!confirm('确定要忽略此用户吗？\n\n• 你将不再匹配到此用户\n• 对方也不会匹配到你\n• 此操作不可撤销')) {
      return;
    }
    
    try {
      await blockUser(userId, otherUserId, 'ignored_after_meeting', meetingId);
      toast({
        title: '已忽略',
        description: '你将不再匹配到此用户',
      });
      
      loadMeetings(); // 刷新以更新状态
    } catch (error: any) {
      console.error('Error ignoring user:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法忽略用户',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (meetings.length === 0) {
    const emptyMessage = status === 'scheduled'
      ? '还没有即将进行的会面'
      : status === 'completed'
      ? '还没有已完成的会面'
      : '还没有会面记录';

    return (
      <Card className="p-12 text-center text-muted-foreground">
        <p>{emptyMessage}</p>
        {status === 'scheduled' && (
          <p className="text-sm mt-2">添加可用时间来开始匹配</p>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 会议卡片列表 */}
      {meetings.map((meeting) => {
        const otherId = meeting.user_a_id === userId ? meeting.user_b_id : meeting.user_a_id;
        return (
          <ScheduledMeetingCard
            key={meeting.id}
            meeting={meeting}
            currentUserId={userId}
            onCancel={status === 'scheduled' ? handleCancel : undefined}
            onComplete={status === 'scheduled' ? handleComplete : undefined}
            onAddFriend={status === 'completed' ? handleAddFriend : undefined}
            onIgnoreUser={status === 'completed' ? handleIgnoreUser : undefined}
            onAnalyze={status === 'completed' ? onAnalyzeMeeting : undefined}
            friendshipStatus={friendshipStatuses.get(otherId)?.status}
            isBlocked={blockStatuses.has(otherId)}
          />
        );
      })}
    </div>
  );
}

