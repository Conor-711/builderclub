import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from "@/components/AppLayout";
import { BountyCard, Bounty } from '@/components/BountyCard';
import { ProjectSpace } from '@/components/ProjectSpaceCard';
import { Button } from '@/components/ui/button';
import { Plus, Store, Video } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Demo数据：15个悬赏
const demoBounties: Bounty[] = [
  {
    id: '1',
    image: '/startup_logo/sonder.png',
    title: 'Pro6lema - All Eyes on Rani PHONK UGC/EDIT Campaign',
    totalAmount: 249.02,
    paidAmount: 249.02,
    reward: '$0.25 / 1K',
    category: 'Music',
    type: 'UGC',
    platform: 'TikTok'
  },
  {
    id: '2',
    image: '/startup_logo/cluely.png',
    title: 'Artist Launch - TikTok Music Promo Campaign',
    totalAmount: 500.00,
    paidAmount: 325.50,
    reward: '$0.50 / 1K',
    category: 'Music',
    type: 'UGC',
    platform: 'TikTok'
  },
  {
    id: '3',
    image: '/startup_logo/polymarket.png',
    title: 'Indie Band Album Release Promotion',
    totalAmount: 350.00,
    paidAmount: 180.00,
    reward: '$0.35 / 1K',
    category: 'Music',
    type: 'EDIT',
    platform: 'Instagram'
  },
  {
    id: '4',
    image: '/startup_logo/interview.png',
    title: 'DJ Mix Contest - Electronic Music Edition',
    totalAmount: 600.00,
    paidAmount: 420.00,
    reward: '$0.40 / 1K',
    category: 'Music',
    type: 'UGC',
    platform: 'YouTube'
  },
  {
    id: '5',
    image: '/startup_logo/flora.png',
    title: 'Music Video Challenge - Create Your Version',
    totalAmount: 450.00,
    paidAmount: 450.00,
    reward: '$0.30 / 1K',
    category: 'Music',
    type: 'UGC',
    platform: 'TikTok'
  },
  {
    id: '6',
    image: '/startup_logo/clova.png',
    title: 'FPS Gameplay Montage Competition',
    totalAmount: 800.00,
    paidAmount: 560.00,
    reward: '$0.60 / 1K',
    category: 'Gaming',
    type: 'EDIT',
    platform: 'YouTube'
  },
  {
    id: '7',
    image: '/startup_logo/ugctank.png',
    title: 'Mobile Game Review Campaign',
    totalAmount: 400.00,
    paidAmount: 200.00,
    reward: '$0.20 / 1K',
    category: 'Gaming',
    type: 'REVIEW',
    platform: 'TikTok'
  },
  {
    id: '8',
    image: '/startup_logo/editly.png',
    title: 'Esports Highlight Reel Challenge',
    totalAmount: 700.00,
    paidAmount: 490.00,
    reward: '$0.50 / 1K',
    category: 'Gaming',
    type: 'EDIT',
    platform: 'YouTube'
  },
  {
    id: '9',
    image: '/startup_logo/instinct.png',
    title: 'Game Walkthrough Series Creator Wanted',
    totalAmount: 1000.00,
    paidAmount: 650.00,
    reward: '$0.80 / 1K',
    category: 'Gaming',
    type: 'UGC',
    platform: 'YouTube'
  },
  {
    id: '10',
    image: '/startup_logo/series.png',
    title: 'Gaming Setup Showcase Competition',
    totalAmount: 300.00,
    paidAmount: 150.00,
    reward: '$0.25 / 1K',
    category: 'Gaming',
    type: 'UGC',
    platform: 'Instagram'
  },
  {
    id: '11',
    image: '/startup_logo/articulate.png',
    title: 'Fashion Brand Launch Campaign',
    totalAmount: 900.00,
    paidAmount: 900.00,
    reward: '$0.70 / 1K',
    category: 'Fashion',
    type: 'UGC',
    platform: 'Instagram'
  },
  {
    id: '12',
    image: '/startup_logo/riveter.png',
    title: 'Lifestyle Vlog Contest - Show Your Day',
    totalAmount: 550.00,
    paidAmount: 275.00,
    reward: '$0.45 / 1K',
    category: 'Lifestyle',
    type: 'UGC',
    platform: 'TikTok'
  },
  {
    id: '13',
    image: '/startup_logo/smooth.png',
    title: 'Beauty Product Review Campaign',
    totalAmount: 650.00,
    paidAmount: 390.00,
    reward: '$0.55 / 1K',
    category: 'Lifestyle',
    type: 'REVIEW',
    platform: 'Instagram'
  },
  {
    id: '14',
    image: '/startup_logo/interaction.png',
    title: 'Fitness Challenge Campaign - 30 Days',
    totalAmount: 750.00,
    paidAmount: 525.00,
    reward: '$0.65 / 1K',
    category: 'Lifestyle',
    type: 'UGC',
    platform: 'YouTube'
  },
  {
    id: '15',
    image: '/startup_logo/floweai.png',
    title: 'Travel Content Creator Program',
    totalAmount: 1200.00,
    paidAmount: 840.00,
    reward: '$1.00 / 1K',
    category: 'Lifestyle',
    type: 'UGC',
    platform: 'Instagram'
  },
];

