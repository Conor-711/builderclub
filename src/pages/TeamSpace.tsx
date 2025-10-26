import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from "@/components/AppLayout";
import { ProjectSpaceCard, ProjectSpace, TeamMember } from '@/components/ProjectSpaceCard';
import { MySpaceEditor, MySpace } from '@/components/MySpaceEditor';
import { Button } from '@/components/ui/button';
import { Plus, Building2, ImageIcon, Music } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Demo好友列表
const demoFriends = [
  { name: 'Mike', avatar: '/src/assets/users/user2.jpg' },
  { name: 'Amanda', avatar: '/src/assets/users/user3.jpg' },
];

// Demo项目空间数据
const demoProjects: ProjectSpace[] = [
  {
    id: '1',
    logo: '/startup_logo/sonder.png',
    name: 'Sonder',
    initialIdea: 'AI-powered empathy platform',
    description: 'Building an AI platform that helps people understand and express emotions better through personalized insights and interactive experiences.',
    members: [
      { name: 'Sarah', avatar: '/src/assets/users/user4.jpg', equity: 40 },
      { name: 'John', avatar: '/src/assets/users/user5.jpg', equity: 35 },
    ],
    stage: 'developing',
    music: {
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop',
      name: 'Moonlight Sonata'
    },
    createdBy: 'Sarah Chen',
    createdAt: '2025-01-15'
  },
  {
    id: '2',
    logo: '/startup_logo/clova.png',
    name: 'Clova',
    initialIdea: 'Smart home automation for everyone',
    description: 'Democratizing smart home technology with affordable, easy-to-install devices that work seamlessly together.',
    members: [
      { name: 'Mike', avatar: '/src/assets/users/user2.jpg', equity: 50 },
      { name: 'Amanda', avatar: '/src/assets/users/user3.jpg', equity: 30 },
      { name: 'Tom', avatar: '/src/assets/users/user5.jpg', equity: 20 }
    ],
    stage: 'idea',
    createdBy: 'Mike Johnson',
    createdAt: '2025-01-20'
  },
  {
    id: '3',
    logo: '/startup_logo/polymarket.png',
    name: 'Polymarket',
    initialIdea: 'Decentralized prediction market platform',
    description: 'A prediction market platform where users can bet on real-world events using cryptocurrency, powered by blockchain technology.',
    members: [
      { name: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', equity: 45 },
      { name: 'Emma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', equity: 35 },
      { name: 'David', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', equity: 20 }
    ],
    stage: 'launched',
    music: {
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
      name: 'Electric Dreams'
    },
    createdBy: 'Alex Rodriguez',
    createdAt: '2024-11-10'
  },
  {
    id: '4',
    logo: '/startup_logo/flora.png',
    name: 'Flora',
    initialIdea: 'AI plant care assistant',
    description: 'An app that uses AI to identify plant diseases, provide personalized care tips, and connect plant lovers in a vibrant community.',
    members: [
      { name: 'Amanda', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda', equity: 55 },
      { name: 'Chris', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris', equity: 45 }
    ],
    stage: 'developing',
    createdBy: 'Amanda Lee',
    createdAt: '2025-01-18'
  },
  {
    id: '5',
    logo: '/startup_logo/instinct.png',
    name: 'Instinct',
    initialIdea: 'Next-gen fitness tracker with AI coaching',
    description: 'A fitness tracker that learns your patterns and provides personalized workout recommendations powered by machine learning.',
    members: [
      { name: 'Ryan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan', equity: 40 },
      { name: 'Sofia', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia', equity: 35 },
      { name: 'Mike', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', equity: 25 }
    ],
    stage: 'launching',
    music: {
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop',
      name: 'Eye of the Tiger'
    },
    createdBy: 'Ryan Martinez',
    createdAt: '2024-12-05'
  }
];

type ProjectStage = 'idea' | 'developing' | 'launching' | 'launched';

const initialProjectState: {
  logo: string;
  name: string;
  initialIdea: string;
  description: string;
  stage: ProjectStage;
  music: { image: string; name: string };
} = {
  logo: '/demo/lowercase.png',
  name: 'Lowercase',
  initialIdea: 'an engineering-first design studio',
  description: 'an engineering-first design studio',
  stage: 'idea',
  music: {
    image: '/demo/music-cover.png',
    name: 'Whop'
  }
};

const TeamSpace = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'public' | 'friends' | 'myspace'>('public');
  const [myProjects, setMyProjects] = useState<ProjectSpace[]>(() => {
    // 从 localStorage 加载已保存的项目
    const saved = localStorage.getItem('userProjects');
    return saved ? JSON.parse(saved) : [];
  });
  const [mySpace, setMySpace] = useState<MySpace | null>(() => {
    // 从 localStorage 加载个人空间
    const saved = localStorage.getItem('userMySpace');
    return saved ? JSON.parse(saved) : null;
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState(initialProjectState);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberEquity, setMemberEquity] = useState<Record<string, number>>({});
  
  // 图片上传相关状态
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(initialProjectState.logo);
  const [musicCoverFile, setMusicCoverFile] = useState<File | null>(null);
  const [musicCoverPreview, setMusicCoverPreview] = useState<string>(initialProjectState.music.image);
  const [potentialUsers, setPotentialUsers] = useState<number | null>(null);

  // 检查是否从 Idea 页面跳转过来
  useEffect(() => {
    const openCreate = searchParams.get('openCreate');
    if (openCreate === 'true') {
      // 从 sessionStorage 获取 claimed idea 和投票数
      const claimedIdea = sessionStorage.getItem('claimedIdea');
      const claimedIdeaVotes = sessionStorage.getItem('claimedIdeaVotes');
      
      if (claimedIdea) {
        // 设置 initial idea 字段
        setNewProject(prev => ({
          ...prev,
          initialIdea: claimedIdea
        }));
        // 清除 sessionStorage
        sessionStorage.removeItem('claimedIdea');
      }
      
      if (claimedIdeaVotes) {
        // 设置 potential users
        setPotentialUsers(parseInt(claimedIdeaVotes));
        // 清除 sessionStorage
        sessionStorage.removeItem('claimedIdeaVotes');
      }
      
      // 打开创建对话框
      setShowCreateDialog(true);
      // 清除 URL 参数
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // 检查是否是首次创建个人空间并自动切换到 MySpace 标签页
  useEffect(() => {
    const isFirstTimeUser = localStorage.getItem('hasCreatedMySpace');
    if (!isFirstTimeUser && !mySpace) {
      // 如果是首次用户且还没有个人空间，切换到 myspace 标签页
      setActiveTab('myspace');
    }
  }, [mySpace]);

  // 保存个人空间
  const handleSaveMySpace = (space: MySpace) => {
    setMySpace(space);
    localStorage.setItem('userMySpace', JSON.stringify(space));
    localStorage.setItem('hasCreatedMySpace', 'true');
    
    toast({
      title: 'Space saved!',
      description: 'Your personal space has been saved successfully.'
    });
  };

  // Friends' Space 显示包含用户好友的项目
  const friendsList = ['Mike', 'Amanda'];
  const friendsProjects = demoProjects.filter(project =>
    project.members.some(member => friendsList.includes(member.name))
  );

  const displayedProjects = 
    activeTab === 'public' ? demoProjects : 
    activeTab === 'friends' ? friendsProjects : 
    myProjects;

  const handleJoinMeeting = () => {
    navigate('/meeting-loading?type=project');
  };

  const handleMemberToggle = (name: string, checked: boolean | string) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, name]);
    } else {
      setSelectedMembers(selectedMembers.filter(m => m !== name));
      // 移除股份数据
      const newEquity = { ...memberEquity };
      delete newEquity[name];
      setMemberEquity(newEquity);
    }
  };

  const handleEquityChange = (name: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setMemberEquity({
      ...memberEquity,
      [name]: numValue
    });
  };

  // 图片文件验证
  const validateImageFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload PNG, JPG or SVG image',
        variant: 'destructive'
      });
      return false;
    }
    
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  };

  // 处理Logo上传
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImageFile(file)) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setNewProject({ ...newProject, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理音乐封面上传
  const handleMusicCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImageFile(file)) {
      setMusicCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setMusicCoverPreview(result);
        setNewProject({
          ...newProject,
          music: { ...newProject.music, image: result }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setNewProject(initialProjectState);
    setSelectedMembers([]);
    setMemberEquity({});
    setLogoFile(null);
    setLogoPreview(initialProjectState.logo);
    setMusicCoverFile(null);
    setMusicCoverPreview(initialProjectState.music.image);
    setPotentialUsers(null);
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!newProject.name || !newProject.logo || !newProject.initialIdea ||
        !newProject.description || selectedMembers.length === 0) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields and select at least one team member',
        variant: 'destructive'
      });
      return;
    }

    // 构建团队成员数组
    const members: TeamMember[] = selectedMembers.map(name => {
      const friend = demoFriends.find(f => f.name === name);
      return {
        name,
        avatar: friend!.avatar,
        equity: memberEquity[name] || undefined
      };
    });

    const project: ProjectSpace = {
      id: `user-${Date.now()}`,
      ...newProject,
      members,
      createdBy: 'You',
      createdAt: new Date().toISOString().split('T')[0],
      potentialUsers: potentialUsers || undefined // 保存投票数到项目数据中
    };

    const updatedProjects = [project, ...myProjects];
    setMyProjects(updatedProjects);
    
    // 保存到 localStorage，供 Marketplace 读取
    localStorage.setItem('userProjects', JSON.stringify(updatedProjects));
    
    // 触发自定义事件，通知其他组件项目已更新
    window.dispatchEvent(new Event('projectsUpdated'));
    
    setShowCreateDialog(false);
    resetForm();

    toast({
      title: 'Project created!',
      description: 'Your project space has been created successfully.'
    });
  };

  return (
    <AppLayout>
      <div className="p-6">
        {/* 顶部标题和标签页 */}
        <div className="max-w-2xl mx-auto mb-6">
          {/* 标语 */}
          <h1 className="text-white text-2xl font-semibold mb-4">
            LinkedIn's just too old.
          </h1>

          {/* 标签页切换按钮 */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('public')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'public'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-background border border-border hover:bg-accent'
              }`}
            >
              Public Space
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'friends'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-background border border-border hover:bg-accent'
              }`}
            >
              Friends' Space
            </button>
            <button
              onClick={() => setActiveTab('myspace')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'myspace'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-background border border-border hover:bg-accent'
              }`}
            >
              My Space
            </button>
          </div>
        </div>

        {/* MySpace 标签页：显示个人空间编辑器 */}
        {activeTab === 'myspace' && (
          <div className="max-w-2xl mx-auto mb-8">
            <MySpaceEditor 
              space={mySpace} 
              onSave={handleSaveMySpace}
            />
          </div>
        )}

        {/* 项目空间Feeds流 */}
        {activeTab !== 'myspace' && (
          <>
            {displayedProjects.length > 0 ? (
              <div className="max-w-2xl mx-auto space-y-4">
                {displayedProjects.map((project) => (
                  <ProjectSpaceCard 
                    key={project.id} 
                    project={project}
                    showJoinMeeting={false}
                    onJoinMeeting={handleJoinMeeting}
                  />
                ))}
              </div>
            ) : (
              // 空状态
              <div className="max-w-2xl mx-auto text-center py-16">
                <Building2 className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                <h3 className="text-2xl font-semibold mb-3">No projects yet</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'friends'
                    ? "Your friends haven't created any projects yet"
                    : "Be the first to create a project space"}
                </p>
                {activeTab === 'public' && (
                  <Button onClick={handleOpenCreateDialog} size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Project Space
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* MySpace 标签页：显示用户的项目列表 */}
        {activeTab === 'myspace' && myProjects.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">My Projects</h3>
              <Button onClick={handleOpenCreateDialog} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
            {myProjects.map((project) => (
              <ProjectSpaceCard 
                key={project.id} 
                project={project}
                showJoinMeeting={true}
                onJoinMeeting={handleJoinMeeting}
              />
            ))}
          </div>
        )}

        {/* 创建项目浮动按钮 - 仅在 public 和 friends 标签页显示 */}
        {activeTab !== 'myspace' && (
          <Button
            onClick={handleOpenCreateDialog}
            className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow p-0"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>
        )}

        {/* 创建项目对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Project Space</DialogTitle>
              <DialogDescription>
                Share your project idea and build your team
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
              {/* 项目Logo */}
              <div className="space-y-2">
                <Label htmlFor="logo">Project Logo *</Label>
                <div className="flex items-center gap-4">
                  {/* Logo预览 */}
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* 文件上传输入 */}
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload PNG, JPG or SVG (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* 项目名称 */}
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>

              {/* 初始Idea */}
              <div className="space-y-2">
                <Label htmlFor="idea">Initial Idea *</Label>
                <Input
                  id="idea"
                  value={newProject.initialIdea}
                  onChange={(e) => setNewProject({ ...newProject, initialIdea: e.target.value })}
                  placeholder="Your project idea in one sentence"
                  required
                />
              </div>

              {/* Potential Users - 仅在从 Idea 页面 claim 时显示 */}
              {potentialUsers !== null && (
                <div className="space-y-2">
                  <Label>Potential Users</Label>
                  <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{potentialUsers}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Potential Users</p>
                        <p className="text-xs text-muted-foreground">
                          {potentialUsers} {potentialUsers === 1 ? 'person' : 'people'} voted for this idea
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 项目简介 */}
              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe your project in detail..."
                  rows={4}
                  required
                />
              </div>

              {/* 团队成员选择 */}
              <div className="space-y-2">
                <Label>Team Members *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select friends to invite to your project
                </p>
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  {demoFriends.map((friend) => (
                    <div key={friend.name} className="flex items-center gap-3">
                      <Checkbox
                        id={`member-${friend.name}`}
                        checked={selectedMembers.includes(friend.name)}
                        onCheckedChange={(checked) => handleMemberToggle(friend.name, checked)}
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{friend.name[0]}</AvatarFallback>
                      </Avatar>
                      <Label
                        htmlFor={`member-${friend.name}`}
                        className="flex-1 cursor-pointer"
                      >
                        {friend.name}
                      </Label>
                      {/* 股份输入（如果选中） */}
                      {selectedMembers.includes(friend.name) && (
                        <Input
                          type="number"
                          placeholder="Equity %"
                          className="w-24"
                          min="0"
                          max="100"
                          value={memberEquity[friend.name] || ''}
                          onChange={(e) => handleEquityChange(friend.name, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 项目阶段 */}
              <div className="space-y-2">
                <Label>Project Stage *</Label>
                <RadioGroup
                  value={newProject.stage}
                  onValueChange={(v) =>
                    setNewProject({ ...newProject, stage: v as 'idea' | 'developing' | 'launching' | 'launched' })
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="idea" id="stage-idea" />
                    <Label htmlFor="stage-idea" className="cursor-pointer">
                      Idea
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="developing" id="stage-developing" />
                    <Label htmlFor="stage-developing" className="cursor-pointer">
                      Already started developing
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="launching" id="stage-launching" />
                    <Label htmlFor="stage-launching" className="cursor-pointer">
                      About to launch
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="launched" id="stage-launched" />
                    <Label htmlFor="stage-launched" className="cursor-pointer">
                      Already launched
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 项目音乐（可选） */}
              <div className="border-t pt-4 space-y-2">
                <Label>Project Music (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose a song that represents your project
                </p>
                
                {/* 音乐封面上传 */}
                <div className="space-y-2">
                  <Label htmlFor="musicCover">Music Cover Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded border-2 border-dashed border-muted-foreground/25 overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                      {musicCoverPreview ? (
                        <img 
                          src={musicCoverPreview} 
                          alt="Music cover preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <Input
                        id="musicCover"
                        type="file"
                        accept="image/*"
                        onChange={handleMusicCoverUpload}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                {/* 音乐名称 */}
                <div>
                  <Label htmlFor="musicName">Music Name</Label>
                  <Input
                    id="musicName"
                    placeholder="Music name"
                    value={newProject.music?.name || ''}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        music: {
                          name: e.target.value,
                          image: newProject.music?.image || ''
                        }
                      })
                    }
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Create Project Space
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default TeamSpace;
