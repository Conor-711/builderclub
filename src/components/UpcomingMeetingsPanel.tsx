import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Calendar, Clock, Video, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { supabase } from '../lib/supabase';
import type { UserAvailability, ScheduledMeetingWithUsers } from '../lib/supabase';
import { PendingAvailabilityCard } from './PendingAvailabilityCard';
import { CompactMeetingCard } from './CompactMeetingCard';
import { toast } from '../hooks/use-toast';
import type { DemoMeeting, DemoSlot, DemoPartner } from '../pages/Connections';

interface UpcomingMeetingsPanelProps {
  userId: string;
  isDemoMode?: boolean;
  demoPendingSlots?: DemoSlot[];
  demoMeetings?: DemoMeeting[];
  onDeleteDemoPending?: (slotId: string) => void;
}

export function UpcomingMeetingsPanel({ 
  userId, 
  isDemoMode = false,
  demoPendingSlots = [],
  demoMeetings = [],
  onDeleteDemoPending,
}: UpcomingMeetingsPanelProps) {
  const navigate = useNavigate();
  const [pendingSlots, setPendingSlots] = useState<UserAvailability[]>([]);
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeetingWithUsers[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // 格式化简短日期时间
  const formatShortDateTime = (date: string, time: string) => {
    const d = new Date(date + 'T' + time);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Load both queries with timeouts
      const [slotsResult, meetingsResult] = await Promise.allSettled([
        // 获取待匹配的时间段 (with 5s timeout)
        supabase
        .from('user_availability')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'available')
        .order('date', { ascending: true })
          .order('time_slot', { ascending: true })
          .abortSignal(AbortSignal.timeout(5000)),
        
        // 获取已确认的会面 (with 8s timeout, more complex query)
        supabase
        .from('scheduled_meetings')
        .select(`
          *,
          user_a:users!scheduled_meetings_user_a_id_fkey(*),
          user_b:users!scheduled_meetings_user_b_id_fkey(*)
        `)
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
        .eq('status', 'scheduled')
        .order('meeting_date', { ascending: true })
          .order('meeting_time', { ascending: true })
          .abortSignal(AbortSignal.timeout(8000))
      ]);

      // Handle pending slots result
      if (slotsResult.status === 'fulfilled') {
        const { data: slots, error: slotsError } = slotsResult.value;
        if (slotsError) {
          console.error('Error fetching pending slots:', slotsError);
          setPendingSlots([]);
        } else {
          setPendingSlots(slots || []);
        }
      } else {
        console.error('Failed to load pending slots:', slotsResult.reason);
        setPendingSlots([]);
      }

      // Handle scheduled meetings result
      if (meetingsResult.status === 'fulfilled') {
        const { data: meetings, error: meetingsError } = meetingsResult.value;
      if (meetingsError) {
        console.error('Error fetching scheduled meetings:', meetingsError);
          setScheduledMeetings([]);
        } else {
          setScheduledMeetings(meetings || []);
        }
      } else {
        console.error('Failed to load scheduled meetings:', meetingsResult.reason);
        setScheduledMeetings([]);
      }

    } catch (error) {
      console.error('Error in fetchData:', error);
      setPendingSlots([]);
      setScheduledMeetings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('user_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Time slot has been removed',
      });

      // 刷新列表
      fetchData();
    } catch (error: any) {
      console.error('Error deleting slot:', error);
      toast({
        title: 'Delete failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Upcoming Meetings</h2>

      {/* Section 1: 待匹配的时间段 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Pending Matches
        </h3>
        {(isDemoMode ? demoPendingSlots.length === 0 : pendingSlots.length === 0) ? (
          <Card className="p-4 text-center text-sm text-muted-foreground">
            No pending time slots
          </Card>
        ) : (
          <>
            {/* Demo模式：显示前端pending slots */}
            {isDemoMode && demoPendingSlots.map(slot => (
              <Card key={slot.id} className="p-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>{formatShortDateTime(slot.date, slot.time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{slot.duration} min</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteDemoPending?.(slot.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            
            {/* 正常模式：显示数据库pending slots */}
            {!isDemoMode && pendingSlots.map(slot => (
              <PendingAvailabilityCard
                key={slot.id}
                slot={slot}
                onDelete={handleDeleteSlot}
              />
            ))}
          </>
        )}
      </div>

      {/* Section 2: 已确认的会面 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Confirmed Meetings
        </h3>
        {scheduledMeetings.length === 0 && demoMeetings.length === 0 ? (
          <Card className="p-4 text-center text-sm text-muted-foreground">
            No confirmed meetings yet
          </Card>
        ) : (
          <>
            {/* 显示真实会面 */}
            {scheduledMeetings.map(meeting => (
              <CompactMeetingCard
                key={meeting.id}
                meeting={meeting}
                currentUserId={userId}
              />
            ))}
            
            {/* 显示Demo模拟会面 */}
            {demoMeetings.map(demoMeeting => (
              <Card key={demoMeeting.id} className="p-4 bg-card border-l-4 border-l-primary hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* 会议参与者标题 */}
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Meeting Attendees ({demoMeeting.partners.length + 1} people)
                  </div>

                  {/* 参与者列表 */}
                  <div className="space-y-2">
                    {demoMeeting.partners.map((partner, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                        <Avatar className="w-9 h-9 border-2 border-background">
                          <AvatarImage src={partner.avatar} />
                          <AvatarFallback className="text-xs">
                            {partner.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {partner.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="font-medium">Good at:</span>
                            <span>{partner.goodAt}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 分隔线 */}
                  <div className="border-t border-border"></div>

                  {/* 会面时间 */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>{formatMeetingDateTime(demoMeeting.date, demoMeeting.time)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{demoMeeting.duration} minutes</span>
                    </div>
                  </div>

                  {/* 状态标签 */}
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      Scheduled
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-foreground/10">
                      Demo
                    </Badge>
                  </div>

                  {/* 加入会议按钮 */}
                  <Button 
                    className="w-full gap-2" 
                    size="sm"
                    onClick={() => {
                      navigate('/meeting-loading', {
                        state: {
                          partners: demoMeeting.partners,
                          meetingTime: `${demoMeeting.date} ${demoMeeting.time}`
                        }
                      });
                    }}
                  >
                    <Video className="w-4 h-4" />
                    Join Meeting
                  </Button>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

