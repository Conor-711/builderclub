import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, Eye } from 'lucide-react';
import type { UserAvailability } from '../lib/supabase';
import {
  groupByDate,
  sortTimeSlots,
  getFriendlyDate,
  getWeekday,
  formatFullDateTime,
} from '../lib/timeUtils';

interface AvailabilityListProps {
  slots: UserAvailability[];
  onDelete?: (slotId: string) => void;
  onViewMeeting?: (slotId: string) => void;
}

const statusConfig = {
  available: { label: '可用', color: 'bg-green-500' },
  scheduled: { label: '已安排', color: 'bg-blue-500' },
  completed: { label: '已完成', color: 'bg-gray-500' },
  cancelled: { label: '已取消', color: 'bg-red-500' },
};

export function AvailabilityList({
  slots,
  onDelete,
  onViewMeeting,
}: AvailabilityListProps) {
  if (slots.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>还没有可用时间段</p>
        <p className="text-sm mt-2">添加一些时间段来开始匹配</p>
      </Card>
    );
  }

  const sortedSlots = sortTimeSlots(slots);
  const groupedSlots = groupByDate(sortedSlots);
  const dates = Object.keys(groupedSlots).sort();

  return (
    <div className="space-y-6">
      {dates.map((date) => {
        const slotsForDate = groupedSlots[date];
        const friendlyDate = getFriendlyDate(date);
        const weekday = getWeekday(date);

        return (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{friendlyDate}</h3>
              <span className="text-sm text-muted-foreground">{weekday}</span>
            </div>

            <div className="space-y-2">
              {slotsForDate.map((slot) => {
                const config = statusConfig[slot.status];

                return (
                  <Card
                    key={slot.id}
                    className="p-4 flex items-center justify-between hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-2 h-2 rounded-full ${config.color}`} />
                      <div className="flex-1">
                        <div className="font-medium">
                          {slot.time_slot} ({slot.duration}分钟)
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatFullDateTime(slot.date, slot.time_slot, slot.duration)}
                        </div>
                      </div>
                      <Badge variant="secondary">{config.label}</Badge>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {slot.status === 'scheduled' && onViewMeeting && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewMeeting(slot.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          查看会面
                        </Button>
                      )}

                      {slot.status === 'available' && onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(slot.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

