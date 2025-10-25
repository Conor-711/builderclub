import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const MatchScore = ({ score, size = 'md', showLabel = true }: MatchScoreProps) => {
  // 确保分数在0-100之间
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // 根据分数确定颜色
  const getColorClass = () => {
    if (normalizedScore >= 80) return 'text-green-600';
    if (normalizedScore >= 60) return 'text-blue-600';
    if (normalizedScore >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getProgressColorClass = () => {
    if (normalizedScore >= 80) return 'bg-green-600';
    if (normalizedScore >= 60) return 'bg-blue-600';
    if (normalizedScore >= 40) return 'bg-yellow-600';
    return 'bg-orange-600';
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">匹配度</span>
          <span className={`font-semibold ${sizeClasses[size]} ${getColorClass()}`}>
            {normalizedScore.toFixed(0)}%
          </span>
        </div>
      )}
      <ProgressPrimitive.Root
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary")}
        value={normalizedScore}
      >
        <ProgressPrimitive.Indicator
          className={cn("h-full w-full flex-1 transition-all", getProgressColorClass())}
          style={{ transform: `translateX(-${100 - normalizedScore}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
};

export default MatchScore;

