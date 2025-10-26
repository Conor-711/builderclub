import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ParticipantInfoCard, Participant } from '@/components/ParticipantInfoCard';
import { MatchingReasonsPanel, MatchingReason, Topic } from '@/components/MatchingReasonsPanel';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ArrowLeft } from 'lucide-react';

const Meeting = () => {
  const navigate = useNavigate();
  const [activeSpeaker, setActiveSpeaker] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // 参与者数据
  const participants: Participant[] = [
    {
      name: 'Amy',
      avatar: '/users/user1.jpg',
      goodAt: 'Product',
      city: 'SF',
      age: 22,
      idea: 'Build a tool that helps Twitter KOLs grow.',
      selfQualities: ['Sincere', 'Resilience', 'Optimism', 'Visionary', 'Creativity'],
      otherQualities: ['Sincere', 'Open-mindedness', 'Optimism', 'Generosity', 'Smart']
    },
    {
      name: 'Mike',
      avatar: '/users/user2.jpg',
      goodAt: 'Programming',
      city: 'New York',
      age: 23,
      idea: 'Don\'t have one.',
      selfQualities: ['Sincere', 'Resilience', 'Optimism', 'Visionary', 'Creativity'],
      otherQualities: ['Sincere', 'Open-mindedness', 'Optimism', 'Generosity', 'Smart']
    },
    {
      name: 'Amanda',
      avatar: '/users/user3.jpg',
      goodAt: 'Design',
      city: 'Shanghai',
      age: 21,
      idea: 'Build a travel guide app, but open to discussion and pivots.',
      selfQualities: ['Sincere', 'Resilience', 'Optimism', 'Visionary', 'Creativity'],
      otherQualities: ['Sincere', 'Open-mindedness', 'Optimism', 'Generosity', 'Smart']
    }
  ];

  // 匹配原因数据
  const matchingReasons: MatchingReason[] = [
    {
      id: '1',
      reason: 'Amy\'s product expertise complements Mike\'s programming skills for platform development.',
      type: 'skill'
    },
    {
      id: '2',
      reason: 'All three share interest in building creator-focused tools and early-stage startups.',
      type: 'interest'
    },
    {
      id: '3',
      reason: 'Amanda\'s design abilities combined with Mike\'s backend knowledge creates a complete tech stack.',
      type: 'skill'
    },
    {
      id: '4',
      reason: 'Shared goal of launching a product that helps content creators grow their audience.',
      type: 'goal'
    },
    {
      id: '5',
      reason: 'Amy (SF) and Amanda (Shanghai) provide geographic diversity for global reach and connections.',
      type: 'location'
    }
  ];

  // 讨论话题
  const meetingTopics: Topic[] = [
    {
      id: '1',
      title: 'Creator Monetization',
      description: 'Strategies to help creators earn sustainable income'
    },
    {
      id: '2',
      title: 'Tech Stack & MVP',
      description: 'Discuss architecture and prioritize features'
    },
    {
      id: '3',
      title: 'Go-to-Market Plan',
      description: 'Launch strategy and early user acquisition'
    }
  ];

  // 随机发光动画效果
  useEffect(() => {
    const speakInterval = setInterval(() => {
      // 停顿期
      setActiveSpeaker(null);
      
      setTimeout(() => {
        // 随机选择一个参与者
        const randomIndex = Math.floor(Math.random() * 3);
        setActiveSpeaker(randomIndex);
        
        // 持续2-3秒
        const duration = 2000 + Math.random() * 1000;
        setTimeout(() => setActiveSpeaker(null), duration);
      }, 500 + Math.random() * 500);
    }, 3500);
    
    return () => clearInterval(speakInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* 主要内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：视频区域 (70%) */}
        <div className="w-full lg:w-[70%] flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="w-full max-w-6xl space-y-4">
            {/* 匹配原因模块 */}
            <MatchingReasonsPanel 
              reasons={matchingReasons} 
              topics={meetingTopics}
              defaultCollapsed={false} 
            />

            {/* 视频网格 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className={`relative aspect-[4/3] bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 ${
                    activeSpeaker === index
                      ? 'ring-4 ring-primary shadow-2xl shadow-primary/50 scale-105'
                      : 'ring-2 ring-gray-700'
                  }`}
                >
                  {/* 视频画面（用头像模拟） */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <Avatar className="w-32 h-32 border-4 border-gray-700">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="text-4xl font-bold bg-gray-700">
                        {participant.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* 姓名标签 */}
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
                    <span className="text-white text-sm font-semibold">
                      {participant.name}
                    </span>
                  </div>

                  {/* 说话指示器（可选的音波图标） */}
                  {activeSpeaker === index && (
                    <div className="absolute top-4 right-4">
                      <div className="flex gap-1 items-end">
                        <div className="w-1 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：参与者信息卡片 (30%) */}
        <div className="hidden lg:block w-[30%] bg-white/10 backdrop-blur-md border-l border-white/10 overflow-y-auto">
          <div className="p-3 space-y-2">
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              Participants
            </h2>
            {participants.map((participant, index) => (
              <ParticipantInfoCard key={index} participant={participant} />
            ))}
          </div>
        </div>
      </div>

      {/* 底部工具栏 */}
      <div className="h-20 bg-black/80 backdrop-blur-md border-t border-gray-800 flex items-center justify-center">
        <div className="flex items-center gap-4">
          {/* 麦克风按钮 */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>

          {/* 摄像头按钮 */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isVideoOff
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5 text-white" />
            ) : (
              <Video className="w-5 h-5 text-white" />
            )}
          </button>

          {/* 结束通话按钮 */}
          <button
            onClick={() => navigate('/feedback')}
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-200 shadow-lg"
            title="End call"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>

          {/* 返回按钮 */}
          <button
            onClick={() => navigate('/connections')}
            className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all duration-200"
            title="Back to Connections"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Meeting;
