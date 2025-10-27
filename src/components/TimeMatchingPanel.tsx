import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Loader2 } from 'lucide-react';
import { TimeSlotPicker } from './TimeSlotPicker';
import type { TimeSlot } from '../lib/supabase';
import {
  saveUserAvailability,
} from '../services/timeMatchingService';
import { toast } from '../hooks/use-toast';

interface TimeMatchingPanelProps {
  userId: string;
  sameCityFilter?: string;
  stageFilter?: string | null;
  isDemoMode?: boolean;
  onSuccess?: () => void;
  onDemoSlotSaved?: (slot: TimeSlot) => void;
}

export function TimeMatchingPanel({ 
  userId, 
  isDemoMode = false,
  onSuccess,
  onDemoSlotSaved,
}: TimeMatchingPanelProps) {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDemoMessage, setShowDemoMessage] = useState(false);

  const handleSaveTimeSlots = async () => {
    if (selectedSlots.length === 0) {
      toast({
        title: 'Please select time slots',
        description: 'Add at least one available time slot',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (isDemoMode) {
        // Demo模式：纯前端模拟，不保存到数据库
        setShowDemoMessage(true);
        toast({
          title: '✓ Time slots saved',
          description: 'Demo: Finding match... (will confirm in 5 seconds)',
        });
        
        // 通知父组件保存时间段（父组件处理pending和confirmed状态转换）
        const firstSlot = selectedSlots[0];
        if (onDemoSlotSaved) {
          onDemoSlotSaved(firstSlot);
          
          // 5秒后显示成功提示
          setTimeout(() => {
            toast({
              title: '🎉 Demo Match Found!',
              description: 'Your meeting has been confirmed',
            });
          }, 5000);
        }
        
        // 重置选择
        setSelectedSlots([]);
        setIsProcessing(false);
      } else {
        // 正常模式：保存到数据库
        await saveUserAvailability(userId, selectedSlots);
        // 正常模式
        toast({
          title: 'Time slots saved',
          description: 'We will match you with suitable people and notify you by email',
        });
        
        // 重置选择
        setSelectedSlots([]);
        
        // 触发刷新回调
        onSuccess?.();
        setIsProcessing(false);
      }

    } catch (error: any) {
      console.error('Error saving time slots:', error);
      toast({
        title: 'Save failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            Select Available Time
            {isDemoMode && (
              <span className="text-sm font-normal px-2 py-1 bg-foreground text-background rounded">
                Demo Mode
              </span>
            )}
          </h2>
        </div>

        {/* Demo 成功提示 */}


        {/* 时间选择器 */}
        <TimeSlotPicker
          selectedSlots={selectedSlots}
          onSlotsChange={setSelectedSlots}
        />

        {/* 保存按钮 */}
        <div className="flex justify-end gap-3">
          {selectedSlots.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setSelectedSlots([])}
              disabled={isProcessing}
            >
              Clear Selection
            </Button>
          )}
          <Button
            onClick={handleSaveTimeSlots}
            disabled={selectedSlots.length === 0 || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              `Save ${selectedSlots.length} Time Slot${selectedSlots.length > 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
