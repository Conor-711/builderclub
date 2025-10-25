import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TimeMatchingPanel } from "@/components/TimeMatchingPanel";
import { UpcomingMeetingsPanel } from "@/components/UpcomingMeetingsPanel";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Users, LogOut } from "lucide-react";
import { useState } from "react";
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
                        name: 'Mike',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
                        goodAt: 'Programming'
                      },
                      {
                        name: 'Amanda',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda',
                        goodAt: 'Design'
                      }
                    ]
                  };
                  setDemoMeetings(prev => [...prev, newDemoMeeting]);
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

        {/* Demo按钮 - 右下角固定定位 */}
        <button
          onClick={() => setIsDemoMode(!isDemoMode)}
          className={`fixed bottom-8 right-8 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
            isDemoMode
              ? 'bg-foreground text-background border-foreground shadow-lg'
              : 'bg-background text-foreground border-border hover:border-foreground hover:shadow-md'
          }`}
        >
          <span className="text-sm font-medium">
            {isDemoMode ? '✓ Demo Mode' : 'Demo'}
          </span>
        </button>

        {/* Logout按钮 - 右下角，在Demo按钮上方 */}
        <button
          onClick={handleLogout}
          className="fixed bottom-24 right-8 p-2 rounded-lg bg-background border border-red-200/50 hover:bg-red-50 hover:border-red-300 text-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </AppLayout>
  );
};

export default Connections;
