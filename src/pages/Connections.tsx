import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TimeMatchingPanel } from "@/components/TimeMatchingPanel";
import { UpcomingMeetingsPanel } from "@/components/UpcomingMeetingsPanel";
import { MatchSuccessDialog } from "@/components/MatchSuccessDialog";
import { UserGuideDialog } from "@/components/UserGuideDialog";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Users, LogOut, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import type { TimeSlot } from "@/lib/supabase";

export type SameCityPreference = "YES" | "NO";
export type StagePreference = "IDEA" | "BUILDING" | "DISTRIBUTING";

export interface DemoSlot {
  id: string;
  date: string;
  time: string;
  duration: number;
}

export interface DemoPartner {
  name: string;
  avatar: string;
  goodAt: string;
  intro: string;
  city: string;
}

export interface DemoMeeting {
  id: string;
  date: string;
  time: string;
  duration: number;
  partners: DemoPartner[];
}

const Connections = () => {
  const { userId, userData, signOut } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sameCityFilter, setSameCityFilter] = useState<SameCityPreference>("NO");
  const [stageFilter, setStageFilter] = useState<StagePreference | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoPendingSlots, setDemoPendingSlots] = useState<DemoSlot[]>([]);
  const [demoMeetings, setDemoMeetings] = useState<DemoMeeting[]>([]);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [showIntroAnimation, setShowIntroAnimation] = useState(false);
  const [introPartnerNames, setIntroPartnerNames] = useState<string[]>([]);
  const [matchDialogData, setMatchDialogData] = useState<{
    partners: DemoPartner[];
    date: string;
    time: string;
    meetingId: string;
  } | null>(null);
  const [showUserGuide, setShowUserGuide] = useState(false);

  // Check if user is first-time visitor
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenUserGuide');
    if (!hasSeenGuide && userId) {
      // Show guide after a short delay for better UX
      const timer = setTimeout(() => {
        setShowUserGuide(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  const handleGuideComplete = () => {
    localStorage.setItem('hasSeenUserGuide', 'true');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out',
      });
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Logout failed',
        description: 'Unable to log out',
        variant: 'destructive',
      });
    }
  };

  if (!userId || !userData) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
            <p className="text-muted-foreground mt-4">Loading...</p>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 mx-auto space-y-6 max-w-5xl">
        {/* 头部 */}
        <div className="space-y-4">
          {/* <div>
            <h1 className="text-3xl font-bold text-foreground">Meet with People</h1>
            <p className="text-muted-foreground mt-1">
              Select your available time slots and we'll match you with the perfect people
            </p>
          </div> */}

          {/* 筛选区域 */}
        </div>

        {/* 单栏布局：时间选择和即将到来的会面垂直排列 */}
        <div className="space-y-6">
          {/* 时间选择模块 */}
          <TimeMatchingPanel 
              userId={userId}
              sameCityFilter={sameCityFilter}
              stageFilter={stageFilter}
              isDemoMode={isDemoMode}
              onSuccess={() => setRefreshKey(prev => prev + 1)}
              onDemoSlotSaved={(slot: TimeSlot) => {
                // Demo模式：添加到pending状态
                const newPendingSlot: DemoSlot = {
                  id: `pending-${Date.now()}`,
                  date: slot.date,
                  time: slot.time,
                  duration: slot.duration,
                };
                setDemoPendingSlots(prev => [...prev, newPendingSlot]);
                
                // 5秒后：从pending移除，添加到confirmed
                setTimeout(() => {
                  setDemoPendingSlots(prev => prev.filter(s => s.id !== newPendingSlot.id));
                  
                  const newDemoMeeting: DemoMeeting = {
                    id: `meeting-${Date.now()}`,
                    date: slot.date,
                    time: slot.time,
                    duration: slot.duration,
                    partners: [
                      {
                        name: 'Mike Chen',
                        avatar: '/users/user1.jpg',
                        goodAt: 'Programming',
                        intro: 'Full-stack developer with 8 years of experience building scalable web applications and leading engineering teams',
                        city: 'San Francisco'
                      },
                      {
                        name: 'Amanda Rodriguez',
                        avatar: '/users/user2.jpg',
                        goodAt: 'Design',
                        intro: 'Product designer specializing in user experience design and design systems for early-stage startups',
                        city: 'Palo Alto'
                      }
                    ]
                  };
                  setDemoMeetings(prev => [...prev, newDemoMeeting]);
                  
                  // First show introduction animation
                  setIntroPartnerNames(newDemoMeeting.partners.map(p => p.name));
                  setShowIntroAnimation(true);
                  
                  // After 3 seconds, hide animation and show dialog
                  setTimeout(() => {
                    setShowIntroAnimation(false);
                    
                    // Wait for fade out animation (1s) before showing dialog
                    setTimeout(() => {
                      setMatchDialogData({
                        partners: newDemoMeeting.partners,
                        date: slot.date,
                        time: slot.time,
                        meetingId: newDemoMeeting.id
                      });
                      setShowMatchDialog(true);
                    }, 1000);
                  }, 3000);
                }, 5000);
              }}
            />
          
          {/* 即将到来的会面模块 */}
          <UpcomingMeetingsPanel 
              userId={userId}
              isDemoMode={isDemoMode}
              demoPendingSlots={demoPendingSlots}
              demoMeetings={demoMeetings}
              onDeleteDemoPending={(slotId: string) => {
                setDemoPendingSlots(prev => prev.filter(s => s.id !== slotId));
              }}
              key={refreshKey} 
            />
        </div>

        {/* 右下角按钮组 */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 items-end">
          {/* User Guide按钮 */}
          <button
            onClick={() => setShowUserGuide(true)}
            className="p-2 rounded-lg bg-background border border-primary/30 hover:bg-primary/10 hover:border-primary/50 text-primary transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 group"
            title="User Guide"
          >
            <HelpCircle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </button>

          {/* Logout按钮 */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-background border border-red-200/50 hover:bg-red-50 hover:border-red-300 text-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Demo按钮 */}
        <button
          onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
            isDemoMode
              ? 'bg-foreground text-background border-foreground shadow-lg'
              : 'bg-background text-foreground border-border hover:border-foreground hover:shadow-md'
          }`}
        >
          <span className="text-sm font-medium">
            {isDemoMode ? '✓ Demo Mode' : 'Demo'}
          </span>
        </button>
        </div>

        {/* Introduction Animation - appears before dialog */}
        {showIntroAnimation && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-1000"
            style={{
              animation: 'fadeInScale 0.8s ease-out forwards',
              opacity: showIntroAnimation ? 1 : 0
            }}
          >
            <div className="text-center space-y-6 px-4" style={{
              animation: 'zoomInBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            }}>
              {/* Enhanced Decorative elements with more glow */}
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              
              {/* Main content */}
              <div className="relative z-10">
                {/* Enhanced Sparkle icon with glow */}
                <div className="flex justify-center mb-6" style={{
                  animation: 'floatBounce 2s ease-in-out infinite'
                }}>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border-2 border-white/30">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-white/20 blur-lg animate-pulse" />
                  </div>
                </div>
                
                {/* "Introduction:" text with enhanced styling */}
                <div className="mb-3">
                  <p 
                    className="text-base md:text-lg font-light text-white tracking-[0.15em] uppercase"
                    style={{
                      animation: 'fadeIn 0.6s ease-out forwards',
                      textShadow: '0 0 12px rgba(255,255,255,0.2), 0 0 24px rgba(255,255,255,0.1)'
                    }}
                  >
                    Introduction
                  </p>
                </div>
                
                {/* Partner names - Pure White with enhanced effects */}
                <div className="space-y-3">
                  <h1 
                    className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight"
                    style={{
                      animation: 'slideUpFadeScale 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards',
                      opacity: 0,
                      textShadow: '0 0 30px rgba(255,255,255,0.35), 0 0 60px rgba(255,255,255,0.18), 0 4px 16px rgba(0,0,0,0.3)'
                    }}
                  >
                    {introPartnerNames.join(' & ')}
                  </h1>
                  
                  {/* Enhanced Decorative line */}
                  <div className="flex justify-center mt-6" style={{
                    animation: 'expandFade 0.8s ease-out 0.6s forwards',
                    opacity: 0
                  }}>
                    <div className="relative">
                      <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent" />
                      <div className="absolute inset-0 w-32 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent blur-sm" />
                    </div>
                  </div>
                </div>
                
                {/* Subtitle with glow */}
                <p 
                  className="text-base md:text-lg text-white/90 font-light tracking-wide mt-6"
                  style={{
                    animation: 'fadeIn 1s ease-out 0.8s forwards',
                    opacity: 0,
                    textShadow: '0 0 15px rgba(255,255,255,0.25)'
                  }}
                >
                  Your BuilderClub Matches
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced keyframe animations */}
        <style>{`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              backdrop-filter: blur(0);
            }
            100% {
              opacity: 1;
              backdrop-filter: blur(12px);
            }
          }
          
          @keyframes zoomInBounce {
            0% {
              opacity: 0;
              transform: scale(0.85);
            }
            60% {
              opacity: 1;
              transform: scale(1.05);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes slideUpFadeScale {
            0% {
              opacity: 0;
              transform: translateY(40px) scale(0.95);
            }
            60% {
              opacity: 1;
              transform: translateY(-5px) scale(1.02);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes fadeIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
          
          @keyframes expandFade {
            0% {
              opacity: 0;
              transform: scaleX(0);
            }
            100% {
              opacity: 1;
              transform: scaleX(1);
            }
          }
          
          @keyframes floatBounce {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>

        {/* Match Success Dialog - Demo模式专用 */}
        <MatchSuccessDialog
          open={showMatchDialog}
          onOpenChange={setShowMatchDialog}
          currentUserName={userData ? `${userData.first_name} ${userData.last_name}` : 'You'}
          partners={matchDialogData?.partners || []}
          meetingDate={matchDialogData?.date || ''}
          meetingTime={matchDialogData?.time || ''}
          meetingId={matchDialogData?.meetingId || ''}
        />

        {/* User Guide Dialog */}
        <UserGuideDialog
          open={showUserGuide}
          onOpenChange={setShowUserGuide}
          onComplete={handleGuideComplete}
        />
      </div>
    </AppLayout>
  );
};

export default Connections;

