import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectInfoCard, ProjectMeetingInfo } from '@/components/ProjectInfoCard';
import { MatchingReasonsPanel, MatchingReason, Topic } from '@/components/MatchingReasonsPanel';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ArrowLeft } from 'lucide-react';
// Project logos now loaded from public directory

const TeamSpaceMeeting = () => {
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // 项目数据
  const projects: ProjectMeetingInfo[] = [
    {
      name: 'Sonder',
      logo: '/startup_logo/sonder.png',
      description: 'AI-powered empathy platform helping people understand and express emotions better through personalized insights and interactive experiences.',
      recentIssues: 'Need to validate product-market fit with early users and refine our AI emotion detection algorithms.',
      canOffer: 'AI/ML expertise, user research insights, emotional intelligence framework, beta testing platform.'
    },
    {
      name: 'Interaction',
      logo: '/startup_logo/interaction.png',
      description: 'Real-time design collaboration tool for distributed teams, enabling seamless creative workflows across time zones.',
      recentIssues: 'Looking for technical co-founder to build MVP and establish real-time synchronization infrastructure.',
      canOffer: 'Design system expertise, UX best practices, early adopter network of 500+ designers, Figma integration knowledge.'
    },
    {
      name: 'Clova',
      logo: '/startup_logo/clova.png',
      description: 'Affordable smart home automation for everyone. Democratizing IoT with easy-to-install devices that work seamlessly together.',
      recentIssues: 'Seeking hardware manufacturing partners in Asia and distribution channels for consumer electronics.',
      canOffer: 'IoT expertise, supply chain connections in Shenzhen, smart home protocol knowledge, consumer hardware experience.'
    }
  ];

  // 项目匹配原因
  const matchingReasons: MatchingReason[] = [
    {
      id: '1',
      reason: 'Sonder\'s AI/ML capabilities can enhance Interaction\'s real-time collaboration features with emotion-aware features.',
      type: 'skill'
    },
    {
      id: '2',
      reason: 'All three projects are solving problems for specific user bases with strong product differentiation.',
      type: 'interest'
    },
    {
      id: '3',
      reason: 'Interaction\'s design expertise can help Clova improve IoT device UX and user onboarding experience.',
      type: 'skill'
    },
    {
      id: '4',
      reason: 'Shared goal of building technology products that improve daily life and scale globally.',
      type: 'goal'
    },
    {
      id: '5',
      reason: 'Complementary strengths: AI, Design, and Hardware create opportunities for strategic partnerships.',
      type: 'stage'
    }
  ];

  // 讨论话题
  const meetingTopics: Topic[] = [
    {
      id: '1',
      title: 'Technology Integration',
      description: 'Explore partnerships and technical synergies'
    },
    {
      id: '2',
      title: 'Market Expansion',
      description: 'Joint go-to-market strategies and channels'
    },
    {
      id: '3',
      title: 'Team & Resources',
      description: 'Discuss hiring, funding, and collaboration models'
    }
  ];

  // 随机发光动画效果
  useEffect(() => {
    const speakInterval = setInterval(() => {
      // 停顿期
      setActiveProject(null);
      
      setTimeout(() => {
        // 随机选择一个项目
        const randomIndex = Math.floor(Math.random() * 3);
        setActiveProject(randomIndex);
        
        // 持续2-3秒
        const duration = 2000 + Math.random() * 1000;
        setTimeout(() => setActiveProject(null), duration);
      }, 500 + Math.random() * 500);
    }, 3500);
    
    return () => clearInterval(speakInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：项目Logo区域 (70%) */}
        <div className="w-full lg:w-[70%] flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-6xl space-y-4">
            {/* 匹配原因模块 */}
            <MatchingReasonsPanel 
              reasons={matchingReasons} 
              topics={meetingTopics}
              defaultCollapsed={false} 
            />

            {/* 项目网格 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {projects.map((project, index) => (
              <div
                key={index}
                className={`relative aspect-[4/3] bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 ${
                  activeProject === index
                    ? 'ring-4 ring-primary shadow-2xl shadow-primary/50 scale-105'
                    : 'ring-2 ring-gray-700'
                }`}
              >
                {/* 项目Logo（模拟视频画面） */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="w-40 h-40 rounded-2xl overflow-hidden bg-white flex items-center justify-center shadow-2xl border-4 border-gray-700">
                    <img 
                      src={project.logo} 
                      alt={project.name}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                </div>

                {/* 项目名称标签 */}
                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
                  <span className="text-white text-sm font-semibold">
                    {project.name}
                  </span>
                </div>

                {/* 活跃指示器 */}
                {activeProject === index && (
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* 右侧：项目信息卡片 (30%) */}
        <div className="hidden lg:block w-[30%] bg-white/10 backdrop-blur-md border-l border-white/10 overflow-y-auto">
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold text-white mb-4 sticky top-0 bg-gray-900/80 backdrop-blur-sm py-2 px-2 rounded-lg">
              Project Information
            </h2>
            {projects.map((project, index) => (
              <ProjectInfoCard 
                key={index} 
                project={project}
                defaultCollapsed={index === 0}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 底部工具栏 */}
      <div className="bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* 左侧：返回按钮 */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* 中间：控制按钮 */}
          <div className="flex items-center gap-4">
            {/* 麦克风 */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-all ${
                isMuted
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            {/* 摄像头 */}
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-4 rounded-full transition-all ${
                isVideoOff
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6 text-white" />
              ) : (
                <Video className="w-6 h-6 text-white" />
              )}
            </button>

            {/* 结束通话 */}
            <button
              onClick={() => navigate('/feedback')}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* 右侧：占位 */}
          <div className="w-24" />
        </div>
      </div>
    </div>
  );
};

export default TeamSpaceMeeting;

