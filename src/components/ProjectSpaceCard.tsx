import { Card } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Music, Video } from 'lucide-react';

export interface TeamMember {
  name: string;
  avatar: string;
  equity?: number;
}

export interface ProjectSpace {
  id: string;
  logo: string;
  name: string;
  initialIdea: string;
  description: string;
  members: TeamMember[];
  stage: 'idea' | 'developing' | 'launching' | 'launched';
  music?: {
    image: string;
    name: string;
  };
  createdBy: string;
  createdAt: string;
  potentialUsers?: number; // 从 Idea 页面 claim 时的投票数
}

interface ProjectSpaceCardProps {
  project: ProjectSpace;
  showJoinMeeting?: boolean;
  onJoinMeeting?: () => void;
}

export function ProjectSpaceCard({ project, showJoinMeeting, onJoinMeeting }: ProjectSpaceCardProps) {
  const stageConfig = {
    'idea': { label: 'Idea Stage', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    'developing': { label: 'Developing', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
    'launching': { label: 'Launching Soon', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    'launched': { label: 'Launched', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' }
  };
  
  const stage = stageConfig[project.stage];
  const displayMembers = project.members.slice(0, 4);
  const remainingCount = project.members.length - 4;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      {/* 顶部：Logo 和项目信息 */}
      <div className="flex gap-4 mb-4">
        <img 
          src={project.logo} 
          alt={project.name}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-muted"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold mb-2">{project.name}</h3>
          <Badge className={stage.color}>{stage.label}</Badge>
        </div>
      </div>

      {/* 初始Idea */}
      <p className="text-sm font-medium text-muted-foreground mb-2 flex items-start gap-1">
        <span className="text-base">💡</span>
        <span>{project.initialIdea}</span>
      </p>

      {/* 项目简介 */}
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
        {project.description}
      </p>

      {/* 团队成员 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-muted-foreground">Team:</span>
        <div className="flex -space-x-2">
          {displayMembers.map((member, idx) => (
            <Avatar 
              key={idx} 
              className="w-8 h-8 border-2 border-background"
              title={`${member.name}${member.equity ? ` - ${member.equity}%` : ''}`}
            >
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
            </Avatar>
          ))}
          {remainingCount > 0 && (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
              +{remainingCount}
            </div>
          )}
        </div>
      </div>

      {/* 音乐（如果有） */}
      {project.music && project.music.name && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg border">
          {project.music.image ? (
            <img 
              src={project.music.image} 
              alt={project.music.name}
              className="w-10 h-10 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Project Music</p>
            <p className="text-sm font-medium truncate">{project.music.name}</p>
          </div>
        </div>
      )}

      {/* 底部：创建者信息 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
        <span>Created by <span className="font-medium">{project.createdBy}</span></span>
        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Join Meeting 按钮 */}
      {showJoinMeeting && onJoinMeeting && (
        <div className="mt-4 pt-4 border-t">
          <Button 
            onClick={onJoinMeeting}
            className="w-full"
            size="lg"
          >
            <Video className="w-4 h-4 mr-2" />
            Join Meeting
          </Button>
        </div>
      )}
    </Card>
  );
}

