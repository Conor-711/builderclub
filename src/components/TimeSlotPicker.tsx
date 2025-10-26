import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { X, Plus } from 'lucide-react';
import type { TimeSlot } from '../lib/supabase';
import {
  formatDateTime,
  formatDate,
  isTodayOrFuture,
  type TimePeriod,
  TIME_PERIOD_LABELS,
  TIME_PERIOD_ICONS,
} from '../lib/timeUtils';
import { WeekCalendar } from './WeekCalendar';
import { TimeRefinementDialog } from './TimeRefinementDialog';

// 固定时长为 30 分钟
const FIXED_DURATION = 30;

interface TimeSlotPickerProps {
  selectedSlots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  maxSlots?: number;
}

const TIME_PERIODS: TimePeriod[] = ['MORNING', 'NOON', 'AFTERNOON', 'EVENING'];

export function TimeSlotPicker({
  selectedSlots,
  onSlotsChange,
  maxSlots = 5,
}: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod | null>(null);
  const [showRefinementDialog, setShowRefinementDialog] = useState(false);

  const handlePeriodSelect = (period: TimePeriod) => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    if (selectedSlots.length >= maxSlots) {
      alert(`You can only select ${maxSlots} time slots`);
      return;
    }

    const dateString = formatDate(selectedDate);

    if (!isTodayOrFuture(dateString)) {
      alert('You cannot select a past date');
      return;
    }

    setSelectedPeriod(period);
    setShowRefinementDialog(true);
  };

  const handleTimeConfirmed = (time: string) => {
    if (!selectedDate) return;

    const dateString = formatDate(selectedDate);

    // 检查是否已经添加了相同的时间段
    const duplicate = selectedSlots.find(
      slot =>
        slot.date === dateString &&
        slot.time === time
    );

    if (duplicate) {
      alert('This time slot has already been added');
      return;
    }

    const newSlot: TimeSlot = {
      date: dateString,
      time: time,
      duration: FIXED_DURATION,
    };

    onSlotsChange([...selectedSlots, newSlot]);
    setSelectedPeriod(null);
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = selectedSlots.filter((_, i) => i !== index);
    onSlotsChange(newSlots);
  };

  return (
    <div className="space-y-6">
      {/* 周历选择器 */}
      <div>
        <Label className="text-base mb-3 block">Select Date</Label>
        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      {/* 时间段选择 */}
      <div>
        <Label className="text-base mb-3 block">Select Time Period</Label>
        <div className="grid grid-cols-2 gap-3">
          {TIME_PERIODS.map((period) => (
            <Button
              key={period}
              variant="outline"
              onClick={() => handlePeriodSelect(period)}
              disabled={!selectedDate || selectedSlots.length >= maxSlots}
              className="h-20 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-200"
            >
              <span className="text-2xl">{TIME_PERIOD_ICONS[period]}</span>
              <span className="text-sm font-medium">{TIME_PERIOD_LABELS[period]}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* 时间精确化对话框 */}
      <TimeRefinementDialog
        open={showRefinementDialog}
        onOpenChange={setShowRefinementDialog}
        period={selectedPeriod}
        onTimeConfirmed={handleTimeConfirmed}
      />

      {/* 已选择的时间段 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-base">Selected Time Slots</Label>
          <span className="text-sm text-muted-foreground">
            {selectedSlots.length}/{maxSlots}
          </span>
        </div>

        {selectedSlots.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            <div className="space-y-2">
              <p className="text-sm">No time slots selected yet</p>
              <p className="text-xs">Select a date and time period above to get started</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {selectedSlots.map((slot, index) => (
              <Card
                key={index}
                className="p-4 flex items-center justify-between hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">
                    {formatDateTime(slot.date, slot.time, slot.duration)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSlot(index)}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
