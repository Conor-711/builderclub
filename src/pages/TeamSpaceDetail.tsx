import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  Music,
  Target,
  Sparkles,
  MessageSquare,
  Heart,
  Share2
} from 'lucide-react';
import { ProjectSpace } from '@/components/ProjectSpaceCard';
import { useToast } from '@/hooks/use-toast';

// 项目动态类型
interface ProjectUpdate {
  id: string;
  type: 'milestone' | 'member' | 'stage' | 'announcement';
  title: string;
  content: string;
  timestamp: string;
  author: string;
}

// 项目历史事件类型
interface HistoryEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'created' | 'milestone' | 'member_joined' | 'stage_change' | 'achievement';
}

const TeamSpaceDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectSpace | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Demo 数据 - 项目动态
  const demoUpdates: ProjectUpdate[] = [
    {
      id: '1',
      type: 'milestone',
      title: 'MVP Launch',
      content: 'We successfully launched our MVP with 50+ early adopters! The feedback has been incredible.',
      timestamp: '2025-10-20T10:30:00',
      author: 'Sarah Chen'
    },
    {
      id: '2',
      type: 'member',
      title: 'New Team Member',
      content: 'Welcome Alex to the team! They will be leading our marketing efforts.',
      timestamp: '2025-10-18T14:20:00',
      author: 'John Doe'
    },
    {
      id: '3',
      type: 'stage',
      title: 'Stage Update',
      content: 'We have moved from Idea stage to Developing! Time to build!',
      timestamp: '2025-10-15T09:00:00',
      author: 'Sarah Chen'
    },
    {
      id: '4',
      type: 'announcement',
      title: 'Weekly Sync Meeting',
      content: 'Reminder: Our weekly sync is this Friday at 2 PM. Let\'s discuss our Q4 roadmap.',
      timestamp: '2025-10-14T16:45:00',
      author: 'Lisa Wang'
    }
  ];

  // Demo 数据 - 项目历史
  const demoHistory: HistoryEvent[] = [
    {
      id: '1',
      date: '2025-10-20',
      title: 'MVP Launched',
      description: 'Successfully launched minimum viable product with core features',
      type: 'milestone'
    },
    {
      id: '2',
      date: '2025-10-18',
      title: 'Team Expansion',
      description: 'Alex joined as Marketing Lead',
      type: 'member_joined'
    },
    {
      id: '3',
      date: '2025-10-15',
      title: 'Development Phase Started',
      description: 'Moved from Idea stage to Developing stage',
      type: 'stage_change'
    },
    {
      id: '4',
      date: '2025-10-10',
      title: 'First Investor Meeting',
      description: 'Pitched to seed investors, received positive feedback',
      type: 'achievement'
    },
    {
      id: '5',
      date: '2025-10-01',
      title: 'Team Formation',
      description: 'Core team members joined the project',
      type: 'member_joined'
    },
    {
      id: '6',
      date: '2025-09-25',
      title: 'Project Created',
      description: 'Initial project space created on BuilderClub',
      type: 'created'
    }
  ];

  useEffect(() => {
    // 从 localStorage 加载项目数据
    const loadProject = () => {
      const userProjects = localStorage.getItem('userProjects');
      if (userProjects) {
        const projects: ProjectSpace[] = JSON.parse(userProjects);
        const foundProject = projects.find(p => p.id === projectId);
        if (foundProject) {
          setProject(foundProject);
          return;
        }
      }

      // 如果在用户项目中找不到，返回到 TeamSpace 页面
      toast({
        title: 'Project not found',
        description: 'The project you are looking for does not exist.',
        variant: 'destructive'
      });
      navigate('/team-space');
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId, navigate, toast]);

  if (!project) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const stageConfig = {
    'idea': { label: 'Idea Stage', color: 'bg-blue-500', icon: Sparkles },
    'developing': { label: 'Developing', color: 'bg-yellow-500', icon: TrendingUp },
    'launching': { label: 'Launching Soon', color: 'bg-orange-500', icon: Target },
    'launched': { label: 'Launched', color: 'bg-green-500', icon: Target }
  };

  const stage = stageConfig[project.stage];
  const StageIcon = stage.icon;

  const getUpdateIcon = (type: ProjectUpdate['type']) => {
    switch (type) {
      case 'milestone': return Target;
      case 'member': return Users;
      case 'stage': return TrendingUp;
      case 'announcement': return MessageSquare;
    }
  };

  const getHistoryIcon = (type: HistoryEvent['type']) => {
    switch (type) {
      case 'created': return Sparkles;
      case 'milestone': return Target;
      case 'member_joined': return Users;
      case 'stage_change': return TrendingUp;
      case 'achievement': return Heart;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/team-space')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to TeamSpace
        </Button>

        {/* 项目头部 */}
        <div className="mb-8">
          <Card className="p-8 bg-gradient-to-br from-background via-primary/5 to-primary/10 border-2 border-primary/20">
            <div className="flex gap-6 items-start">
              {/* Logo */}
              <img
                src={project.logo}
                alt={project.name}
                className="w-24 h-24 rounded-xl object-cover flex-shrink-0 ring-4 ring-primary/20"
              />

              {/* 项目信息 */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {project.name}
                    </h1>
                    <p className="text-lg text-muted-foreground mb-3">
                      💡 {project.initialIdea}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 阶段 Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={`${stage.color} text-white px-3 py-1 flex items-center gap-1.5`}>
                    <StageIcon className="w-4 h-4" />
                    {stage.label}
                  </Badge>
                  {project.potentialUsers && (
                    <Badge variant="secondary" className="px-3 py-1">
                      {project.potentialUsers} potential users
                    </Badge>
                  )}
                </div>

                {/* 描述 */}
                <p className="text-foreground leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* 项目音乐 */}
                {project.music && project.music.name && (
                  <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border inline-flex">
                    {project.music.image ? (
                      <img
                        src={project.music.image}
                        alt={project.music.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                        <Music className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Project Anthem</p>
                      <p className="text-sm font-medium">{project.music.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 元数据 */}
            <div className="mt-6 pt-6 border-t flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {project.members.length} team members
              </div>
            </div>
          </Card>
        </div>

        {/* 标签页内容 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 项目阶段 */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Project Stage
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${stage.color} flex items-center justify-center text-white`}>
                      <StageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">{stage.label}</p>
                      <p className="text-sm text-muted-foreground">Current status</p>
                    </div>
                  </div>
                  
                  {/* 阶段进度 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>
                        {project.stage === 'idea' ? '25%' : 
                         project.stage === 'developing' ? '50%' : 
                         project.stage === 'launching' ? '75%' : '100%'}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stage.color} transition-all`}
                        style={{ 
                          width: project.stage === 'idea' ? '25%' : 
                                 project.stage === 'developing' ? '50%' : 
                                 project.stage === 'launching' ? '75%' : '100%'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* 团队成员概览 */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Team Members
                </h3>
                <div className="space-y-3">
                  {project.members.slice(0, 3).map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        {member.equity && (
                          <p className="text-xs text-muted-foreground">{member.equity}% equity</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setActiveTab('members')}
                    >
                      View all {project.members.length} members
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* 最近动态 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Updates
              </h3>
              <div className="space-y-4">
                {demoUpdates.slice(0, 3).map((update) => {
                  const UpdateIcon = getUpdateIcon(update.type);
                  return (
                    <div key={update.id} className="flex gap-3 p-4 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <UpdateIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{update.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{update.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {update.author} · {formatTimestamp(update.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab('updates')}
                >
                  View all updates
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Team Members ({project.members.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.members.map((member, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-lg">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{member.name}</h4>
                        {member.equity && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{member.equity}% equity</Badge>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Team member
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                Project Updates
              </h3>
              <div className="space-y-4">
                {demoUpdates.map((update) => {
                  const UpdateIcon = getUpdateIcon(update.type);
                  return (
                    <Card key={update.id} className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <UpdateIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-lg">{update.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {update.type}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3 leading-relaxed">
                            {update.content}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="font-medium">{update.author}</span>
                            <span>•</span>
                            <span>{formatTimestamp(update.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                Project History
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-6">
                  {demoHistory.map((event, idx) => {
                    const HistoryIcon = getHistoryIcon(event.type);
                    return (
                      <div key={event.id} className="relative flex gap-4 pl-0">
                        {/* Timeline dot */}
                        <div className="relative z-10 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-4 ring-background">
                          <HistoryIcon className="w-5 h-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 pb-6">
                          <div className="bg-muted/50 p-4 rounded-lg hover:bg-muted/70 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{event.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {new Date(event.date).toLocaleDateString()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default TeamSpaceDetail;

