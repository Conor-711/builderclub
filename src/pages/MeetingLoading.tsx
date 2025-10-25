import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
// Images now loaded from public directory

const MeetingLoading = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const meetingType = searchParams.get('type');
  const isProjectMeeting = meetingType === 'project';
  const isBountyMeeting = meetingType === 'bounty';
  
  const [progress, setProgress] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showAds, setShowAds] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const words = ['Idea', 'Team', 'Build', 'Distribute'];
  
  const ads = [
    { name: 'Lovable', image: '/ads/lovable.png' },
    { name: 'Cursor', image: '/ads/cursor.png' },
    { name: 'Supabase', image: '/ads/supabase.png' },
  ];
  
  const userParticipants = [
    { name: 'Amy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amy' },
    { name: 'Mike', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
    { name: 'Amanda', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda' },
  ];

  const projectParticipants = [
    { name: 'Sonder', avatar: '/startup_logo/sonder.png' },
    { name: 'Interaction', avatar: '/startup_logo/interaction.png' },
    { name: 'Clova', avatar: '/startup_logo/clova.png' },
  ];

  const participants = (isProjectMeeting || isBountyMeeting) ? projectParticipants : userParticipants;

  // 进度条：5秒从0到100
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // 每50ms增加2%，50ms * 50次 = 2500ms = 2.5秒
      });
    }, 150);

    return () => clearInterval(progressInterval);
  }, []);

  // 文字切换：每1秒切换一次
  useEffect(() => {
    const wordInterval = setInterval(() => {
      setIsFlipping(true);
      
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
        setIsFlipping(false);
      }, 500); // 翻转动画持续0.5秒
    }, 1000);

    return () => clearInterval(wordInterval);
  }, []);

  // 广告轮播：每2.5秒切换一次（7.5秒总共展示3张）
  useEffect(() => {
    if (!showAds) return;

    const adInterval = setInterval(() => {
      setCurrentAdIndex((prev) => {
        if (prev >= ads.length - 1) {
          return prev; // 停留在最后一张
        }
        return prev + 1;
      });
    }, 2500); // 每2.5秒切换一次

    return () => clearInterval(adInterval);
  }, [showAds]);

  // 7.5秒后跳转到meeting页面
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isProjectMeeting) {
        navigate('/team-space-meeting');
      } else if (isBountyMeeting) {
        navigate('/bounty-meeting');
      } else {
        navigate('/meeting');
      }
    }, 7500);

    return () => clearTimeout(timer);
  }, [navigate, isProjectMeeting, isBountyMeeting]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-8 relative">
      {/* Ad 按钮 - 右下角 */}
      {!showAds && (
        <Button
          onClick={() => setShowAds(true)}
          className="fixed bottom-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-lg"
          size="sm"
        >
          Ad
        </Button>
      )}

      <div className="w-full max-w-2xl space-y-16">
        {/* 参与者头像/Logo和姓名 */}
        <div className="flex justify-center items-center gap-12">
          {participants.map((participant, index) => (
            <div key={index} className="flex flex-col items-center gap-4 animate-fade-in">
              {(isProjectMeeting || isBountyMeeting) ? (
                <div className="w-20 h-20 border-4 border-white shadow-2xl rounded-lg overflow-hidden bg-white flex items-center justify-center">
                  <img 
                    src={participant.avatar} 
                    alt={participant.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              ) : (
                <Avatar className="w-20 h-20 border-4 border-white shadow-2xl">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="text-xl font-bold">
                    {participant.name[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="text-white text-lg font-semibold tracking-wide">
                {participant.name}
              </div>
            </div>
          ))}
        </div>

        {/* 动态文字区域 - 3D翻转效果 */}
        <div className="flex justify-center items-center h-32 perspective-1000">
          <div
            className={`text-6xl font-bold text-white transition-all duration-500 ${
              isFlipping ? 'flip-animation' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {words[currentWordIndex]}
          </div>
        </div>

        {/* 进度条 */}
        <div className="space-y-4">
          <div className="w-full h-3 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full transition-all duration-100 ease-linear shadow-lg shadow-primary/50"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center">
            <span className="text-white/70 text-sm font-medium">
              Loading Meeting... {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* 广告展示区域 - 底部 */}
      {showAds && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 p-4 animate-slide-up">
          <div className="max-w-4xl mx-auto relative">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowAds(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 广告图片容器 - 横幅样式 */}
            <div className="relative w-full h-32 bg-white/5 rounded-lg overflow-hidden">
              <img
                src={ads[currentAdIndex].image}
                alt={ads[currentAdIndex].name}
                className="w-full h-full object-contain transition-opacity duration-500"
              />
            </div>

            {/* 广告指示器 */}
            <div className="flex justify-center gap-2 mt-3">
              {ads.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentAdIndex
                      ? 'w-8 bg-white'
                      : index < currentAdIndex
                      ? 'w-1.5 bg-white/40'
                      : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSS 动画样式 */}
      <style>{`
        @keyframes flip {
          0% {
            transform: rotateX(0deg);
            opacity: 1;
          }
          50% {
            transform: rotateX(90deg);
            opacity: 0.3;
          }
          100% {
            transform: rotateX(0deg);
            opacity: 1;
          }
        }

        .flip-animation {
          animation: flip 0.5s ease-in-out;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-fade-in:nth-child(1) {
          animation-delay: 0s;
        }
        .animate-fade-in:nth-child(2) {
          animation-delay: 0.1s;
        }
        .animate-fade-in:nth-child(3) {
          animation-delay: 0.2s;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MeetingLoading;

