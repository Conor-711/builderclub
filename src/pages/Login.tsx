import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { analyzeUserProfileAsync } from "@/services/aiService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isCheckingSetup, setIsCheckingSetup] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, authUser, userData, isAuthLoading } = useUser();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!isAuthLoading && authUser) {
        setIsCheckingSetup(true);
        
        try {
          console.log('🔍 开始检查 onboarding 状态...');
          console.log('Auth User ID:', authUser.id);
          
          // 给触发器一点时间创建记录（如果是新注册用户）
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 重新从数据库获取最新的用户数据（不依赖 Context 的 userData）
          const { data: freshUserData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
          
          console.log('Fresh user data from DB:', freshUserData);
          console.log('User data error:', userError);
          
          // 如果数据库中还没有记录或没有基本信息，跳转到 onboarding
          // 检查是否为空字符串（新用户的默认值）或 null
          if (!freshUserData || !freshUserData.first_name || freshUserData.first_name.trim() === '') {
            console.log('🆕 New user or incomplete profile, starting onboarding');
            navigate('/setup-name');
            return;
          }
          
          // 检查基本信息完整性（SetupName页面字段）
          if (!freshUserData.last_name || freshUserData.last_name.trim() === '' || 
              !freshUserData.city || !freshUserData.age || !freshUserData.gender) {
            console.log('⚠️ Missing basic user data (name, city, age, or gender)');
            navigate('/setup-name');
            return;
          }

          // 检查 objectives（至少需要一个）
          if (!freshUserData.objectives || freshUserData.objectives.length === 0) {
            console.log('⚠️ Missing objectives');
            navigate('/select-objectives');
            return;
          }

          // 检查 idea_status
          if (!freshUserData.idea_status) {
            console.log('⚠️ Missing idea status');
            navigate('/select-idea');
            return;
          }

          // 检查 idea_fields（至少需要一个）
          if (!freshUserData.idea_fields || freshUserData.idea_fields.length === 0) {
            console.log('⚠️ Missing idea fields');
            navigate('/select-about');
            return;
          }

          // 检查 skills（至少需要一个）
          if (!freshUserData.skills || freshUserData.skills.length === 0) {
            console.log('⚠️ Missing skills');
            navigate('/select-skill');
            return;
          }

          // 检查 self_qualities（需要5个）
          if (!freshUserData.self_qualities || freshUserData.self_qualities.length !== 5) {
            console.log('⚠️ Missing or incomplete self qualities');
            navigate('/select-self');
            return;
          }

          // 检查 desired_qualities（需要5个）
          if (!freshUserData.desired_qualities || freshUserData.desired_qualities.length !== 5) {
            console.log('⚠️ Missing or incomplete desired qualities');
            navigate('/select-other');
            return;
          }

          // 🔑 检查 AI 分析状态
          console.log('🔍 检查 AI 分析状态...');
          const { data: analysis } = await supabase
            .from('ai_analysis')
            .select('id')
            .eq('user_id', authUser.id)
            .maybeSingle();

          // 如果用户完成了 onboarding 但没有 AI 分析，后台补全
          if (!analysis && 
              freshUserData.first_name && 
              freshUserData.objectives?.length > 0 &&
              freshUserData.skills?.length > 0 &&
              freshUserData.self_qualities?.length === 5 &&
              freshUserData.desired_qualities?.length === 5) {
            console.log('🔄 检测到缺失的 AI 分析，正在后台补全...');
            
            // 后台触发（不等待），让用户立即进入应用
            analyzeUserProfileAsync(authUser.id, true)
              .then(() => {
                console.log('✅ 后台 AI 分析完成');
              })
              .catch(err => {
                console.error('❌ 后台 AI 分析失败:', err);
                // 不影响用户登录流程
              });
          } else if (analysis) {
            console.log('✅ 用户已有 AI 分析');
          }

          // 所有检查通过，进入主页
          console.log('✅ User has completed onboarding');
          console.log('🚀 Redirecting to connections');
          navigate('/connections');
          
        } catch (error) {
          console.error('❌ Error checking onboarding status:', error);
          // 出错时默认跳转到 setup（新用户）
          navigate('/setup-name');
        } finally {
          setIsCheckingSetup(false);
        }
      }
    };

    checkAndRedirect();
  }, [authUser, isAuthLoading, navigate]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      // Navigation will be handled by useEffect above
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password);
      toast({
        title: "Success",
        description: "Account created successfully! Setting up your profile...",
      });
      // 不再切换到登录标签，也不清空密码
      // useEffect 会自动检测 authUser 并跳转到 onboarding
      console.log('✅ Registration completed, waiting for auto-redirect...');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Email may already be in use.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if checking auth or setup status
  if (isAuthLoading || isCheckingSetup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">
            {isCheckingSetup ? 'Checking account status...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="BuilderClub" className="w-10 h-10 rounded-full" />
          <span className="text-2xl font-bold text-primary">BuilderClub</span>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your network is waiting for you.
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                We facilitate casual conversations that lead to not-so-casual professional impact. Powered by AI.
              </p>
            </div>

            <div className="bg-card rounded-2xl shadow-lg p-8 space-y-6 max-w-lg border">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Log In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="h-12"
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full h-12 text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Log In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="h-12"
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full h-12 text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Sign Up"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center space-y-8">
            <div className="text-sm uppercase tracking-wide text-muted-foreground">
              HOW IT WORKS
            </div>
            <h2 className="text-4xl font-bold text-center">
              It's simple, <span className="relative inline-block">
                <span className="relative z-10">really</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1"></span>
              </span>
            </h2>
            <div className="bg-muted/30 rounded-full p-16 relative">
              <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <div className="space-y-4 text-center">
                  <div className="text-6xl">✨</div>
                  <div className="text-4xl">😊</div>
                  <div className="text-3xl">🎵</div>
                </div>
              </div>
            </div>
            <p className="text-center text-muted-foreground max-w-md">
              Tell us your background, goals, and what you're excited about
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