// Demo用户项目（模拟从Team Space获取）
const demoUserProjects: ProjectSpace[] = [
  {
    id: 'user-project-1',
    logo: '/startup_logo/sonder.png',
    name: 'Sonder',
    initialIdea: 'AI-powered empathy platform',
    description: 'Helping people understand and express emotions better through personalized insights',
    members: [],
    stage: 'developing',
    createdBy: 'You',
    createdAt: '2025-01-15'
  },
  {
    id: 'user-project-2',
    logo: '/startup_logo/interaction.png',
    name: 'Interaction',
    initialIdea: 'Real-time design collaboration tool',
    description: 'Enabling seamless creative workflows for distributed teams',
    members: [],
    stage: 'idea',
    createdBy: 'You',
    createdAt: '2025-01-18'
  },
  {
    id: 'user-project-3',
    logo: '/startup_logo/clova.png',
    name: 'Clova',
    initialIdea: 'Smart home automation for everyone',
    description: 'Democratizing IoT with easy-to-install devices that work seamlessly',
    members: [],
    stage: 'launching',
    createdBy: 'You',
    createdAt: '2025-01-20'
  }
];

const initialBountyState = {
  image: '',
  title: '',
  totalAmount: 0,
  reward: '',
  category: '',
  type: '',
  platform: '',
  projectId: '',
  projectName: '',
  projectDescription: '',
  potentialCreators: undefined
};

