import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Calendar,
  Clock,
  Video,
  X,
  Check,
  ExternalLink,
  UserPlus,
  UserX,
  MessageSquare,
} from 'lucide-react';
import type { ScheduledMeetingWithUsers } from '../lib/supabase';
import { formatFullDateTime } from '../lib/timeUtils';

interface ScheduledMeetingCardProps {
  meeting: ScheduledMeetingWithUsers;
  currentUserId: string;
  onCancel?: (meetingId: string) => void;
  onComplete?: (meetingId: string) => void;
  onAnalyze?: (meeting: ScheduledMeetingWithUsers) => void;
  // 新增好友和黑名单相关
  onAddFriend?: (userId: string, meetingId: string) => void;
  onIgnoreUser?: (userId: string, meetingId: string) => void;
  friendshipStatus?: 'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected';
  isBlocked?: boolean;
}

const statusConfig = {
  scheduled: { label: '即将进行', color: 'bg-blue-500', variant: 'default' as const },
  completed: { label: '已完成', color: 'bg-green-500', variant: 'secondary' as const },
  cancelled: { label: '已取消', color: 'bg-gray-500', variant: 'secondary' as const },
  no_show: { label: '未出现', color: 'bg-red-500', variant: 'destructive' as const },
};

export function ScheduledMeetingCard({
  meeting,
  currentUserId,
  onCancel,
  onComplete,
  onAnalyze,
  onAddFriend,
  onIgnoreUser,
  friendshipStatus,
  isBlocked,
}: ScheduledMeetingCardProps) {
  const navigate = useNavigate();
  
  // 确定对方用户
  const otherUser =
    meeting.user_a_id === currentUserId ? meeting.user_b : meeting.user_a;

  const statusInfo = statusConfig[meeting.status];

  const matchScore = meeting.match_score
    ? Math.round(meeting.match_score)
    : null;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* 头部 - 对方用户信息 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar 
              className="h-16 w-16 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => navigate(`/profile/${otherUser.id}`)}
            >
              <AvatarImage src={otherUser.avatar_url} />
              <AvatarFallback>
                {otherUser.first_name[0]}
                {otherUser.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 
                className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate(`/profile/${otherUser.id}`)}
              >
                {otherUser.first_name} {otherUser.last_name}
              </h3>
              {otherUser.city && (
                <p className="text-sm text-muted-foreground">
                  {otherUser.city}
                </p>
              )}
              {matchScore !== null && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-sm font-medium text-primary">
                    匹配度: {matchScore}%
                  </div>
                </div>
              )}
            </div>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>

        {/* 简介 */}
        {otherUser.intro && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {otherUser.intro}
          </p>
        )}

        {/* 会面信息 */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              {formatFullDateTime(
                meeting.meeting_date,
                meeting.meeting_time,
                meeting.duration
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{meeting.duration} 分钟</span>
          </div>
          {meeting.meeting_link && meeting.status === 'scheduled' && (
            <div className="flex items-center gap-2 text-sm">
              <Video className="w-4 h-4 text-muted-foreground" />
              <a
                href={meeting.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                加入会议
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {meeting.status === 'scheduled' && (
          <div className="flex gap-2 pt-2 border-t">
            {onComplete && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onComplete(meeting.id)}
                className="flex-1 gap-2"
              >
                <Check className="w-4 h-4" />
                标记完成
              </Button>
            )}
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(meeting.id)}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                取消会面
              </Button>
            )}
          </div>
        )}

        {meeting.status === 'completed' && (onAddFriend || onIgnoreUser || onAnalyze) && (
          <div className="pt-2 border-t space-y-2">
            {/* 好友和忽略操作 */}
            {(onAddFriend || onIgnoreUser) && (
              <div className="flex gap-2">
                {/* 添加好友按钮 */}
                {onAddFriend && (
                  <Button
                    variant={friendshipStatus === 'pending_received' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onAddFriend(otherUser.id, meeting.id)}
                    disabled={
                      friendshipStatus === 'accepted' ||
                      friendshipStatus === 'pending_sent' ||
                      isBlocked
                    }
                    className="flex-1 gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {friendshipStatus === 'accepted' && '已是好友'}
                    {friendshipStatus === 'pending_sent' && '已发送请求'}
                    {friendshipStatus === 'pending_received' && '接受好友'}
                    {(!friendshipStatus || friendshipStatus === 'none' || friendshipStatus === 'rejected') && '添加好友'}
                  </Button>
                )}

                {/* 忽略按钮 */}
                {onIgnoreUser && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onIgnoreUser(otherUser.id, meeting.id)}
                    disabled={isBlocked || friendshipStatus === 'accepted'}
                    className="gap-2"
                  >
                    <UserX className="w-4 h-4" />
                    {isBlocked ? '已忽略' : '忽略ta'}
                  </Button>
                )}
              </div>
            )}

            {/* 状态提示 */}
            {friendshipStatus === 'accepted' && (
              <Badge variant="secondary" className="w-full justify-center">
                ✓ 已是好友
              </Badge>
            )}
            {isBlocked && (
              <Badge variant="secondary" className="w-full justify-center">
                已忽略此用户
              </Badge>
            )}

            {/* 分析会议记录按钮 */}
            {onAnalyze && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAnalyze(meeting)}
                className="w-full gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                分析会议记录
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

