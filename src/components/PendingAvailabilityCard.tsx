import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Trash2 } from 'lucide-react';
import type { UserAvailability } from '../lib/supabase';
import { formatDateTime } from '../lib/timeUtils';

interface PendingAvailabilityCardProps {
  slot: UserAvailability;
  onDelete: (slotId: string) => void;
}

export function PendingAvailabilityCard({ slot, onDelete }: PendingAvailabilityCardProps) {
  return (
    <Card className="p-3 bg-card border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium">
              {formatDateTime(slot.date, slot.time_slot, slot.duration)}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
            Waiting for match
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(slot.id)}
          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          title="Delete time slot"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

