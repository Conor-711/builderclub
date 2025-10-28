import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, UserData, ConversationStarter } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { analyzeUserProfile, analyzeUserProfileAsync, ensureUserHasAIAnalysis } from '@/services/aiService';

interface UserContextType {
  // Auth related
  authUser: User | null;
  session: Session | null;
  isAuthLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // User data related
  userId: string | null;
  userData: UserData | null;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  conversationStarters: ConversationStarter[];
  saveConversationStarters: (starters: ConversationStarter[]) => Promise<void>;
  refreshUserData: () => Promise<void>;
  
  // AI analysis related
  triggerAIAnalysis: () => Promise<void>;
  ensureAIAnalysis: (userIdToCheck?: string) => Promise<boolean>;
  isAnalyzing: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // User data state
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [conversationStarters, setConversationStarters] = useState<ConversationStarter[]>([]);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  
  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthUser(session?.user ?? null);
      setUserId(session?.user?.id ?? null);
      setIsAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthUser(session?.user ?? null);
      setUserId(session?.user?.id ?? null);
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data when userId changes
  useEffect(() => {
    if (userId) {
      refreshUserData();
    } else {
      // Clear data when logged out
      setUserData(null);
      setConversationStarters([]);
    }
  }, [userId]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    
    // 注册成功后，触发器应该已经在 public.users 创建了记录
    // 立即刷新用户数据以便后续流程使用
    if (data.user) {
      console.log('✅ User registered successfully:', data.user.id);
      // 等待一小段时间确保触发器执行完成
      await new Promise(resolve => setTimeout(resolve, 300));
      await refreshUserData(data.user.id);
      console.log('✅ User data refreshed after registration');
    }
    
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Session will be automatically set via onAuthStateChange
    return;
  };

