import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from "@/components/AppLayout";
import { IdeaCard, IdeaItem } from '@/components/IdeaCard';
import { Lightbulb } from 'lucide-react';

// Demo ideas 数据
const initialIdeas: IdeaItem[] = [
  {
    id: '1',
    description: 'AI-powered personal finance advisor that learns your spending habits and provides real-time budget recommendations',
    proposer: 'Sarah Chen',
    votes: 342,
    rank: 1
  },
  {
    id: '2',
    description: 'Decentralized social media platform where users own their data and earn tokens for quality content',
    proposer: 'Alex Rodriguez',
    votes: 318,
    rank: 2
  },
  {
    id: '3',
    description: 'Smart meal planning app that generates recipes based on ingredients you already have at home',
    proposer: 'Emma Watson',
    votes: 295,
    rank: 3
  },
  {
    id: '4',
    description: 'Virtual reality workspace for remote teams with spatial audio and collaborative 3D environments',
    proposer: 'Michael Zhang',
    votes: 287,
    rank: 4
  },
  {
    id: '5',
    description: 'Peer-to-peer skill exchange platform where people trade expertise instead of money',
    proposer: 'Lisa Johnson',
    votes: 276,
    rank: 5
  },
  {
    id: '6',
    description: 'AI-powered code review assistant that provides instant feedback and suggests optimizations',
    proposer: 'David Kim',
    votes: 264,
    rank: 6
  },
  {
    id: '7',
    description: 'Sustainable fashion marketplace connecting eco-conscious brands with conscious consumers',
    proposer: 'Sophie Martinez',
    votes: 251,
    rank: 7
  },
  {
    id: '8',
    description: 'Mental health companion app using CBT techniques and personalized meditation sessions',
    proposer: 'James Wilson',
    votes: 243,
    rank: 8
  },
  {
    id: '9',
    description: 'Blockchain-based supply chain tracker ensuring product authenticity and ethical sourcing',
    proposer: 'Nina Patel',
    votes: 235,
    rank: 9
  },
  {
    id: '10',
    description: 'Smart home energy optimizer that automatically adjusts usage based on electricity prices',
    proposer: 'Tom Anderson',
    votes: 228,
    rank: 10
  },
  {
    id: '11',
    description: 'Language learning platform using AI to create personalized conversation scenarios',
    proposer: 'Maria Garcia',
    votes: 219,
    rank: 11
  },
  {
    id: '12',
    description: 'Collaborative music creation tool where artists can jam together in real-time globally',
    proposer: 'Ryan Lee',
    votes: 207,
    rank: 12
  },
  {
    id: '13',
    description: 'Pet health monitoring system with wearable devices and AI-powered vet consultations',
    proposer: 'Jennifer Brown',
    votes: 198,
    rank: 13
  },
  {
    id: '14',
    description: 'Urban farming marketplace connecting local growers with restaurants and consumers',
    proposer: 'Chris Taylor',
    votes: 186,
    rank: 14
  },
  {
    id: '15',
    description: 'Gamified productivity app that turns daily tasks into RPG-style quests and achievements',
    proposer: 'Amanda White',
    votes: 174,
    rank: 15
  }
];

const Idea = () => {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<IdeaItem[]>(initialIdeas);

  const handleVote = (ideaId: string) => {
    setIdeas(prevIdeas => {
      // 增加投票数
      const updatedIdeas = prevIdeas.map(idea =>
        idea.id === ideaId
          ? { ...idea, votes: idea.votes + 1 }
          : idea
      );

      // 按投票数排序
      const sortedIdeas = [...updatedIdeas].sort((a, b) => b.votes - a.votes);

      // 更新排名
      return sortedIdeas.map((idea, index) => ({
        ...idea,
        rank: index + 1
      }));
    });
  };

  const handleClaim = (ideaDescription: string) => {
    // 找到对应的 idea 获取投票数
    const claimedIdeaItem = ideas.find(idea => idea.description === ideaDescription);
    const votes = claimedIdeaItem?.votes || 0;
    
    // 将 idea 和投票数存储到 sessionStorage
    sessionStorage.setItem('claimedIdea', ideaDescription);
    sessionStorage.setItem('claimedIdeaVotes', votes.toString());
    
    // 跳转到 Team Space 页面，并添加参数表示需要打开创建对话框
    navigate('/team-space?openCreate=true');
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* 顶部标题 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Startup Ideas</h1>
            <p className="text-muted-foreground">Discover and vote for the next big thing</p>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Ideas</p>
            <p className="text-2xl font-bold">{ideas.length}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Votes</p>
            <p className="text-2xl font-bold">
              {ideas.reduce((sum, idea) => sum + idea.votes, 0)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Top Idea</p>
            <p className="text-2xl font-bold truncate">{ideas[0]?.proposer}</p>
          </div>
        </div>

        {/* Ideas 网格 - 5列 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {ideas.map((idea) => (
            <IdeaCard 
              key={idea.id} 
              idea={idea}
              onVote={handleVote}
              onClaim={handleClaim}
            />
          ))}
        </div>

        {/* 空状态提示（如果需要） */}
        {ideas.length === 0 && (
          <div className="text-center py-16">
            <Lightbulb className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-3">No ideas yet</h3>
            <p className="text-muted-foreground">
              Be the first to share your startup idea!
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Idea;

