import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Flame, DollarSign, Sparkles, Target, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Bounty } from './BountyCard';

interface TrendingBountiesCarouselProps {
  bounties: Bounty[];
  onApply?: (bountyId: string) => void;
}

export function TrendingBountiesCarousel({ bounties, onApply }: TrendingBountiesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // 获取前5个最热门的悬赏（根据总金额和进度排序）
  const trendingBounties = bounties
    .sort((a, b) => {
      // 优先考虑总金额高的，其次考虑进度高的
      const scoreA = a.totalAmount * 0.7 + (a.paidAmount / a.totalAmount) * a.totalAmount * 0.3;
      const scoreB = b.totalAmount * 0.7 + (b.paidAmount / b.totalAmount) * b.totalAmount * 0.3;
      return scoreB - scoreA;
    })
    .slice(0, 5);
  
  if (trendingBounties.length === 0) return null;

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || trendingBounties.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingBounties.length);
    }, 5000); // 每5秒切换一次

    return () => clearInterval(interval);
  }, [isAutoPlaying, trendingBounties.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + trendingBounties.length) % trendingBounties.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % trendingBounties.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentBounty = trendingBounties[currentIndex];
  const progress = (currentBounty.paidAmount / currentBounty.totalAmount) * 100;

  // 截取标题为两句话
  const getTwoSentenceTitle = (title: string) => {
    const sentences = title.match(/[^.!?]+[.!?]+/g) || [title];
    const twoSentences = sentences.slice(0, 2).join(' ').trim();
    const maxLength = 150;
    if (twoSentences.length > maxLength) {
      return twoSentences.substring(0, maxLength).trim() + '...';
    }
    return twoSentences || title;
  };

  return (
    <div className="relative mb-8">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-6 h-6 text-green-500 animate-pulse" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
          Trending Bounties
        </h2>
        <Badge variant="secondary" className="ml-2">
          <TrendingUp className="w-3 h-3 mr-1" />
          Top 5
        </Badge>
      </div>

      {/* 轮播主体 */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/10 dark:to-teal-950/20 border-2 border-green-200 dark:border-green-800 shadow-xl">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 p-8 md:p-12">
          {/* 排名徽章 - 更精美的设计 */}
          <div className="absolute top-6 right-6 z-20">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl ring-4 ring-green-100 dark:ring-green-900/50">
                <span className="text-3xl font-black text-white">#{currentIndex + 1}</span>
              </div>
              {/* 脉冲动画环 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 animate-ping opacity-20" />
              {/* 星星装饰 */}
              <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* 内容区域 */}
          <div className="max-w-4xl mx-auto">
            {/* Bounty 标题 - 精心设计的文本展示 */}
            <div className="mb-8 relative">
              {/* 装饰性引号 */}
              <div className="absolute -left-4 -top-2 text-6xl text-green-200 dark:text-green-900/50 font-serif leading-none">
                "
              </div>
              
              {/* 主文本 - 控制在两句话之内 */}
              <div className="relative z-10 pl-8">
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4 tracking-tight">
                  {getTwoSentenceTitle(currentBounty.title)}
                </p>
                
                {/* 装饰性下划线 */}
                <div className="w-24 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 animate-pulse" />
                
                {/* 附加信息 - 简洁标签 */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="text-xs px-3 py-1 border-green-500/50 text-green-600 dark:text-green-400">
                    💰 {currentBounty.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 border-emerald-500/50 text-emerald-600 dark:text-emerald-400">
                    🎯 {currentBounty.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 border-teal-500/50 text-teal-600 dark:text-teal-400">
                    📱 {currentBounty.platform}
                  </Badge>
                </div>
              </div>
              
              {/* 装饰性引号结束 */}
              <div className="absolute -right-4 -bottom-2 text-6xl text-green-200 dark:text-green-900/50 font-serif leading-none">
                "
              </div>
            </div>

            {/* 悬赏金额和进度 - 简化版 */}
            <div className="space-y-4 mb-6 pb-6 border-b border-green-200 dark:border-green-800">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* 总金额 */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg ring-2 ring-green-200 dark:ring-green-800">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Bounty</p>
                    <p className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${currentBounty.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* 奖励率 */}
                <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full border border-green-200 dark:border-green-800">
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">
                    {currentBounty.reward}
                  </span>
                </div>
              </div>

              {/* 进度条 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${currentBounty.paidAmount.toFixed(2)} paid out
                  </span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 relative"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    {/* 闪光效果 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
              </div>

              {/* Potential Creators */}
              {currentBounty.potentialCreators && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>{currentBounty.potentialCreators} potential creators interested</span>
                </div>
              )}
            </div>

            {/* 操作按钮 - 更显眼的设计 */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => onApply?.(currentBounty.id)}
                size="lg"
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold"
              >
                <Target className="w-5 h-5" />
                Apply Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white dark:hover:bg-green-600 font-semibold transition-all hover:scale-105 shadow-md"
              >
                <Sparkles className="w-5 h-5" />
                View Details
              </Button>
              {currentBounty.projectName && (
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 font-semibold transition-all hover:scale-105 shadow-md"
                >
                  View Project: {currentBounty.projectName}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 左右导航按钮 */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border-2 border-green-500/20 hover:border-green-500/60 hover:bg-background shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
          aria-label="Previous bounty"
        >
          <ChevronLeft className="w-6 h-6 text-foreground group-hover:text-green-600 transition-colors" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border-2 border-green-500/20 hover:border-green-500/60 hover:bg-background shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
          aria-label="Next bounty"
        >
          <ChevronRight className="w-6 h-6 text-foreground group-hover:text-green-600 transition-colors" />
        </button>

        {/* 进度指示器 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {trendingBounties.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Go to bounty ${index + 1}`}
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
        💰 Hottest bounties with highest rewards • Updates every 5 seconds
      </p>

      {/* 添加闪光动画的样式 */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

