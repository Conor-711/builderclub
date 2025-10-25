import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, MessageCircle } from 'lucide-react';

export interface MatchingReason {
  id: string;
  reason: string;
  type: 'skill' | 'interest' | 'goal' | 'location' | 'stage';
}

export interface Topic {
  id: string;
  title: string;
  description: string;
}

interface MatchingReasonsPanelProps {
  reasons: MatchingReason[];
  topics?: Topic[];
  defaultCollapsed?: boolean;
}

export function MatchingReasonsPanel({ 
  reasons, 
  topics = [],
  defaultCollapsed = false 
}: MatchingReasonsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // 生成默认的 topics 如果没有提供
  const defaultTopics: Topic[] = [
    {
      id: '1',
      title: 'Product Strategy',
      description: 'Discuss roadmap and feature priorities'
    },
    {
      id: '2',
      title: 'Market Insights',
      description: 'Share competitive landscape analysis'
    },
    {
      id: '3',
      title: 'Team Building',
      description: 'Explore collaboration opportunities'
    }
  ];

  const displayTopics = topics.length > 0 ? topics.slice(0, 3) : defaultTopics;

  return (
    <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden mb-4">
      {/* 头部 - 可点击折叠 */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between text-left transition-colors hover:bg-white/5 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">Meeting Overview</h3>
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-white/50" />
        ) : (
          <ChevronUp className="w-4 h-4 text-white/50" />
        )}
      </button>

      {/* 展开内容 */}
      {!isCollapsed && (
        <div>
          {/* 分隔线 */}
          <div className="h-px bg-white/10" />

          {/* 主体内容 - 两列布局 */}
          <div className="grid grid-cols-2 gap-0 divide-x divide-white/10 p-4">
            {/* 左侧：Matching Reasons */}
            <div className="pr-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Match Reasons
                </h4>
              </div>

              <div className="space-y-1.5">
                {reasons.map((reason) => (
                  <div
                    key={reason.id}
                    className="p-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <p className="text-xs text-white/70 leading-relaxed">
                      {reason.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧：Topics */}
            <div className="pl-4 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Topics to Discuss
                </h4>
              </div>

              <div className="space-y-1.5">
                {displayTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <p className="text-xs font-medium text-white/90">
                      {topic.title}
                    </p>
                    <p className="text-xs text-white/60 mt-0.5">
                      {topic.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
