import InsightCard from "./InsightCard";
import { useState } from "react";

interface Insight {
  id?: string;
  insight_text: string;
  category?: string;
  insight_order: number;
}

interface InsightsListProps {
  insights: Insight[];
  isEditing: boolean;
  onEdit: (index: number, text: string) => void;
  onDelete: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const InsightsList = ({ 
  insights, 
  isEditing, 
  onEdit, 
  onDelete,
  onReorder 
}: InsightsListProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onReorder(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleDragEnd();
  };

  if (insights.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>暂无价值点</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <div
          key={insight.id || index}
          draggable={isEditing}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          className={`
            transition-all
            ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
            ${dragOverIndex === index && draggedIndex !== null ? 'border-t-2 border-primary pt-2' : ''}
          `}
        >
          <InsightCard
            insight={insight}
            index={index}
            isEditing={isEditing}
            onEdit={onEdit}
            onDelete={onDelete}
            dragHandleProps={isEditing ? {} : undefined}
          />
        </div>
      ))}
    </div>
  );
};

export default InsightsList;

