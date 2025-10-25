import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectionWithUser } from "@/lib/supabase";
import { ScheduledMeetingsList } from "@/components/ScheduledMeetingsList";
import { AvailabilityList } from "@/components/AvailabilityList";
import MeetingAnalysisDialog from "@/components/MeetingAnalysisDialog";
import type { ScheduledMeetingWithUsers } from "@/lib/supabase";
import { getUserAvailability, deleteAvailability } from "@/services/timeMatchingService";
import { 
  getAcceptedConnections, 
  getPendingConnections,
  getReceivedConnectionRequests,
  acceptConnection,
  rejectConnection 
} from "@/services/connectionService";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, CheckCircle, XCircle, Loader2, Users, Mail, History, Calendar } from "lucide-react";

const ConnectionHistory = () => {
  const { userId } = useUser();
  const { toast } = useToast();
  const [acceptedConnections, setAcceptedConnections] = useState<ConnectionWithUser[]>([]);
  const [pendingConnections, setPendingConnections] = useState<ConnectionWithUser[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ConnectionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  // 新增：会面管理相关状态
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMeetingForAnalysis, setSelectedMeetingForAnalysis] = 
    useState<ScheduledMeetingWithUsers | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      loadAllConnections();
    }
  }, [userId]);

  const loadAllConnections = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      const [accepted, pending, received] = await Promise.all([
        getAcceptedConnections(userId),
        getPendingConnections(userId),
        getReceivedConnectionRequests(userId)
      ]);
      
      setAcceptedConnections(accepted);
      setPendingConnections(pending);
      setReceivedRequests(received);
    } catch (error: any) {
      console.error('Error loading connections:', error);
      toast({
        title: "加载失败",
        description: error.message || "无法加载连接历史",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    setProcessingIds(prev => new Set(prev).add(connectionId));
    try {
      await acceptConnection(connectionId);
      await loadAllConnections();
      toast({
        title: "已接受",
        description: "您已接受该连接请求",
      });
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message || "无法接受连接请求",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    setProcessingIds(prev => new Set(prev).add(connectionId));
    try {
      await rejectConnection(connectionId);
      await loadAllConnections();
      toast({
        title: "已拒绝",
        description: "您已拒绝该连接请求",
      });
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message || "无法拒绝连接请求",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  // 新增：会面管理相关处理函数
  const handleMeetingComplete = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleAnalyzeMeeting = (meeting: ScheduledMeetingWithUsers) => {
    console.log('打开会议分析对话框:', meeting);
    setSelectedMeetingForAnalysis(meeting);
    setIsAnalysisDialogOpen(true);
  };

  const handleDeleteAvailability = async (slotId: string) => {
    if (!userId) return;
    
    if (!confirm('确定要删除这个时间段吗？')) return;

    try {
      await deleteAvailability(slotId, userId);
      toast({
        title: "删除成功",
        description: "时间段已删除",
      });
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      console.error('Error deleting availability:', error);
      toast({
        title: "删除失败",
        description: error.message || "无法删除时间段",
        variant: "destructive",
      });
    }
  };

  const renderConnectionCard = (connection: ConnectionWithUser, showActions = false) => {
    const user = connection.target_user;
    const getInitials = () => {
      const first = user.first_name?.[0] || '';
      const last = user.last_name?.[0] || '';
      return (first + last).toUpperCase();
    };
    const fullName = `${user.first_name} ${user.last_name}`;

    return (
      <Card key={connection.id} className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 bg-[#8B7355]">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-xl bg-[#8B7355] text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {fullName}
                </h3>
                {user.city && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.city}</span>
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="flex-shrink-0">
                匹配度 {connection.match_score.toFixed(0)}%
              </Badge>
            </div>

            {user.intro && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {user.intro}
              </p>
            )}

            {user.interests && user.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {user.interests.slice(0, 4).map((interest, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {user.interests.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{user.interests.length - 4}
                  </Badge>
                )}
              </div>
            )}

            {showActions && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleAcceptRequest(connection.id)}
                  disabled={processingIds.has(connection.id)}
                  size="sm"
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  接受
                </Button>
                <Button
                  onClick={() => handleRejectRequest(connection.id)}
                  disabled={processingIds.has(connection.id)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  拒绝
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">正在加载连接历史...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">连接与会面管理</h1>
          <p className="text-muted-foreground mt-1">
            管理您的连接请求和会面安排
          </p>
        </div>

        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="connections" className="gap-2">
              <Users className="w-4 h-4" />
              连接管理
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Clock className="w-4 h-4" />
              即将进行
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              历史记录
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2">
              <Calendar className="w-4 h-4" />
              我的时间
            </TabsTrigger>
          </TabsList>

          {/* 连接管理标签 */}
          <TabsContent value="connections" className="space-y-4 mt-6">
            <Tabs defaultValue="received" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="received" className="gap-2">
                  <Mail className="w-4 h-4" />
                  收到的请求
                  {receivedRequests.length > 0 && (
                    <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                      {receivedRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="w-4 h-4" />
                  待处理
                  {pendingConnections.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {pendingConnections.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="accepted" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  已连接
                  {acceptedConnections.length > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {acceptedConnections.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

          <TabsContent value="received" className="space-y-4 mt-6">
            {receivedRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">暂无新请求</h3>
                <p className="text-muted-foreground">
                  您还没有收到任何连接请求
                </p>
              </Card>
            ) : (
              receivedRequests.map(conn => renderConnectionCard(conn, true))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingConnections.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">暂无待处理请求</h3>
                <p className="text-muted-foreground">
                  您还没有发送任何待处理的连接请求
                </p>
              </Card>
            ) : (
              pendingConnections.map(conn => renderConnectionCard(conn))
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4 mt-6">
            {acceptedConnections.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">暂无已连接用户</h3>
                <p className="text-muted-foreground">
                  您还没有建立任何连接
                </p>
              </Card>
            ) : (
              acceptedConnections.map(conn => renderConnectionCard(conn))
            )}
          </TabsContent>
            </Tabs>
          </TabsContent>

          {/* 即将进行标签 */}
          <TabsContent value="upcoming" className="space-y-4 mt-6">
            <ScheduledMeetingsList
              key={`upcoming-${refreshKey}`}
              userId={userId!}
              status="scheduled"
              onMeetingComplete={handleMeetingComplete}
            />
          </TabsContent>

          {/* 历史记录标签 */}
          <TabsContent value="history" className="space-y-4 mt-6">
            <ScheduledMeetingsList
              key={`history-${refreshKey}`}
              userId={userId!}
              status="completed"
              onAnalyzeMeeting={handleAnalyzeMeeting}
            />
          </TabsContent>

          {/* 我的可用时间标签 */}
          <TabsContent value="availability" className="space-y-4 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">我的可用时间</h2>
              <p className="text-sm text-muted-foreground mb-6">
                这里显示您所有的可用时间段。已安排会面的时间段无法删除。
              </p>
              <AvailabilityListWrapper
                userId={userId!}
                onDelete={handleDeleteAvailability}
                refreshKey={refreshKey}
              />
            </Card>
          </TabsContent>
        </Tabs>

        {/* 会议分析对话框 */}
        <MeetingAnalysisDialog
          meeting={selectedMeetingForAnalysis || undefined}
          currentUserId={userId!}
          open={isAnalysisDialogOpen}
          onOpenChange={setIsAnalysisDialogOpen}
        />
      </div>
    </AppLayout>
  );
};

// 可用时间列表包装组件（处理异步加载）
function AvailabilityListWrapper({
  userId,
  onDelete,
  refreshKey,
}: {
  userId: string;
  onDelete: (slotId: string) => void;
  refreshKey: number;
}) {
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const data = await getUserAvailability(userId, today);
      setSlots(data);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots, refreshKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return <AvailabilityList slots={slots} onDelete={onDelete} />;
}

export default ConnectionHistory;
