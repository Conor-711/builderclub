import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar, Clock } from 'lucide-react';
import type { ScheduledMeetingWithUsers } from '../lib/supabase';

interface CompactMeetingCardProps {
  meeting: ScheduledMeetingWithUsers;
  currentUserId: string;
}

export function CompactMeetingCard({ meeting, currentUserId }: CompactMeetingCardProps) {
  // 确定对方用户
  const otherUser =
    meeting.user_a_id === currentUserId ? meeting.user_b : meeting.user_a;

  // 格式化日期时间
  const formatMeetingDateTime = (date: string, time: string) => {
    const d = new Date(date + 'T' + time);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="p-3 bg-card border-l-4 border-l-primary hover:shadow-md transition-shadow cursor-pointer">
      <div className="space-y-2">
        {/* 用户信息 */}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={otherUser.avatar_url} />
            <AvatarFallback className="text-xs">
              {otherUser.first_name[0]}{otherUser.last_name?.[0] || ''}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate">
            {otherUser.first_name} {otherUser.last_name}
          </span>
        </div>

        {/* 会面时间 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>{formatMeetingDateTime(meeting.meeting_date, meeting.meeting_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{meeting.duration} minutes</span>
          </div>
        </div>

        {/* 状态标签 */}
        <Badge variant="default" className="text-xs">
          Scheduled
        </Badge>
      </div>
    </Card>
  );
}

