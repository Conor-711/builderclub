import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 添加缓存破坏器强制刷新连接
const cacheBuster = Date.now();
console.log('🔄 Supabase client initialized at:', new Date(cacheBuster).toISOString());

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': `pixel-path-${cacheBuster}`,
    },
  },
});

// Types for our database tables
export interface QualityWithOrder {
  quality: string;
  order: number;
}

export interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  intro: string;
  avatar_url: string;
  twitter_url: string;
  linkedin_url: string;
  interests: string[];
  objectives: string[];
  age?: number;
  gender?: string;
  idea_status?: string;
  idea_fields?: string[];
  skills?: string[];
  self_qualities?: QualityWithOrder[];
  desired_qualities?: QualityWithOrder[];
  created_at?: string;
  updated_at?: string;
}

export interface ConversationStarter {
  id?: string;
  user_id: string;
  starter_type: 'learn' | 'ask' | 'mind' | 'learned' | 'hustle';
  content: string;
  created_at?: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_name: string;
  friend_avatar: string;
  created_at?: string;
}

// AI Analysis types
export interface PersonalityTrait {
  trait: string;
  description: string;
  score?: number;
}

export interface GoalCategory {
  category: string;
  priority: 'high' | 'medium' | 'low';
  goals: string[];
}

export interface InterestAnalysis {
  interest: string;
  depth: 'expert' | 'intermediate' | 'beginner' | 'curious';
  related_topics?: string[];
}

export interface AIAnalysis {
  id?: string;
  user_id: string;
  profile_summary: string;
  personality_traits: {
    traits: PersonalityTrait[];
  };
  goals_analysis: {
    categories: GoalCategory[];
  };
  interests_analysis: {
    interests: InterestAnalysis[];
  };
  matching_keywords: string[];
  ai_model: string;
  created_at?: string;
  updated_at?: string;
}

// Connection types
export type ConnectionStatus = 'suggested' | 'pending' | 'accepted' | 'rejected';

export interface MatchReason {
  category: string;
  score: number;
  description: string;
  details?: string[];
}

export interface Connection {
  id: string;
  user_id: string;
  target_user_id: string;
  match_score: number;
  match_reasons: {
    reasons: MatchReason[];
    common_goals?: string[];
    common_interests?: string[];
  };
  status: ConnectionStatus;
  suggested_at: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

// Extended connection with user data
export interface ConnectionWithUser extends Connection {
  target_user: UserData;
}

// Meeting records types
export interface MeetingRecord {
  id: string;
  user_id: string;
  connection_id?: string;
  meeting_date?: string;
  transcript: string;
  participant_name?: string;
  ai_model?: string;
  created_at: string;
  updated_at: string;
}

export type InsightCategory = 
  | 'business_opportunity'
  | 'learning_point'
  | 'networking_resource'
  | 'industry_insight'
  | 'action_item';

export interface MeetingInsight {
  id?: string;
  meeting_record_id: string;
  user_id: string;
  insight_text: string;
  insight_order: number;
  category?: InsightCategory;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MeetingAnalysisResult {
  insights: Array<{
    text: string;
    category: InsightCategory;
    relevance_score: number;
  }>;
  summary: string;
}

// Time-based matching types
export type MeetingDuration = 5 | 15 | 45;

export type AvailabilityStatus = 'available' | 'scheduled' | 'completed' | 'cancelled';

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface UserAvailability {
  id: string;
  user_id: string;
  date: string;  // YYYY-MM-DD
  time_slot: string;  // HH:MM (24小时制)
  duration: MeetingDuration;
  status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
}

export interface ScheduledMeeting {
  id: string;
  user_a_id: string;
  user_b_id: string;
  availability_a_id: string;
  availability_b_id: string;
  meeting_date: string;
  meeting_time: string;
  duration: number;
  match_score?: number;
  match_reasons?: any;
  status: MeetingStatus;
  meeting_link?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledMeetingWithUsers extends ScheduledMeeting {
  user_a: UserData;
  user_b: UserData;
}

export interface TimeSlot {
  date: string;
  time: string;
  duration: MeetingDuration;
}

// Friendship types
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  meeting_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FriendshipWithUser extends Friendship {
  user: UserData; // 对方的用户信息
}

export type FriendshipDirection = 'sent' | 'received';

// User block types
export interface UserBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason?: string;
  meeting_id?: string;
  created_at: string;
}

// Social Graph types
export interface GraphNode {
  id: string;
  type: 'self' | 'friend' | 'friend-of-friend';
  userData: UserData;
  degree: 0 | 1 | 2;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'direct' | 'indirect';
}

export interface SocialGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