const Marketplace = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-bounties'>('marketplace');
  const [myBounties, setMyBounties] = useState<Bounty[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBounty, setNewBounty] = useState(initialBountyState);
  const [userProjects, setUserProjects] = useState<ProjectSpace[]>(() => {
    // 从 localStorage 读取用户在 TeamSpace 创建的项目
    const saved = localStorage.getItem('userProjects');
    return saved ? JSON.parse(saved) : demoUserProjects;
  });
  const [selectedProject, setSelectedProject] = useState<ProjectSpace | null>(null);
  const [potentialCreators, setPotentialCreators] = useState<number | null>(null);

  // 监听 localStorage 变化，实时同步 TeamSpace 的项目
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('userProjects');
      if (saved) {
        setUserProjects(JSON.parse(saved));
      }
    };

    // 监听 storage 事件（跨标签页）
    window.addEventListener('storage', handleStorageChange);
    
    // 监听自定义事件（同一页面内）
    window.addEventListener('projectsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('projectsUpdated', handleStorageChange);
    };
  }, []);

  const handleProjectSelect = (projectId: string) => {
    const project = userProjects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      
      // 从项目数据中获取 potentialUsers（如果是从 Idea claim 来的项目）
      const votes = project.potentialUsers || null;
      
      setNewBounty({
        ...newBounty,
        projectId: project.id,
        projectName: project.name,
        projectDescription: project.description,
        image: project.logo,
        title: `${project.name} UGC Campaign`,
        potentialCreators: votes || undefined
      });
      
      setPotentialCreators(votes);
    }
  };

  const handleCreateBounty = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!selectedProject || !newBounty.totalAmount || 
        !newBounty.reward || !newBounty.category || !newBounty.type || !newBounty.platform) {
      toast({
        title: 'Missing fields',
        description: 'Please select a project and fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const bounty: Bounty = {
      id: `user-${Date.now()}`,
      ...newBounty,
      paidAmount: 0
    };
    
    setMyBounties([bounty, ...myBounties]);
    setShowCreateDialog(false);
    setNewBounty(initialBountyState);
    setSelectedProject(null);
    setActiveTab('my-bounties');
    
    toast({
      title: 'Bounty created!',
      description: 'Your bounty has been published to the marketplace.'
    });
  };

  const handleJoinBountyMeeting = () => {
    navigate('/meeting-loading?type=bounty');
  };

  const displayedBounties = activeTab === 'marketplace' ? demoBounties : myBounties;

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* 顶部标题和标签页 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">UGC Marketplace</h1>
        </div>

        {/* 标签页切换按钮和Join Meeting按钮 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'marketplace'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-background border border-border hover:bg-accent'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => setActiveTab('my-bounties')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'my-bounties'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-background border border-border hover:bg-accent'
              }`}
            >
              My Bounties
              {myBounties.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-background/20">
                  {myBounties.length}
                </span>
              )}
            </button>
          </div>
          
          {/* Join Meeting 按钮 - 仅在My Bounties且有bounty时显示 */}
          {activeTab === 'my-bounties' && myBounties.length > 0 && (
            <Button onClick={handleJoinBountyMeeting} size="lg">
              <Video className="w-4 h-4 mr-2" />
              Join Meeting
            </Button>
          )}
        </div>

        {/* 悬赏卡片网格 */}
        {displayedBounties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedBounties.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
        ) : (
          // My Bounties 空状态
          <div className="text-center py-16">
            <Store className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-3">No bounties yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first bounty to start your UGC campaign and attract content creators
            </p>
            <Button onClick={() => setShowCreateDialog(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Bounty
            </Button>
          </div>
        )}

        {/* 创建悬赏浮动按钮 */}
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow p-0"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>

        {/* 创建悬赏对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Bounty</DialogTitle>
              <DialogDescription>
                Fill in the details to create a UGC bounty campaign
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBounty} className="space-y-4 mt-4">
              {/* 选择项目 */}
              <div className="space-y-2">
                <Label htmlFor="project">Select Project *</Label>
                <Select
                  value={selectedProject?.id || ''}
                  onValueChange={handleProjectSelect}
                >
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Choose a project from Team Space" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 项目预览 */}
              {selectedProject && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                  <img 
                    src={selectedProject.logo} 
                    alt={selectedProject.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{selectedProject.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{selectedProject.description}</p>
                  </div>
                </div>
              )}

              {/* Potential Creators - 仅在从 Idea claim 的项目时显示 */}
              {potentialCreators !== null && (
                <div className="space-y-2">
                  <Label>Potential Creators</Label>
                  <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{potentialCreators}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Potential Creators</p>
                        <p className="text-xs text-muted-foreground">
                          {potentialCreators} {potentialCreators === 1 ? 'person' : 'people'} interested in this project
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Total Budget ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newBounty.totalAmount || ''}
                  onChange={(e) => setNewBounty({ ...newBounty, totalAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward">Reward Structure *</Label>
                <Input
                  id="reward"
                  value={newBounty.reward}
                  onChange={(e) => setNewBounty({ ...newBounty, reward: e.target.value })}
                  placeholder="e.g., $0.25 / 1K"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newBounty.category}
                  onValueChange={(v) => setNewBounty({ ...newBounty, category: v })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Music">Music</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="Tech">Tech</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Content Type *</Label>
                <Select
                  value={newBounty.type}
                  onValueChange={(v) => setNewBounty({ ...newBounty, type: v })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UGC">UGC</SelectItem>
                    <SelectItem value="EDIT">EDIT</SelectItem>
                    <SelectItem value="REVIEW">REVIEW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select
                  value={newBounty.platform}
                  onValueChange={(v) => setNewBounty({ ...newBounty, platform: v })}
                >
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Create Bounty
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Marketplace;
