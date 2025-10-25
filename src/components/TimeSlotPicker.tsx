import { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card } from './ui/card';
import { X, Plus } from 'lucide-react';
import type { TimeSlot } from '../lib/supabase';
import {
  generateTimeOptions,
  formatDateTime,
  formatDate,
  isTodayOrFuture,
} from '../lib/timeUtils';

// 固定时长为 15 分钟
const FIXED_DURATION = 15;

interface TimeSlotPickerProps {
  selectedSlots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  maxSlots?: number;
}

export function TimeSlotPicker({
  selectedSlots,
  onSlotsChange,
  maxSlots = 5,
}: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('10:00');

  const timeOptions = generateTimeOptions();

  const handleAddSlot = () => {
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    if (selectedSlots.length >= maxSlots) {
      alert(`You can only select ${maxSlots} time slots per day`);
      return;
    }

    const dateString = formatDate(selectedDate);

    if (!isTodayOrFuture(dateString)) {
      alert('You cannot select a past date');
      return;
    }

    // 检查是否已经添加了相同的时间段
    const duplicate = selectedSlots.find(
      slot =>
        slot.date === dateString &&
        slot.time === selectedTime
    );

    if (duplicate) {
      alert('This time slot has already been added');
      return;
    }

    const newSlot: TimeSlot = {
      date: dateString,
      time: selectedTime,
      duration: FIXED_DURATION, // Use fixed duration
    };

    onSlotsChange([...selectedSlots, newSlot]);
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = selectedSlots.filter((_, i) => i !== index);
    onSlotsChange(newSlots);
  };

  return (
    <div className="space-y-6">
      {/* 选择区域 */}
      <div className="space-y-4">
        <div>
          <Label>Select Date</Label>
          <div className="mt-2 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="rounded-md border"
            />
          </div>
        </div>

        <div>
          <Label>Select Time</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAddSlot}
          disabled={selectedSlots.length >= maxSlots || !selectedDate}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Time Slot
        </Button>
      </div>

      {/* 已选择的时间段 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Selected Time Slots</Label>
          <span className="text-sm text-muted-foreground">
            {selectedSlots.length}/{maxSlots}
          </span>
        </div>

        {selectedSlots.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">
            No time slots selected
          </Card>
        ) : (
          <div className="space-y-2">
            {selectedSlots.map((slot, index) => (
              <Card
                key={index}
                className="p-3 flex items-center justify-between hover:bg-accent transition-colors"
              >
                <span className="text-sm font-medium">
                  {formatDateTime(slot.date, slot.time, slot.duration)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSlot(index)}
                  className="h-8 w-8 p-0"
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

