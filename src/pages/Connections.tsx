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
      <div className="p-6 mx-auto space-y-6 max-w-7xl">
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

        {/* 两栏布局：左侧会面管理，右侧即将到来的会面 */}
        <div className="lg:grid lg:grid-cols-[70%_30%] lg:gap-6 space-y-6 lg:space-y-0">
          {/* 左侧：会面管理 */}
          <div>
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
                        avatar: '/src/assets/users/user1.jpg',
                        goodAt: 'Programming',
                        intro: 'Full-stack developer with 8 years of experience building scalable web applications and leading engineering teams',
                        city: 'San Francisco'
                      },
                      {
                        name: 'Amanda Rodriguez',
                        avatar: '/src/assets/users/user2.jpg',
                        goodAt: 'Design',
                        intro: 'Product designer specializing in user experience design and design systems for early-stage startups',
                        city: 'Palo Alto'
                      }
                    ]
                  };
                  setDemoMeetings(prev => [...prev, newDemoMeeting]);
                  
                  // Trigger match success dialog
                  setMatchDialogData({
                    partners: newDemoMeeting.partners,
                    date: slot.date,
                    time: slot.time,
                    meetingId: newDemoMeeting.id
                  });
                  setShowMatchDialog(true);
                }, 5000);
              }}
            />
          </div>

          
          
          {/* 右侧：即将到来的会面 */}
          <div className="lg:sticky lg:top-20 self-start">
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
