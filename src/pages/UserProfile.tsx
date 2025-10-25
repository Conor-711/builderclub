import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Lock, 
  Users, 
  UserPlus, 
  Heart, 
  Sparkles,
  Loader2,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import type { UserData, ConversationStarter, FriendshipWithUser } from '@/lib/supabase';
import type { UserRelationship } from '@/services/profilePermissionService';
import { getVisibleUserData } from '@/services/profilePermissionService';
import { sendFriendRequest, checkFriendshipStatus } from '@/services/friendshipService';
import { FriendCard } from '@/components/FriendCard';

const conversationStarterInfo = [
  { id: 'learn', title: "I'd like to learn about...", icon: '🎓', color: 'text-teal-500' },
  { id: 'ask', title: 'Ask me about...', icon: '🎨', color: 'text-orange-500' },
  { id: 'mind', title: 'Top of mind for me...', icon: '💡', color: 'text-yellow-500' },
  { id: 'learned', title: 'Something I just learned...', icon: '🚀', color: 'text-blue-500' },
  { id: 'hustle', title: 'My side hustle...', icon: '🎯', color: 'text-red-500' },
];

const UserProfile = () => {
  const { userId: profileUserId } = useParams<{ userId: string }>();
  const { userId: currentUserId, signOut } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [relationship, setRelationship] = useState<UserRelationship>('stranger');
  const [userData, setUserData] = useState<Partial<UserData> | null>(null);
  const [conversationStarters, setConversationStarters] = useState<ConversationStarter[]>([]);
  const [friends, setFriends] = useState<FriendshipWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'rejected'>('none');
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  useEffect(() => {
    if (!profileUserId || !currentUserId) return;
    loadUserProfile();
  }, [profileUserId, currentUserId]);

  const loadUserProfile = async () => {
    if (!profileUserId || !currentUserId) return;

    setIsLoading(true);
    try {
      // 获取可见的用户数据
      const data = await getVisibleUserData(currentUserId, profileUserId);
      
      setRelationship(data.relationship);
      setUserData(data.userData);
      setConversationStarters(data.conversationStarters);
      setFriends(data.friends);

      // 如果不是自己，检查好友请求状态
      if (data.relationship !== 'self') {
        const { status } = await checkFriendshipStatus(currentUserId, profileUserId);
        setFriendshipStatus(status);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: 'Load failed',
        description: 'Cannot load user profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!currentUserId || !profileUserId) return;

    setIsSendingRequest(true);
    try {
      await sendFriendRequest(currentUserId, profileUserId);
      toast({
        title: 'Friend request sent',
        description: 'Waiting for other user to accept',
      });
      setFriendshipStatus('pending_sent');
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      toast({
        title: 'Send failed',
        description: error.message || 'Cannot send friend request',
        variant: 'destructive',
      });
    } finally {
      setIsSendingRequest(false);
    }
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

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!userData) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">User not found</h2>
            <p className="text-muted-foreground mb-6">
              User not found
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const isFullAccess = relationship === 'self' || relationship === 'friend';

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* 顶部按钮区域 */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {/* 只在查看自己的 Profile 时显示 Logout 按钮 */}
          {relationship === 'self' && (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          )}
        </div>

        {/* 基本信息卡片 - 所有人可见 */}
        <Card className="p-8">
          <div className="flex items-start gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={userData.avatar_url} />
              <AvatarFallback className="text-3xl">
                {userData.first_name?.[0]}
                {userData.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                  {userData.first_name} {userData.last_name}
                </h1>
                {relationship === 'self' && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    我的资料
                  </Badge>
                )}
                {relationship === 'friend' && (
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
                    <Heart className="w-3 h-3" />
                    好友
                  </Badge>
                )}
              </div>
              {userData.city && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{userData.city}</span>
                </div>
              )}
              {userData.intro && (
                <p className="text-muted-foreground leading-relaxed">
                  {userData.intro}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* 详细信息区域 - 条件渲染 */}
        {!isFullAccess ? (
          /* 陌生人视图 */
          <Card className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">添加好友查看更多信息</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              成为好友后，您可以查看 TA 的兴趣、目标、对话启动器和好友
            </p>
            {friendshipStatus === 'none' && (
              <Button
                size="lg"
                onClick={handleSendFriendRequest}
                disabled={isSendingRequest}
                className="gap-2"
              >
                {isSendingRequest ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    发送中...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    发送好友请求
                  </>
                )}
              </Button>
            )}
            {friendshipStatus === 'pending_sent' && (
              <Button size="lg" disabled className="gap-2">
                <UserPlus className="w-4 h-4" />
                已发送请求
              </Button>
            )}
            {friendshipStatus === 'pending_received' && (
              <div className="space-y-2">
                <p className="text-sm text-amber-600 mb-3">
                  TA 已向您发送好友请求，请到设置页面处理
                </p>
                <Button size="lg" onClick={() => navigate('/settings')}>
                  前往设置
                </Button>
              </div>
            )}
          </Card>
        ) : (
          /* 好友/自己视图 */
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Related to Me</h2>
            
            <Tabs defaultValue="about-me" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about-me">About me</TabsTrigger>
                <TabsTrigger value="my-friends">My friends</TabsTrigger>
              </TabsList>

              {/* About Me Tab */}
              <TabsContent value="about-me" className="space-y-4 mt-4">
                {/* Conversation Starters Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Conversation Starters</h3>
                  {conversationStarters.length > 0 ? (
                    conversationStarters.map((starter) => {
                      const info = conversationStarterInfo.find(
                        (i) => i.id === starter.starter_type
                      );
                      if (!info) return null;

                      return (
                        <Card key={starter.id || starter.starter_type} className="p-4 border-2 rounded-lg">
                          <div className="flex items-start gap-3">
                            <span className={`text-2xl ${info.color}`}>{info.icon}</span>
                            <div className="flex-1 space-y-1">
                              <h3 className="font-semibold text-foreground">{info.title}</h3>
                              <p className="text-muted-foreground">{starter.content}</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No conversation starters yet.</p>
                    </div>
                  )}
                </div>

                {/* Interests Section */}
                {userData.interests && userData.interests.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {userData.interests.map((interest, index) => (
                        <Badge key={`interest-${interest}-${index}`} variant="secondary" className="px-3 py-1 text-sm">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objectives Section */}
                {userData.objectives && userData.objectives.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Objectives</h3>
                    <div className="flex flex-wrap gap-2">
                      {userData.objectives.map((objective, index) => (
                        <Badge key={`objective-${objective}-${index}`} variant="secondary" className="px-3 py-1 text-sm">
                          {objective}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* My Friends Tab */}
              <TabsContent value="my-friends" className="space-y-3 mt-4">
                {friends.length > 0 ? (
                  <div className="space-y-3">
                    {friends.map((friendship) => (
                      <FriendCard
                        key={friendship.id}
                        friendship={friendship}
                        currentUserId={profileUserId!}
                        onClick={(friendId) => navigate(`/profile/${friendId}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">暂无好友</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default UserProfile;

