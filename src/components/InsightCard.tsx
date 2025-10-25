import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MeetingInsight } from "@/lib/supabase";
import { getCategoryInfo } from "@/lib/insightCategories";
import { GripVertical, X, Pencil, Check } from "lucide-react";
import { useState } from "react";

interface InsightCardProps {
  insight: {
    id?: string;
    insight_text: string;
    category?: string;
    insight_order: number;
  };
  index: number;
  isEditing: boolean;
  onEdit: (index: number, text: string) => void;
  onDelete: (index: number) => void;
  dragHandleProps?: any;
}

const InsightCard = ({ 
  insight, 
  index, 
  isEditing, 
  onEdit, 
  onDelete,
  dragHandleProps 
}: InsightCardProps) => {
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(insight.insight_text);
  
  const categoryInfo = getCategoryInfo(insight.category as any);

  const handleSaveEdit = () => {
    onEdit(index, editText);
    setIsEditingText(false);
  };

  const handleCancelEdit = () => {
    setEditText(insight.insight_text);
    setIsEditingText(false);
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow bg-card">
      <div className="flex items-start gap-3">
        {/* 拖拽手柄 */}
        {isEditing && (
          <div 
            {...dragHandleProps}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing pt-1 text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="w-5 h-5" />
          </div>
        )}

        {/* 序号 */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
          {index + 1}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* 分类标签 */}
          <Badge className={categoryInfo.color}>
            <span className="mr-1">{categoryInfo.icon}</span>
            {categoryInfo.label}
          </Badge>

          {/* 文本 */}
          {isEditingText ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[80px] resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  size="sm"
                  variant="default"
                  className="gap-1"
                >
                  <Check className="w-4 h-4" />
                  保存
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="outline"
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {insight.insight_text}
              </p>
              {isEditing && (
                <Button
                  onClick={() => setIsEditingText(true)}
                  size="sm"
                  variant="ghost"
                  className="gap-1 h-7 text-xs"
                >
                  <Pencil className="w-3 h-3" />
                  编辑
                </Button>
              )}
            </div>
          )}
        </div>

        {/* 删除按钮 */}
        {isEditing && !isEditingText && (
          <Button
            onClick={() => onDelete(index)}
            size="icon"
            variant="ghost"
            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default InsightCard;

