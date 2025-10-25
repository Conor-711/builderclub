import { Badge } from "@/components/ui/badge";
import { MatchReason } from "@/lib/supabase";
import { Target, Heart, MapPin, Sparkles } from "lucide-react";

interface MatchReasonsProps {
  reasons: MatchReason[];
  commonGoals?: string[];
  commonInterests?: string[];
  maxReasons?: number;
}

const MatchReasons = ({ 
  reasons, 
  commonGoals = [], 
  commonInterests = [], 
  maxReasons = 3 
}: MatchReasonsProps) => {
  // 按分数排序并限制显示数量
  const sortedReasons = [...reasons]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxReasons);

  const getIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('目标') || lowerCategory.includes('goal')) {
      return <Target className="w-4 h-4" />;
    }
    if (lowerCategory.includes('兴趣') || lowerCategory.includes('interest')) {
      return <Heart className="w-4 h-4" />;
    }
    if (lowerCategory.includes('地理') || lowerCategory.includes('location')) {
      return <MapPin className="w-4 h-4" />;
    }
    return <Sparkles className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* 匹配原因 */}
      <div className="space-y-2">
        {sortedReasons.map((reason, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex-shrink-0 mt-0.5 text-primary">
              {getIcon(reason.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">
                  {reason.category}
                </span>
                <span className="text-xs text-muted-foreground">
                  {reason.score}分
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {reason.description}
              </p>
              {reason.details && reason.details.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {reason.details.map((detail, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                      <span className="text-primary">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 共同目标 */}
      {commonGoals.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            共同目标
          </h4>
          <div className="flex flex-wrap gap-2">
            {commonGoals.map((goal, index) => (
              <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                {goal}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 共同兴趣 */}
      {commonInterests.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            共同兴趣
          </h4>
          <div className="flex flex-wrap gap-2">
            {commonInterests.map((interest, index) => (
              <Badge key={index} variant="outline">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchReasons;