  const signInWithGitHub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) throw error;
    
    // OAuth flow will automatically redirect to GitHub
    // After authorization, user will be redirected back to the app
    // onAuthStateChange will handle the session update
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // 如果是 session 缺失错误，忽略它（session 已经无效了）
      if (error && error.message !== 'Auth session missing!') {
        console.error('Sign out error:', error);
        throw error;
      }
    } catch (error: any) {
      // 如果是 AuthSessionMissingError，不抛出错误，继续清除本地状态
      if (error?.message !== 'Auth session missing!' && 
          error?.name !== 'AuthSessionMissingError') {
        throw error;
      }
      console.log('⚠️ Session already invalid, clearing local state');
    }
    
    // 无论如何都清除本地状态
    setAuthUser(null);
    setSession(null);
    setUserId(null);
    setUserData(null);
    setConversationStarters([]);
  };

  const refreshUserData = async (idToUse?: string) => {
    const targetId = idToUse || userId;
    if (!targetId) return;

    // Prevent multiple simultaneous loads
    if (isLoadingUserData) {
      console.log('User data already loading, skipping...');
      return;
    }

    setIsLoadingUserData(true);

    try {
      // Load essential user data first (non-blocking)
      const userResult = await supabase
        .from('users')
        .select('*')
        .eq('id', targetId)
        .single()
        .abortSignal(AbortSignal.timeout(10000)); // 10 second timeout

      // Handle user data
      if (userResult.error) {
        // If user doesn't exist yet, it's okay - they're being created
        if (userResult.error.code === 'PGRST116') {
          console.log('User profile not found yet, will be created during setup');
          setUserData(null);
          setConversationStarters([]);
          setIsLoadingUserData(false);
          return;
        }
        throw userResult.error;
      }
      setUserData(userResult.data as UserData);
      setIsLoadingUserData(false);

      // Load conversation starters in background (non-blocking, optional)
      // This won't block the page if it fails or takes too long
      supabase
        .from('conversation_starters')
        .select('*')
        .eq('user_id', targetId)
        .abortSignal(AbortSignal.timeout(5000)) // 5 second timeout
        .then(startersResult => {
          if (!startersResult.error || startersResult.error.code === 'PGRST116') {
            setConversationStarters((startersResult.data as ConversationStarter[]) || []);
          } else {
            console.log('Conversation starters not available:', startersResult.error.message);
            setConversationStarters([]);
          }
        })
        .catch(error => {
          console.log('Failed to load conversation starters:', error.message);
          setConversationStarters([]);
        });

    } catch (error: any) {
      setIsLoadingUserData(false);
      // Only log if it's not a "not found" error
      if (error?.code !== 'PGRST116') {
        console.error('Error loading user data:', error);
      }
      // Set empty state to unblock the UI
      setUserData(null);
      setConversationStarters([]);
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    // Use the id from data if provided, otherwise use userId from state
    const currentUserId = (data as any)?.id || userId;
    
    if (!currentUserId) {
      throw new Error('No user ID set. Please log in first.');
    }

    try {
      // Merge with existing userData to preserve required fields
      const updateData = userData 
        ? {
            ...userData,  // Start with existing data
            ...data,      // Override with new data
            id: currentUserId,
            updated_at: new Date().toISOString(),
          }
        : {
            // If no existing data, use what's provided (should be complete for first time)
            ...data,
            id: currentUserId,
            updated_at: new Date().toISOString(),
          };

      // Optimistic update: Update local state immediately
      setUserData(updateData as UserData);

      // Sync to server in background
      const { error } = await supabase
        .from('users')
        .upsert(updateData);

      if (error) {
        // Sync failed, refresh to restore correct state
        console.error('Sync failed, refreshing...', error);
        await refreshUserData(currentUserId);
        throw error;
      }

      // Success: No need to refresh, local data is already up-to-date!
      console.log('✅ Data updated successfully (optimistic)');
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const saveConversationStarters = async (starters: ConversationStarter[]) => {
    const currentUserId = starters[0]?.user_id || userId;
    
    if (!currentUserId) {
      throw new Error('No user ID set. Please log in first.');
    }

    try {
      // Optimistic update: Update local state immediately
      const filteredStarters = starters.filter(s => s.content.trim() !== '');
      setConversationStarters(filteredStarters);

      // Delete existing starters for this user
      await supabase
        .from('conversation_starters')
        .delete()
        .eq('user_id', currentUserId);

      // Insert new starters (only non-empty ones)
      const startersToInsert = filteredStarters.map(s => ({
        user_id: currentUserId,
        starter_type: s.starter_type,
        content: s.content,
      }));

      if (startersToInsert.length > 0) {
        const { error } = await supabase
          .from('conversation_starters')
          .insert(startersToInsert);

        if (error) {
          // Sync failed, refresh to restore correct state
          await refreshUserData(currentUserId);
          throw error;
        }
      }

      // Success: No need to refresh!
      console.log('✅ Conversation starters saved (optimistic)');
    } catch (error) {
      console.error('Error saving conversation starters:', error);
      throw error;
    }
  };

  const triggerAIAnalysis = async () => {
    if (!userId) {
      console.warn('No user ID available for AI analysis');
      return;
    }

    try {
      console.log('🤖 触发 AI 分析（后台运行）...');
      
      // 标记分析正在进行
      setIsAnalyzing(true);
      
      // 异步执行，不阻塞用户操作
      analyzeUserProfileAsync(userId, false)
        .then(() => {
          console.log('✅ AI 分析完成');
          setIsAnalyzing(false);
          // 刷新用户数据以获取最新的分析结果
          refreshUserData();
        })
        .catch((error) => {
          console.error('❌ AI 分析失败:', error);
          setIsAnalyzing(false);
          // 不抛出错误，让用户继续使用应用
        });
      
      // 立即返回，不等待分析完成
      console.log('✓ AI 分析已在后台启动');
      
    } catch (error) {
      console.error('Error triggering AI analysis:', error);
      setIsAnalyzing(false);
    }
  };

  // 确保用户有 AI 分析（检查、触发、等待）
  const ensureAIAnalysis = async (userIdToCheck?: string): Promise<boolean> => {
    const targetUserId = userIdToCheck || userId;
    if (!targetUserId) {
      console.warn('No user ID available to ensure AI analysis');
      return false;
    }

    try {
      console.log(`🔍 确保用户 ${targetUserId} 有 AI 分析...`);
      
      // 使用 aiService 中的 ensureUserHasAIAnalysis 函数
      const result = await ensureUserHasAIAnalysis(targetUserId, 30);
      
      if (result) {
        console.log('✅ 用户 AI 分析已确保存在');
        // 如果是当前用户，刷新数据
        if (targetUserId === userId) {
          await refreshUserData();
        }
      } else {
        console.warn('⚠️ 无法确保用户 AI 分析存在');
      }
      
      return result;
    } catch (error) {
      console.error('Error ensuring AI analysis:', error);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        authUser,
        session,
        isAuthLoading,
        signUp,
        signIn,
        signInWithGitHub,
        signOut,
        userId,
        userData,
        updateUserData,
        conversationStarters,
        saveConversationStarters,
        refreshUserData,
        triggerAIAnalysis,
        ensureAIAnalysis,
        isAnalyzing,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
