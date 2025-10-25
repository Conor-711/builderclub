import { Card } from './ui/card';
import { Button } from './ui/button';
import { ThumbsUp, Trophy, User, Sparkles } from 'lucide-react';
import { useState } from 'react';

export interface IdeaItem {
  id: string;
  description: string;
  proposer: string;
  votes: number;
  rank: number;
}

interface IdeaCardProps {
  idea: IdeaItem;
  onVote: (ideaId: string) => void;
  onClaim: (ideaDescription: string) => void;
}

export function IdeaCard({ idea, onVote, onClaim }: IdeaCardProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleVote = () => {
    if (hasVoted) return;
    
    setHasVoted(true);
    setIsAnimating(true);
    onVote(idea.id);
    
    // 动画结束后重置
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleClaim = () => {
    onClaim(idea.description);
  };

  // 根据排名获取徽章颜色
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    if (rank === 2) return 'bg-gray-400/20 text-gray-600 border-gray-400/30';
    if (rank === 3) return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
    return 'bg-muted text-muted-foreground border-border';
  };

  // 前三名显示奖杯图标
  const showTrophy = idea.rank <= 3;

  return (
    <Card className="p-4 flex flex-col h-full hover:shadow-lg transition-all duration-200 relative overflow-hidden group">
      {/* 排名徽章 */}
      <div className="absolute top-3 right-3">
        <div className={`
          flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border
          ${getRankBadgeColor(idea.rank)}
        `}>
          {showTrophy && <Trophy className="w-3 h-3" />}
          <span>#{idea.rank}</span>
        </div>
      </div>

      {/* Idea 描述 */}
      <div className="flex-1 mb-4 pr-12">
        <p className="text-sm leading-relaxed line-clamp-4 text-foreground">
          {idea.description}
        </p>
      </div>

      {/* 底部信息 */}
      <div className="space-y-3 pt-3 border-t">
        {/* 提出者 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="w-3.5 h-3.5" />
          <span className="truncate">{idea.proposer}</span>
        </div>

        {/* Claim it 按钮 */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleClaim}
          className="w-full gap-1.5 border-primary/50 text-primary hover:bg-primary/10"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Claim it</span>
        </Button>

        {/* 投票按钮和投票数 */}
        <div className="flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant={hasVoted ? "secondary" : "default"}
            onClick={handleVote}
            disabled={hasVoted}
            className={`
              flex-1 gap-1.5 transition-all
              ${isAnimating ? 'scale-110' : 'scale-100'}
              ${hasVoted ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">
              {hasVoted ? 'Voted' : 'Vote'}
            </span>
          </Button>
          
          <div className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-md">
            <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold">{idea.votes}</span>
          </div>
        </div>
      </div>

      {/* 悬停效果 - 渐变边框 */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      </div>
    </Card>
  );
}

