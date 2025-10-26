import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../lib/timeUtils';

interface WeekCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date) => void;
}

export function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day; // 调整到周日
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  });

  const getWeekDays = (startDate: Date): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays(currentWeekStart);

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const isPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return formatDate(date) === formatDate(selectedDate);
  };

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMonthDisplay = () => {
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    const firstMonth = firstDay.toLocaleDateString('en-US', { month: 'short' });
    const lastMonth = lastDay.toLocaleDateString('en-US', { month: 'short' });
    const year = firstDay.getFullYear();

    if (firstMonth === lastMonth) {
      return `${firstMonth} ${year}`;
    } else {
      return `${firstMonth} - ${lastMonth} ${year}`;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2">
      <div className="space-y-4">
        {/* 头部：月份显示和导航 */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousWeek}
            className="hover:bg-primary/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground">
              {getMonthDisplay()}
            </h3>
            <p className="text-xs text-muted-foreground">Select a date</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextWeek}
            className="hover:bg-primary/10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* 周历网格 */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, index) => {
            const disabled = isPast(date);
            const selected = isSelected(date);
            const today = isToday(date);

            return (
              <button
                key={index}
                onClick={() => !disabled && onSelectDate(date)}
                disabled={disabled}
                className={`
                  relative p-3 rounded-lg transition-all duration-200
                  flex flex-col items-center justify-center gap-1
                  ${disabled 
                    ? 'opacity-40 cursor-not-allowed bg-muted/50' 
                    : 'hover:bg-primary/20 hover:scale-105 cursor-pointer'
                  }
                  ${selected 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105 ring-2 ring-primary ring-offset-2' 
                    : 'bg-background'
                  }
                  ${today && !selected
                    ? 'ring-2 ring-primary/50'
                    : ''
                  }
                `}
              >
                <span className={`text-xs font-medium ${selected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {weekdayNames[index]}
                </span>
                <span className={`text-lg font-bold ${selected ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {date.getDate()}
                </span>
                {today && !selected && (
                  <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 今天快捷按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            onSelectDate(today);
            setCurrentWeekStart(() => {
              const day = today.getDay();
              const diff = today.getDate() - day;
              const weekStart = new Date(today);
              weekStart.setDate(diff);
              weekStart.setHours(0, 0, 0, 0);
              return weekStart;
            });
          }}
          className="w-full"
        >
          Jump to Today
        </Button>
      </div>
    </Card>
  );
}

