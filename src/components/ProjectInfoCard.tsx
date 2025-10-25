import { useState } from 'react';
import { Card } from './ui/card';
import { Building2, FileText, AlertCircle, Gift, ChevronDown, ChevronUp } from 'lucide-react';

export interface ProjectMeetingInfo {
  name: string;
  logo: string;
  description: string;
  recentIssues: string;
  canOffer: string;
}

interface ProjectInfoCardProps {
  project: ProjectMeetingInfo;
  defaultCollapsed?: boolean;
}

export function ProjectInfoCard({ project, defaultCollapsed = false }: ProjectInfoCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  return (
    <Card className="p-3 space-y-2 bg-white/10 backdrop-blur-sm border-white/20 shadow-lg">
      {/* Logo和项目名称 - 可点击折叠/展开 */}
      <div 
        className="flex items-center gap-3 cursor-pointer hover:bg-white/5 -m-3 p-3 rounded-lg transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-md border-2 border-white/30">
          <img 
            src={project.logo} 
            alt={project.name}
            className="w-full h-full object-contain p-2"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-white/70 flex-shrink-0" />
            <h3 className="text-base font-bold text-white truncate">{project.name}</h3>
          </div>
        </div>
        {/* 折叠/展开图标 */}
        <div className="flex-shrink-0">
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-white/70" />
          ) : (
            <ChevronUp className="w-5 h-5 text-white/70" />
          )}
        </div>
      </div>
      
      {/* 可折叠的详细信息 */}
      {!isCollapsed && (
        <div className="space-y-2 pt-2">
          {/* 项目简介 */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3 text-white/70 flex-shrink-0" />
              <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">
                Description
              </p>
            </div>
            <p className="text-xs text-white/90 leading-relaxed pl-5">
              {project.description}
            </p>
          </div>
          
          {/* 最近的问题 */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3 h-3 text-orange-400/80 flex-shrink-0" />
              <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">
                Recent Issues
              </p>
            </div>
            <p className="text-xs text-white/90 leading-relaxed pl-5">
              {project.recentIssues}
            </p>
          </div>
          
          {/* 可以给予的 */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gift className="w-3 h-3 text-green-400/80 flex-shrink-0" />
              <p className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">
                Can Offer
              </p>
            </div>
            <p className="text-xs text-white/90 leading-relaxed pl-5">
              {project.canOffer}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

