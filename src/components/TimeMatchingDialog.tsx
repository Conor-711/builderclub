import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Loader2, Calendar, CheckCircle, Users } from 'lucide-react';
import { TimeSlotPicker } from './TimeSlotPicker';
import type { TimeSlot, UserAvailability } from '../lib/supabase';
import {
  saveUserAvailability,
  findBestMatchesForTimeSlots,
  scheduleMeeting,
} from '../services/timeMatchingService';
import { formatDateTime } from '../lib/timeUtils';
import { toast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase';

interface TimeMatchingDialogProps {
  userId: string;
  onSuccess?: () => void; // 通用刷新回调（刷新列表但不切换 tab）
  onMeetingScheduled?: () => void; // 会面创建成功回调（刷新并切换到"即将进行"）
}

type Step = 'select' | 'matching' | 'confirm' | 'success';

interface MatchResult {
  timeSlot: TimeSlot;
  match: {
    availability: UserAvailability;
    matchScore: number;
    matchReasons: any;
    user?: any;
  } | null;
}

export function TimeMatchingDialog({ userId, onSuccess, onMeetingScheduled }: TimeMatchingDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('select');
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedMatches, setAcceptedMatches] = useState<Set<number>>(new Set());

  const handleReset = () => {
    setStep('select');
    setSelectedSlots([]);
    setMatchResults([]);
    setAcceptedMatches(new Set());
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(handleReset, 300); // 延迟重置，等待对话框关闭动画完成
  };

  const handleFindMatches = async () => {
    if (selectedSlots.length === 0) {
      toast({
        title: '请选择时间段',
        description: '至少选择一个可用时间段',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setStep('matching');

    try {
      // 1. 保存用户选择的可用时间
      const savedSlots = await saveUserAvailability(userId, selectedSlots);
      console.log('已保存可用时间:', savedSlots);
      
      // 注意：这里不调用 onSuccess，避免过早切换 tab
      // onSuccess 只在会面创建成功后调用（在 handleConfirmMatches 中）

      toast({
        title: '时间段已保存',
        description: `已保存 ${savedSlots.length} 个可用时间段`,
      });

      // 2. 为每个时间段查找最佳匹配
      const results = await findBestMatchesForTimeSlots(userId, selectedSlots);
      console.log('🔍 批量匹配结果:', results);

      // 3. 获取匹配用户的详细信息
      const resultsWithUsers = await Promise.all(
        results.map(async (result) => {
          if (result.match) {
            console.log('📝 获取用户信息:', result.match.availability.user_id);
            const { data: user, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', result.match.availability.user_id)
              .single();

            if (error) {
              console.error('❌ 获取用户信息失败:', error);
            } else {
              console.log('✅ 用户信息:', user);
            }

            return {
              ...result,
              match: {
                ...result.match,
                user,
              },
            };
          }
          return result;
        })
      );

      console.log('👥 包含用户信息的匹配结果:', resultsWithUsers);
      setMatchResults(resultsWithUsers);
      
      // 检查是否有任何匹配
      const hasMatches = resultsWithUsers.some(r => r.match !== null);
      console.log(`📊 是否有匹配: ${hasMatches}`);
      
      if (!hasMatches) {
        toast({
          title: '暂无匹配',
          description: '在这些时间段没有找到匹配用户，您可以稍后再来查看',
        });
        // 没有匹配时，刷新"我的时间"列表（不切换 tab）
        setTimeout(() => {
          onSuccess?.(); // 只刷新，不切换 tab
          handleClose();
        }, 1500);
        return;
      }
      
      // 🎯 关键修复：自动选中单个匹配
      const matchesWithResults = resultsWithUsers.filter(r => r.match !== null);
      if (matchesWithResults.length === 1) {
        const matchIndex = resultsWithUsers.findIndex(r => r.match !== null);
        setAcceptedMatches(new Set([matchIndex]));
        console.log('✅ 自动选中唯一匹配，索引:', matchIndex);
        toast({
          title: '找到匹配！',
          description: '已为您自动选中，点击"确认安排"完成',
        });
      }
      
      console.log('✅ 进入确认步骤');
      setStep('confirm');
    } catch (error: any) {
      console.error('Error finding matches:', error);
      toast({
        title: '操作失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
      setStep('select');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAcceptMatch = (index: number) => {
    const newAccepted = new Set(acceptedMatches);
    if (newAccepted.has(index)) {
      newAccepted.delete(index);
    } else {
      newAccepted.add(index);
    }
    setAcceptedMatches(newAccepted);
  };

  const handleConfirmMatches = async () => {
    console.log('🎯 开始确认会面，接受的匹配数:', acceptedMatches.size);
    
    if (acceptedMatches.size === 0) {
      toast({
        title: '请选择会面',
        description: '至少接受一个匹配',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const acceptedResults = Array.from(acceptedMatches).map((index) => matchResults[index]);
      console.log('📋 接受的匹配结果:', acceptedResults);

      // 为每个接受的匹配创建会面
      let successCount = 0;
      for (const result of acceptedResults) {
        if (!result.match) {
          console.warn('⚠️ 跳过：没有匹配数据');
          continue;
        }

        console.log('🔍 查找用户availability ID...', {
          userId,
          date: result.timeSlot.date,
          time: result.timeSlot.time,
        });

        // 找到对应的用户availability ID
        const { data: userAvailability, error: availError } = await supabase
          .from('user_availability')
          .select('id')
          .eq('user_id', userId)
          .eq('date', result.timeSlot.date)
          .eq('time_slot', result.timeSlot.time)
          .eq('status', 'available')
          .single();

        if (availError || !userAvailability) {
          console.error('❌ User availability not found:', availError);
          console.error('查询参数:', {
            userId,
            date: result.timeSlot.date,
            time_slot: result.timeSlot.time,
            status: 'available',
          });
          continue;
        }

        console.log('✅ 找到用户availability ID:', userAvailability.id);
        console.log('📅 开始创建会面...', {
          userAId: userId,
          userBId: result.match.availability.user_id,
          availabilityAId: userAvailability.id,
          availabilityBId: result.match.availability.id,
        });

        await scheduleMeeting(
          userId,
          result.match.availability.user_id,
          userAvailability.id,
          result.match.availability.id,
          result.timeSlot.date,
          result.timeSlot.time,
          result.timeSlot.duration,
          result.match.matchScore,
          result.match.matchReasons
        );
        
        successCount++;
        console.log(`✅ 成功创建会面 ${successCount}/${acceptedResults.length}`);
      }

      console.log(`🎉 全部完成！成功创建 ${successCount} 个会面`);

      toast({
        title: '成功安排会面',
        description: `已为您安排 ${successCount} 个会面`,
      });

      setStep('success');
      
      // 会面创建成功，调用专门的回调（会切换到"即将进行" tab）
      setTimeout(() => {
        onMeetingScheduled?.();
      }, 100);
    } catch (error: any) {
      console.error('❌ Error scheduling meetings:', error);
      toast({
        title: '安排会面失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-4">
            <DialogDescription>
              选择您可用的会面时间，系统将为您找到最匹配的用户
            </DialogDescription>
            <TimeSlotPicker
              selectedSlots={selectedSlots}
              onSlotsChange={setSelectedSlots}
            />
          </div>
        );

      case 'matching':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-medium">正在为您查找最佳匹配...</p>
            <p className="text-sm text-muted-foreground">
              分析中，请稍候
            </p>
          </div>
        );

      case 'confirm':
        const matchedCount = matchResults.filter((r) => r.match !== null).length;
        
        // 调试日志
        console.log('🎨 渲染确认界面');
        console.log('- matchResults:', matchResults);
        console.log('- acceptedMatches:', acceptedMatches);
        console.log('- matchedCount:', matchedCount);

        return (
          <div className="space-y-4">
            {acceptedMatches.size > 0 ? (
              <DialogDescription className="text-green-600">
                已选择 {acceptedMatches.size} 个会面，点击下方"确认安排"按钮完成
              </DialogDescription>
            ) : (
              <DialogDescription>
                为您找到了 {matchedCount} 个匹配{matchedCount === 1 ? '（已自动选中）' : '，请点击卡片选择要接受的会面'}
              </DialogDescription>
            )}

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {matchResults.map((result, index) => {
                const isAccepted = acceptedMatches.has(index);

                return (
                  <Card
                    key={index}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      isAccepted
                        ? 'ring-4 ring-primary/30 bg-primary/10 border-primary shadow-lg scale-[1.02]'
                        : 'hover:bg-accent hover:border-primary/50 border-transparent'
                    }`}
                    onClick={() => result.match && toggleAcceptMatch(index)}
                  >
                    <div className="space-y-3">
                      {/* 已选中标记 */}
                      {isAccepted && (
                        <div className="flex items-center gap-2 text-green-600 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full -mt-1 -mx-1 mb-2 w-fit">
                          <CheckCircle className="w-4 h-4" />
                          <span>已选中</span>
                        </div>
                      )}
                      
                      {/* 时间信息 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {formatDateTime(
                              result.timeSlot.date,
                              result.timeSlot.time,
                              result.timeSlot.duration
                            )}
                          </span>
                        </div>
                        {isAccepted && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>

                      {/* 匹配用户信息 */}
                      {result.match ? (
                        <div className="flex items-center gap-3 pl-6">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={result.match.user?.avatar_url} />
                            <AvatarFallback>
                              {result.match.user?.first_name?.[0]}
                              {result.match.user?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">
                              {result.match.user?.first_name}{' '}
                              {result.match.user?.last_name}
                            </div>
                            {result.match.user?.city && (
                              <div className="text-sm text-muted-foreground">
                                {result.match.user.city}
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary">
                            匹配度 {Math.round(result.match.matchScore)}%
                          </Badge>
                        </div>
                      ) : (
                        <div className="pl-6 text-muted-foreground text-sm">
                          暂无匹配用户
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <p className="text-lg font-medium">会面安排成功！</p>
            <p className="text-sm text-muted-foreground text-center">
              已为您安排 {acceptedMatches.size} 个会面
              <br />
              您可以在"即将进行"标签中查看详情
            </p>
          </div>
        );
    }
  };

  const renderFooter = () => {
    switch (step) {
      case 'select':
        return (
          <>
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button
              onClick={handleFindMatches}
              disabled={selectedSlots.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                '查找匹配'
              )}
            </Button>
          </>
        );

      case 'matching':
        return null;

      case 'confirm':
        const hasSelected = acceptedMatches.size > 0;
        return (
          <div className="flex flex-col w-full gap-2">
            {!hasSelected && (
              <p className="text-sm text-amber-600 text-center">
                ⚠️ 请点击上方卡片选择要接受的会面
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('select')}>
                返回
              </Button>
              <Button
                onClick={handleConfirmMatches}
                disabled={!hasSelected || isProcessing}
                className={hasSelected ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : hasSelected ? (
                  `✓ 确认安排 (${acceptedMatches.size})`
                ) : (
                  '请先选择会面'
                )}
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <Button onClick={handleClose} className="w-full">
            完成
          </Button>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Users className="w-4 h-4" />
          安排会面
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' && '选择可用时间'}
            {step === 'matching' && '查找匹配中'}
            {step === 'confirm' && '确认会面安排'}
            {step === 'success' && '安排成功'}
          </DialogTitle>
        </DialogHeader>

        {renderContent()}

        {renderFooter() && <DialogFooter>{renderFooter()}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

