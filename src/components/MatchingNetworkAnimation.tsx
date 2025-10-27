/**
 * Matching Network Animation Component
 * Visualizes AI matching thought process with animated text chain
 */

import { useState, useEffect, memo } from 'react';
import { Brain, Sparkles, Users, Target, Zap } from 'lucide-react';

export interface MatchingUser {
  id: string;
  avatar: string;
  name: string;
}

export interface MatchingNetworkAnimationProps {
  currentUser: {
    avatar: string;
    name: string;
  };
  matchingUsers: MatchingUser[];
  isAnimating?: boolean;
}

// AI 思维链步骤
interface ThoughtStep {
  icon: typeof Brain;
  text: string;
  subtext?: string;
  delay: number;
  color: string;
}

export const MatchingNetworkAnimation = memo(function MatchingNetworkAnimation({
  currentUser,
  matchingUsers,
  isAnimating = true,
}: MatchingNetworkAnimationProps) {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

  // AI 思维链步骤定义
  const thoughtSteps: ThoughtStep[] = [
    {
      icon: Brain,
      text: 'Analyzing your profile and preferences',
      subtext: `Interests • Skills • Goals • Location`,
      delay: 0,
      color: 'text-blue-400',
    },
    {
      icon: Sparkles,
      text: 'Scanning global builder network',
      subtext: `${matchingUsers.length * 234} potential matches found`,
      delay: 1200,
      color: 'text-purple-400',
    },
    {
      icon: Target,
      text: 'Evaluating compatibility scores',
      subtext: 'Skills alignment • Goal overlap • Availability match',
      delay: 2400,
      color: 'text-amber-400',
    },
    {
      icon: Users,
      text: 'Selecting optimal matches',
      subtext: `Top ${matchingUsers.length} builders identified`,
      delay: 3600,
      color: 'text-green-400',
    },
    {
      icon: Zap,
      text: 'Match complete!',
      subtext: 'Preparing your connection...',
      delay: 4800,
      color: 'text-primary',
    },
  ];

  // 逐步显示思维链
  useEffect(() => {
    if (!isAnimating) return;

    const timers = thoughtSteps.map((step, index) => {
      return setTimeout(() => {
        setVisibleSteps(index + 1);
      }, step.delay);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isAnimating]);

  // 循环显示匹配用户名称
  useEffect(() => {
    if (!isAnimating || visibleSteps < 3) return;

    const interval = setInterval(() => {
      setCurrentMatchIndex((prev) => (prev + 1) % matchingUsers.length);
    }, 800);

    return () => clearInterval(interval);
  }, [isAnimating, visibleSteps, matchingUsers.length]);

  return (
    <div className="relative w-full bg-gradient-to-br from-muted/20 via-background to-muted/20 rounded-lg overflow-hidden border border-border/40">
      {/* Background decorative glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(var(--primary-rgb,59,130,246),0.06),transparent_60%)]" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

      {/* AI 思维链容器 */}
      <div className="relative p-6 sm:p-8 space-y-4">
        {/* 标题 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">AI Matching Process</h3>
            <p className="text-xs text-muted-foreground">Neural network analysis in progress</p>
          </div>
        </div>

        {/* 思维链步骤 */}
        <div className="space-y-3">
          {thoughtSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isVisible = index < visibleSteps;
            const isActive = index === visibleSteps - 1;

            return (
              <div
                key={index}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border transition-all duration-500
                  ${isVisible 
                    ? 'opacity-100 translate-x-0 bg-muted/30 border-border/50' 
                    : 'opacity-0 translate-x-4 bg-transparent border-transparent'
                  }
                  ${isActive ? 'ring-2 ring-primary/20 bg-primary/5' : ''}
                `}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {/* 图标 */}
                <div className={`
                  p-2 rounded-lg shrink-0 transition-all duration-300
                  ${isActive 
                    ? 'bg-primary/20 animate-pulse-subtle' 
                    : 'bg-muted'
                  }
                `}>
                  <StepIcon className={`w-4 h-4 ${isActive ? step.color : 'text-muted-foreground'}`} />
                </div>

                {/* 文本内容 */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className={`
                    text-sm font-medium leading-tight
                    ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                  `}>
                    {step.text}
                  </p>
                  {step.subtext && (
                    <p className="text-xs text-muted-foreground/80 leading-tight">
                      {step.subtext}
                    </p>
                  )}

                  {/* 特殊：匹配用户名称循环显示 */}
                  {index === 3 && isActive && matchingUsers.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="px-2 py-1 bg-primary/10 rounded text-xs font-mono text-primary">
                        {matchingUsers[currentMatchIndex].name}
                      </div>
                      <span className="text-xs text-muted-foreground animate-pulse">
                        {currentMatchIndex + 1}/{matchingUsers.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* 状态指示器 */}
                {isActive && (
                  <div className="flex gap-1 shrink-0">
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                )}

                {/* 完成指示器 */}
                {!isActive && isVisible && (
                  <div className="shrink-0">
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 进度指示器 */}
        {visibleSteps > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round((visibleSteps / thoughtSteps.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${(visibleSteps / thoughtSteps.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          [style*="animation"],
          .animate-pulse-subtle,
          .animate-bounce,
          .animate-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
});

export default MatchingNetworkAnimation;

