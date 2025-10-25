import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, CalendarIcon, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { createMeetingRecord, analyzeMeeting, saveMeetingInsights } from "@/services/meetingService";
import InsightsList from "./InsightsList";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { ScheduledMeetingWithUsers } from "@/lib/supabase";

type Step = 'input' | 'analyzing' | 'editing' | 'success';

interface TempInsight {
  text: string;
  category?: string;
  order: number;
}

interface MeetingAnalysisDialogProps {
  meeting?: ScheduledMeetingWithUsers;
  currentUserId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MeetingAnalysisDialog = ({ 
  meeting, 
  currentUserId,
  open,
  onOpenChange 
}: MeetingAnalysisDialogProps) => {
  const { userId } = useUser();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>('input');
  
  // Input step state
  const [transcript, setTranscript] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [meetingDate, setMeetingDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // Analysis result
  const [insights, setInsights] = useState<TempInsight[]>([]);
  const [summary, setSummary] = useState('');
  const [meetingRecordId, setMeetingRecordId] = useState('');
  
  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 当传入 meeting 时，自动填充会议信息
  useEffect(() => {
    if (meeting && open) {
      // 获取对方用户信息
      const effectiveUserId = currentUserId || userId;
      const otherUser = meeting.user_a_id === effectiveUserId 
        ? meeting.user_b 
        : meeting.user_a;
      
      // 设置会面对象
      setParticipantName(`${otherUser.first_name} ${otherUser.last_name}`);
      
      // 设置会议日期
      setMeetingDate(new Date(meeting.meeting_date));
      
      console.log('自动填充会议信息:', {
        participant: `${otherUser.first_name} ${otherUser.last_name}`,
        date: meeting.meeting_date
      });
    }
  }, [meeting, open, currentUserId, userId]);

  const resetDialog = () => {
    setStep('input');
    setTranscript('');
    setParticipantName('');
    setMeetingDate(new Date());
    setInsights([]);
    setSummary('');
    setMeetingRecordId('');
  };

  const handleStartAnalysis = async () => {
    if (!userId) {
      toast({
        title: "错误",
        description: "请先登录",
        variant: "destructive",
      });
      return;
    }

    if (!transcript.trim()) {
      toast({
        title: "输入不完整",
        description: "请输入会议记录",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setStep('analyzing');

    try {
      // 1. 创建会议记录
      const meetingRecord = await createMeetingRecord(
        userId,
        transcript,
        participantName || undefined,
        meetingDate
      );
      setMeetingRecordId(meetingRecord.id);

      // 2. 分析会议
      const result = await analyzeMeeting(userId, transcript, participantName || undefined);
      
      // 3. 将结果转换为临时格式
      const tempInsights: TempInsight[] = result.insights.map((insight, index) => ({
        text: insight.text,
        category: insight.category,
        order: index
      }));

      setInsights(tempInsights);
      setSummary(result.summary);
      setStep('editing');

      toast({
        title: "分析完成",
        description: `已提取 ${tempInsights.length} 个价值点`,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "分析失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
      setStep('input');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditInsight = (index: number, text: string) => {
    const newInsights = [...insights];
    newInsights[index] = { ...newInsights[index], text };
    setInsights(newInsights);
  };

  const handleDeleteInsight = (index: number) => {
    const newInsights = insights.filter((_, i) => i !== index);
    // 重新计算order
    const reorderedInsights = newInsights.map((insight, i) => ({
      ...insight,
      order: i
    }));
    setInsights(reorderedInsights);
  };

  const handleReorderInsights = (fromIndex: number, toIndex: number) => {
    const newInsights = [...insights];
    const [movedInsight] = newInsights.splice(fromIndex, 1);
    newInsights.splice(toIndex, 0, movedInsight);
    
    // 重新计算order
    const reorderedInsights = newInsights.map((insight, i) => ({
      ...insight,
      order: i
    }));
    setInsights(reorderedInsights);
  };

  const handleSave = async () => {
    if (!userId || !meetingRecordId) return;

    setIsSaving(true);
    try {
      await saveMeetingInsights(meetingRecordId, userId, insights);
      
      setStep('success');
      toast({
        title: "保存成功",
        description: "已保存 " + insights.length + " 个价值点，正在更新您的用户画像...",
      });

      // 3秒后关闭对话框
      setTimeout(() => {
        onOpenChange?.(false);
        resetDialog();
      }, 3000);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "保存失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReanalyze = () => {
    setStep('input');
    setInsights([]);
    setSummary('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange?.(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'input' && '分析会议记录'}
            {step === 'analyzing' && '正在分析...'}
            {step === 'editing' && '编辑价值点'}
            {step === 'success' && '保存成功'}
          </DialogTitle>
          <DialogDescription>
            {step === 'input' && '输入会议记录，AI将为您提取有价值的信息'}
            {step === 'analyzing' && 'AI正在分析您的会议记录，请稍候...'}
            {step === 'editing' && '您可以编辑、排序或删除价值点'}
            {step === 'success' && '价值点已保存，用户画像正在更新中'}
          </DialogDescription>
        </DialogHeader>

        {/* Input Step */}
        {step === 'input' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-date">会议日期</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="meeting-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !meetingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {meetingDate ? format(meetingDate, "PPP") : <span>选择日期</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={meetingDate}
                    onSelect={(date) => {
                      setMeetingDate(date || new Date());
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participant">
                会面对象
                {meeting && <span className="text-xs text-muted-foreground ml-2">(自动填充)</span>}
              </Label>
              <Input
                id="participant"
                placeholder={meeting ? "" : "输入会面对象的名字（可选）"}
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                readOnly={!!meeting}
                className={meeting ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transcript">会议记录</Label>
              <Textarea
                id="transcript"
                placeholder="粘贴或输入会议记录文本..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[300px] resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {transcript.length} 字符 {transcript.length > 10000 && '(超过建议长度)'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={() => onOpenChange?.(false)}
                variant="outline"
              >
                取消
              </Button>
              <Button
                onClick={handleStartAnalysis}
                disabled={!transcript.trim()}
              >
                开始分析
              </Button>
            </div>
          </div>
        )}

        {/* Analyzing Step */}
        {step === 'analyzing' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              AI正在分析会议记录，提取有价值的信息...
            </p>
          </div>
        )}

        {/* Editing Step */}
        {step === 'editing' && (
          <div className="space-y-4 py-4">
            {summary && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">会议摘要</h4>
                <p className="text-sm text-muted-foreground">{summary}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-3">
                提取的价值点 ({insights.length})
              </h4>
              <InsightsList
                insights={insights.map(ins => ({
                  insight_text: ins.text,
                  category: ins.category,
                  insight_order: ins.order
                }))}
                isEditing={true}
                onEdit={handleEditInsight}
                onDelete={handleDeleteInsight}
                onReorder={handleReorderInsights}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                onClick={handleReanalyze}
                variant="outline"
              >
                重新分析
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || insights.length === 0}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    保存 ({insights.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold">保存成功！</h3>
            <p className="text-sm text-muted-foreground text-center">
              已保存 {insights.length} 个价值点<br />
              您的用户画像正在更新中，这将帮助我们为您推荐更合适的连接
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MeetingAnalysisDialog;

