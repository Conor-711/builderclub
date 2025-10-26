import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Clock, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import {
  type TimePeriod,
  TIME_PERIOD_LABELS,
  TIME_PERIOD_ICONS,
  getInitialTimeForPeriod,
  getNextTimeInPeriod,
  getPreviousTimeInPeriod,
} from '../lib/timeUtils';

interface TimeRefinementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: TimePeriod | null;
  onTimeConfirmed: (time: string) => void;
}

export function TimeRefinementDialog({
  open,
  onOpenChange,
  period,
  onTimeConfirmed,
}: TimeRefinementDialogProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [canGoEarlier, setCanGoEarlier] = useState(false);
  const [canGoLater, setCanGoLater] = useState(false);

  useEffect(() => {
    if (open && period) {
      const initialTime = getInitialTimeForPeriod(period);
      setCurrentTime(initialTime);
      updateNavigation(period, initialTime);
    }
  }, [open, period]);

  const updateNavigation = (timePeriod: TimePeriod, time: string) => {
    const earlier = getPreviousTimeInPeriod(timePeriod, time);
    const later = getNextTimeInPeriod(timePeriod, time);
    setCanGoEarlier(earlier !== null);
    setCanGoLater(later !== null);
  };

  const handleEarlier = () => {
    if (period) {
      const earlierTime = getPreviousTimeInPeriod(period, currentTime);
      if (earlierTime) {
        setCurrentTime(earlierTime);
        updateNavigation(period, earlierTime);
      }
    }
  };

  const handleLater = () => {
    if (period) {
      const laterTime = getNextTimeInPeriod(period, currentTime);
      if (laterTime) {
        setCurrentTime(laterTime);
        updateNavigation(period, laterTime);
      }
    }
  };

  const handleAccept = () => {
    onTimeConfirmed(currentTime);
    onOpenChange(false);
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!period) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="w-5 h-5" />
            Refine Your Time
          </DialogTitle>
          <DialogDescription>
            You selected <span className="font-semibold">{TIME_PERIOD_ICONS[period]} {TIME_PERIOD_LABELS[period]}</span>. 
            Please confirm a specific time.
          </DialogDescription>
        </DialogHeader>

        <div className="py-8">
          {/* 时间显示 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
              <div className="text-4xl font-bold text-primary">
                {currentTime}
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              {formatTime(currentTime)}
            </p>
          </div>

          {/* 问题 */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-foreground">
              Can you meet at {formatTime(currentTime)}?
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            {/* 接受按钮 */}
            <Button
              onClick={handleAccept}
              className="w-full h-12 text-base gap-2"
              size="lg"
            >
              <Check className="w-5 h-5" />
              Yes, I can accept
            </Button>

            {/* 早一点和晚一点按钮 */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleEarlier}
                disabled={!canGoEarlier}
                className="h-12 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Earlier
              </Button>
              <Button
                variant="outline"
                onClick={handleLater}
                disabled={!canGoLater}
                className="h-12 gap-2"
              >
                Later
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              {!canGoEarlier && !canGoLater && 'This is the only available time in this period'}
              {canGoEarlier && !canGoLater && 'This is the latest time in this period'}
              {!canGoEarlier && canGoLater && 'This is the earliest time in this period'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

