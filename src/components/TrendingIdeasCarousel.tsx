import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Flame, ThumbsUp, DollarSign, Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TipIdeaDialog } from './TipIdeaDialog';
import type { IdeaItem } from './IdeaCard';

interface TrendingIdeasCarouselProps {
  ideas: IdeaItem[];
  onVote: (ideaId: string) => void;
  onClaim: (ideaDescription: string) => void;
  onTip?: (ideaId: string, amount: number) => void;
}

export function TrendingIdeasCarousel({ ideas, onVote, onClaim, onTip }: TrendingIdeasCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showTipDialog, setShowTipDialog] = useState(false);
  
  // 获取前5个最热门的ideas
  const trendingIdeas = ideas.slice(0, 5);
  
  if (trendingIdeas.length === 0) return null;

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || trendingIdeas.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingIdeas.length);
    }, 5000); // 每5秒切换一次

    return () => clearInterval(interval);
  }, [isAutoPlaying, trendingIdeas.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + trendingIdeas.length) % trendingIdeas.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % trendingIdeas.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const handleTipSent = (amount: number) => {
    onTip?.(currentIdea.id, amount);
  };

  const currentIdea = trendingIdeas[currentIndex];

  return (
    <div className="relative mb-8">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          Trending Today
        </h2>
        <Badge variant="secondary" className="ml-2">
          <TrendingUp className="w-3 h-3 mr-1" />
          Top 5
        </Badge>
      </div>

      {/* 轮播主体 */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50/50 to-yellow-50 dark:from-orange-950/20 dark:via-red-950/10 dark:to-yellow-950/20 border-2 border-orange-200 dark:border-orange-800 shadow-xl">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-red-400/20 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 p-8 md:p-12">
          {/* 排名徽章 - 更精美的设计 */}
          <div className="absolute top-6 right-6 z-20">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center shadow-2xl ring-4 ring-orange-100 dark:ring-orange-900/50">
                <span className="text-3xl font-black text-white">#{currentIdea.rank}</span>
              </div>
              {/* 脉冲动画环 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-red-500 animate-ping opacity-20" />
              {/* 星星装饰 */}
              <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* 内容区域 */}
          <div className="max-w-4xl mx-auto">
            {/* Idea 描述 - 精心设计的文本展示 */}
            <div className="mb-8 relative">
              {/* 装饰性引号 */}
              <div className="absolute -left-4 -top-2 text-6xl text-orange-200 dark:text-orange-900/50 font-serif leading-none">
                "
              </div>
              
              {/* 主文本 - 控制在两句话之内 */}
              <div className="relative z-10 pl-8">
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4 tracking-tight">
                  {/* 将描述截取为两句话 */}
                  {(() => {
                    const sentences = currentIdea.description.match(/[^.!?]+[.!?]+/g) || [currentIdea.description];
                    const twoSentences = sentences.slice(0, 2).join(' ').trim();
                    // 如果文本太长，在合适位置截断并添加省略号
                    const maxLength = 150;
                    if (twoSentences.length > maxLength) {
                      return twoSentences.substring(0, maxLength).trim() + '...';
                    }
                    return twoSentences;
                  })()}
                </p>
                
                {/* 装饰性下划线 */}
                <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6 animate-pulse" />
                
                {/* 附加信息 - 简洁标签 */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="text-xs px-3 py-1 border-orange-500/50 text-orange-600 dark:text-orange-400">
                    💡 Innovation
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 border-red-500/50 text-red-600 dark:text-red-400">
                    🔥 Hot
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 border-purple-500/50 text-purple-600 dark:text-purple-400">
                    ⚡ Trending
                  </Badge>
                </div>
              </div>
              
              {/* 装饰性引号结束 */}
              <div className="absolute -right-4 -bottom-2 text-6xl text-orange-200 dark:text-orange-900/50 font-serif leading-none">
                "
              </div>
            </div>

            {/* 提出者和投票数 - 简化版 */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg ring-2 ring-orange-200 dark:ring-orange-800">
                  <span className="text-sm font-bold text-white">
                    {currentIdea.proposer.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created by</p>
                  <p className="font-bold text-foreground">{currentIdea.proposer}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full border border-orange-200 dark:border-orange-800">
                <ThumbsUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="font-bold text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {currentIdea.votes}
                </span>
                <span className="text-sm font-medium text-muted-foreground">votes</span>
              </div>
            </div>

            {/* 操作按钮 - 更显眼的设计 */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => onVote(currentIdea.id)}
                size="lg"
                className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold"
              >
                <ThumbsUp className="w-5 h-5" />
                Vote Now
              </Button>
              <Button
                onClick={() => onClaim(currentIdea.description)}
                size="lg"
                variant="outline"
                className="gap-2 border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 font-semibold transition-all hover:scale-105 shadow-md"
              >
                <Flame className="w-5 h-5" />
                Claim & Build
              </Button>
              <Button
                onClick={() => setShowTipDialog(true)}
                size="lg"
                variant="outline"
                className="gap-2 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white dark:hover:bg-green-600 font-semibold transition-all hover:scale-105 shadow-md"
              >
                <DollarSign className="w-5 h-5" />
                Tip Creator
              </Button>
            </div>
          </div>
        </div>

        {/* 左右导航按钮 */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/60 hover:bg-background shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
          aria-label="Previous idea"
        >
          <ChevronLeft className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/60 hover:bg-background shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
          aria-label="Next idea"
        >
          <ChevronRight className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
        </button>

        {/* 进度指示器 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {trendingIdeas.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-gradient-to-r from-orange-500 to-red-500'
                  : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Go to idea ${index + 1}`}
            />
          ))}
        </div>

        {/* 自动播放指示器 */}
        {isAutoPlaying && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="text-xs">
              Auto-playing
            </Badge>
          </div>
        )}
      </Card>

      {/* 提示文本 */}
      <p className="text-sm text-muted-foreground text-center mt-3">
        🔥 Hottest ideas in the last 24 hours • Updates every 5 seconds
      </p>

      {/* 打赏对话框 */}
      <TipIdeaDialog
        open={showTipDialog}
        onOpenChange={setShowTipDialog}
        ideaProposer={currentIdea.proposer}
        ideaDescription={currentIdea.description}
        onTipSent={handleTipSent}
      />
    </div>
  );
}

