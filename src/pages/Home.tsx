import AppLayout from "@/components/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUser } from "@/contexts/UserContext";
import { ConversationStarter, FriendshipWithUser } from "@/lib/supabase";
import { MapPin, Pencil, X, Check, Loader2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { getUserFriends } from "@/services/friendshipService";
import { useNavigate } from "react-router-dom";
import { FriendCard } from "@/components/FriendCard";

const conversationStarterInfo = [
  { id: "learn", title: "I'd like to learn about...", icon: "🎓", color: "text-teal-500" },
  { id: "ask", title: "Ask me about...", icon: "🎨", color: "text-orange-500" },
  { id: "mind", title: "Top of mind for me...", icon: "💡", color: "text-yellow-500" },
  { id: "learned", title: "Something I just learned...", icon: "🚀", color: "text-blue-500" },
  { id: "hustle", title: "My side hustle...", icon: "🎯", color: "text-red-500" },
];

const Home = () => {
  const { userData, conversationStarters, userId, updateUserData, saveConversationStarters, triggerAIAnalysis } = useUser();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendshipWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Basic info editing states
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [editBasicData, setEditBasicData] = useState({
    first_name: '',
    last_name: '',
    city: '',
    intro: '',
  });
  const [isSavingBasic, setIsSavingBasic] = useState(false);

  // Conversation starters editing states
  const [isEditingStarters, setIsEditingStarters] = useState(false);
  const [editStarters, setEditStarters] = useState<Record<string, string>>({});
  const [isSavingStarters, setIsSavingStarters] = useState(false);

  useEffect(() => {
    loadFriends();
  }, [userId]);

  useEffect(() => {
    if (userData) {
      setEditBasicData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        city: userData.city || '',
        intro: userData.intro || '',
      });
    }
  }, [userData]);

  useEffect(() => {
    if (conversationStarters) {
      const startersMap: Record<string, string> = {};
      conversationStarters.forEach(starter => {
        startersMap[starter.starter_type] = starter.content;
      });
      setEditStarters(startersMap);
    }
  }, [conversationStarters]);

  const loadFriends = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const friendsList = await getUserFriends(userId);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        title: '加载失败',
        description: '无法加载好友列表',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBasic = () => {
    setIsEditingBasic(true);
  };

  const handleCancelBasicEdit = () => {
    if (userData) {
      setEditBasicData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        city: userData.city || '',
        intro: userData.intro || '',
      });
    }
    setIsEditingBasic(false);
  };

  const handleSaveBasic = async () => {
    setIsSavingBasic(true);
    try {
      await updateUserData(editBasicData);
      setIsEditingBasic(false);
      toast({
        title: "Saved successfully!",
        description: "Your basic information has been updated.",
      });
      
      // 后台触发AI重新分析
      triggerAIAnalysis().catch(err => {
        console.error('AI重新分析失败:', err);
      });
      
      toast({
        title: "正在更新推荐",
        description: "我们正在根据您的新信息重新生成匹配推荐...",
      });
    } catch (error) {
      console.error('Error saving basic info:', error);
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingBasic(false);
    }
  };

  const handleEditStarters = () => {
    setIsEditingStarters(true);
  };

  const handleCancelStartersEdit = () => {
    const startersMap: Record<string, string> = {};
    conversationStarters.forEach(starter => {
      startersMap[starter.starter_type] = starter.content;
    });
    setEditStarters(startersMap);
    setIsEditingStarters(false);
  };

  const handleSaveStarters = async () => {
    setIsSavingStarters(true);
    try {
      const starters: ConversationStarter[] = Object.entries(editStarters)
        .map(([type, content]) => ({
          user_id: userId || '',
          starter_type: type as ConversationStarter['starter_type'],
          content: content || '',
        }))
        .filter(s => s.content.trim() !== '');

      await saveConversationStarters(starters);
      setIsEditingStarters(false);
      toast({
        title: "Saved successfully!",
        description: "Your conversation starters have been updated.",
      });
      
      // 后台触发AI重新分析
      triggerAIAnalysis().catch(err => {
        console.error('AI重新分析失败:', err);
      });
      
      toast({
        title: "正在更新推荐",
        description: "我们正在根据您的新信息重新生成匹配推荐...",
      });
    } catch (error) {
      console.error('Error saving starters:', error);
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingStarters(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!userData) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No user data found. Please complete the setup.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getInitials = () => {
    const first = userData.first_name?.[0] || '';
    const last = userData.last_name?.[0] || '';
    return (first + last).toUpperCase();
  };

  const fullName = `${userData.first_name} ${userData.last_name}`;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Basic Info Module - Editable */}
        <Card className="p-6 border rounded-xl relative">
          {!isEditingBasic && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={handleEditBasic}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}

          <div className="flex gap-6 items-start">
            {/* Avatar */}
            <Avatar className="w-24 h-24 bg-[#8B7355] text-white">
              <AvatarImage src={userData.avatar_url} />
              <AvatarFallback className="text-2xl font-medium bg-[#8B7355]">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 space-y-3">
              {!isEditingBasic ? (
                <>
                  <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                  
                  {userData.city && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{userData.city}</span>
                    </div>
                  )}

                  {userData.intro && (
                    <p className="text-base text-foreground leading-relaxed">
                      {userData.intro}
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      value={editBasicData.first_name}
                      onChange={(e) => setEditBasicData({ ...editBasicData, first_name: e.target.value })}
                      placeholder="First name"
                      className="h-10"
                    />
                    <Input
                      value={editBasicData.last_name}
                      onChange={(e) => setEditBasicData({ ...editBasicData, last_name: e.target.value })}
                      placeholder="Last name"
                      className="h-10"
                    />
                  </div>
                  <Input
                    value={editBasicData.city}
                    onChange={(e) => setEditBasicData({ ...editBasicData, city: e.target.value })}
                    placeholder="City"
                    className="h-10"
                  />
                  <Textarea
                    value={editBasicData.intro}
                    onChange={(e) => setEditBasicData({ ...editBasicData, intro: e.target.value })}
                    placeholder="Introduction"
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSaveBasic}
                      disabled={isSavingBasic}
                      size="sm"
                      className="gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {isSavingBasic ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      onClick={handleCancelBasicEdit}
                      disabled={isSavingBasic}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Related to Me Module */}
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Conversation Starters</h3>
                  {!isEditingStarters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditStarters}
                      className="gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </div>

                {!isEditingStarters ? (
                  conversationStarters.length > 0 ? (
                    conversationStarters.map((starter) => {
                      const info = conversationStarterInfo.find(i => i.id === starter.starter_type);
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
                  )
                ) : (
                  <div className="space-y-3">
                    <Accordion type="single" collapsible className="space-y-3">
                      {conversationStarterInfo.map((info) => (
                        <AccordionItem 
                          key={info.id} 
                          value={info.id}
                          className="border-2 rounded-xl bg-card px-4 data-[state=open]:border-primary"
                        >
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                              <span className={`text-2xl ${info.color}`}>{info.icon}</span>
                              <span className="text-base font-semibold text-foreground">
                                {info.title}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <Textarea
                              placeholder="Type your response here..."
                              value={editStarters[info.id] || ""}
                              onChange={(e) => setEditStarters({ ...editStarters, [info.id]: e.target.value })}
                              className="min-h-[100px] bg-muted border-0 resize-none"
                            />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSaveStarters}
                        disabled={isSavingStarters}
                        size="sm"
                        className="gap-2"
                      >
                        <Check className="w-4 h-4" />
                        {isSavingStarters ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={handleCancelStartersEdit}
                        disabled={isSavingStarters}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
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
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : friends.length > 0 ? (
                <div className="space-y-3">
                  {friends.map((friendship) => (
                    <FriendCard
                      key={friendship.id}
                      friendship={friendship}
                      currentUserId={userId!}
                      onClick={(friendId) => navigate(`/profile/${friendId}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">暂无好友</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    完成会面后可以添加好友
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
