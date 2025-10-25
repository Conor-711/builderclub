import { supabase, UserData, ConversationStarter, AIAnalysis } from '@/lib/supabase';

// DeepSeek API 配置
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_BASE_URL = import.meta.env.VITE_DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com';
const DEEPSEEK_MODEL = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 调用DeepSeek API
 */
async function callDeepSeekAPI(messages: DeepSeekMessage[], useJsonFormat = true): Promise<string> {
  try {
    const requestBody: DeepSeekRequest = {
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    };

    if (useJsonFormat) {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${DEEPSEEK_API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data: DeepSeekResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from DeepSeek API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw error;
  }
}

/**
 * 构建用户画像分析的Prompt
 */
function buildProfileAnalysisPrompt(
  userData: UserData,
  conversationStarters: ConversationStarter[]
): string {
  const startersText = conversationStarters
    .map(s => {
      const typeMap: Record<string, string> = {
        learn: "想要学习的内容",
        ask: "可以被询问的话题",
        mind: "当前关注的事项",
        learned: "最近学到的内容",
        hustle: "副业/项目"
      };
      return `- ${typeMap[s.starter_type] || s.starter_type}: ${s.content}`;
    })
    .join('\n');

  return `请分析以下用户信息，生成详细的用户画像。

基本信息：
- 姓名：${userData.first_name} ${userData.last_name}
- 城市：${userData.city || '未提供'}
- 个人简介：${userData.intro || '未提供'}

兴趣领域：${userData.interests && userData.interests.length > 0 ? userData.interests.join('、') : '未提供'}

目标：${userData.objectives && userData.objectives.length > 0 ? userData.objectives.join('、') : '未提供'}

对话启动器：
${startersText || '未提供'}

请提供以下内容（必须以JSON格式返回）：

1. profile_summary: 用户画像摘要（100-150字，简洁描述用户的核心特征、目标和兴趣）

2. personality_traits: 个性特征分析
   {
     "traits": [
       {
         "trait": "特征名称",
         "description": "详细说明",
         "score": 1-10的分数
       }
     ]
   }
   提供5-7个关键特征

3. goals_analysis: 目标分析（按优先级分类）
   {
     "categories": [
       {
         "category": "类别名称（如职业发展、人脉拓展、学习成长等）",
         "priority": "high/medium/low",
         "goals": ["具体目标1", "具体目标2"]
       }
     ]
   }

4. interests_analysis: 兴趣深度分析
   {
     "interests": [
       {
         "interest": "兴趣名称",
         "depth": "expert/intermediate/beginner/curious",
         "related_topics": ["相关话题1", "相关话题2"]
       }
     ]
   }

5. matching_keywords: 用于匹配的核心关键词数组（10-15个），包括技能、兴趣、目标等

返回格式示例：
{
  "profile_summary": "...",
  "personality_traits": {...},
  "goals_analysis": {...},
  "interests_analysis": {...},
  "matching_keywords": [...]
}`;
}

/**
 * 分析用户画像
 */
export async function analyzeUserProfile(
  userData: UserData,
  conversationStarters: ConversationStarter[]
): Promise<AIAnalysis> {
  try {
    console.log('开始分析用户画像...', userData.id);

    const prompt = buildProfileAnalysisPrompt(userData, conversationStarters);
    
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的用户画像分析专家。请仔细分析用户提供的信息，生成详细且准确的用户画像。返回的内容必须是有效的JSON格式。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const responseText = await callDeepSeekAPI(messages, true);
    const analysisData = JSON.parse(responseText);

    // 构建AIAnalysis对象
    const aiAnalysis: AIAnalysis = {
      user_id: userData.id,
      profile_summary: analysisData.profile_summary || '',
      personality_traits: analysisData.personality_traits || { traits: [] },
      goals_analysis: analysisData.goals_analysis || { categories: [] },
      interests_analysis: analysisData.interests_analysis || { interests: [] },
      matching_keywords: analysisData.matching_keywords || [],
      ai_model: DEEPSEEK_MODEL,
    };

    // 保存到数据库
    const { data, error } = await supabase
      .from('ai_analysis')
      .upsert({
        ...aiAnalysis,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving AI analysis:', error);
      throw error;
    }

    console.log('用户画像分析完成并保存');
    return data as AIAnalysis;
  } catch (error) {
    console.error('Error analyzing user profile:', error);
    throw error;
  }
}

/**
 * 获取用户的AI分析结果
 */
export async function getUserAnalysis(userId: string): Promise<AIAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到分析结果
        return null;
      }
      throw error;
    }

    return data as AIAnalysis;
  } catch (error) {
    console.error('Error fetching user analysis:', error);
    return null;
  }
}

/**
 * 构建匹配分析的Prompt
 */
function buildMatchAnalysisPrompt(
  userAnalysis: AIAnalysis,
  targetAnalysis: AIAnalysis,
  userData: UserData,
  targetUserData: UserData
): string {
  return `请分析两个用户的匹配度，并计算匹配分数。

用户A信息：
姓名：${userData.first_name} ${userData.last_name}
城市：${userData.city || '未提供'}
画像摘要：${userAnalysis.profile_summary}
目标：${userData.objectives?.join('、') || '未提供'}
兴趣：${userData.interests?.join('、') || '未提供'}
匹配关键词：${userAnalysis.matching_keywords.join('、')}

用户B信息：
姓名：${targetUserData.first_name} ${targetUserData.last_name}
城市：${targetUserData.city || '未提供'}
画像摘要：${targetAnalysis.profile_summary}
目标：${targetUserData.objectives?.join('、') || '未提供'}
兴趣：${targetUserData.interests?.join('、') || '未提供'}
匹配关键词：${targetAnalysis.matching_keywords.join('、')}

请评估以下维度（总分100分）：
1. 目标匹配度（0-40分）- 重点关注共同目标，如cofounder、mentor、投资人等关键目标的匹配
2. 兴趣相似度（0-30分）- 评估兴趣的重叠度和互补性
3. 地理位置匹配（0-10分）- 同城更高分
4. 个性互补度（0-20分）- 评估个性特征是否互补或相似

返回JSON格式：
{
  "match_score": 总分(0-100的数字),
  "reasons": [
    {
      "category": "目标匹配",
      "score": 分数,
      "description": "简短说明",
      "details": ["详细说明1", "详细说明2"]
    },
    {
      "category": "兴趣相似",
      "score": 分数,
      "description": "简短说明",
      "details": ["详细说明1", "详细说明2"]
    },
    {
      "category": "地理位置",
      "score": 分数,
      "description": "简短说明"
    },
    {
      "category": "个性互补",
      "score": 分数,
      "description": "简短说明"
    }
  ],
  "common_goals": ["共同目标1", "共同目标2"],
  "common_interests": ["共同兴趣1", "共同兴趣2"]
}`;
}

/**
 * 计算两个用户的匹配分数
 */
export async function calculateMatchScore(
  userId: string,
  targetUserId: string
): Promise<{ score: number; reasons: any; commonGoals: string[]; commonInterests: string[] }> {
  try {
    // 获取两个用户的画像
    const [userAnalysis, targetAnalysis] = await Promise.all([
      getUserAnalysis(userId),
      getUserAnalysis(targetUserId)
    ]);

    if (!userAnalysis) {
      console.error(`User analysis not found for user: ${userId}`);
      throw new Error(`User analysis not found for user: ${userId}`);
    }
    
    if (!targetAnalysis) {
      console.error(`User analysis not found for target user: ${targetUserId}`);
      throw new Error(`User analysis not found for target user: ${targetUserId}`);
    }

    // 获取用户基本数据
    const [userResult, targetUserResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('users').select('*').eq('id', targetUserId).single()
    ]);

    if (userResult.error) {
      console.error(`User data not found for user ${userId}:`, userResult.error);
      throw new Error(`User data not found for user: ${userId}`);
    }
    
    if (targetUserResult.error) {
      console.error(`User data not found for target user ${targetUserId}:`, targetUserResult.error);
      throw new Error(`User data not found for target user: ${targetUserId}`);
    }

    const userData = userResult.data as UserData;
    const targetUserData = targetUserResult.data as UserData;

    const prompt = buildMatchAnalysisPrompt(userAnalysis, targetAnalysis, userData, targetUserData);

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的用户匹配分析专家。请仔细分析两个用户的信息，计算他们的匹配度。返回的内容必须是有效的JSON格式。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const responseText = await callDeepSeekAPI(messages, true);
    const matchData = JSON.parse(responseText);

    return {
      score: matchData.match_score || 0,
      reasons: matchData.reasons || [],
      commonGoals: matchData.common_goals || [],
      commonInterests: matchData.common_interests || []
    };
  } catch (error) {
    console.error('Error calculating match score:', error);
    throw error;
  }
}

/**
 * 查找潜在匹配用户
 */
export async function findPotentialMatches(
  userId: string,
  limit: number = 10
): Promise<Array<{
  userId: string;
  score: number;
  reasons: any;
  commonGoals: string[];
  commonInterests: string[];
}>> {
  try {
    console.log('查找潜在匹配用户...', userId);

    // 获取当前用户的画像
    const userAnalysis = await getUserAnalysis(userId);
    if (!userAnalysis) {
      throw new Error('User analysis not found. Please complete profile analysis first.');
    }

    // 先检查总共有多少用户有AI画像（调试用）
    const { data: allAnalyses } = await supabase
      .from('ai_analysis')
      .select('user_id');
    console.log('📊 数据库中共有', allAnalyses?.length || 0, '个用户有AI画像');
    if (allAnalyses && allAnalyses.length > 0) {
      console.log('所有有画像的用户ID:', allAnalyses.map(a => a.user_id));
    }

    // 获取所有其他用户（排除自己和已经连接的用户）
    const { data: existingConnections } = await supabase
      .from('connections')
      .select('target_user_id')
      .eq('user_id', userId)
      .in('status', ['pending', 'accepted']);

    const excludedUserIds = [userId, ...(existingConnections?.map(c => c.target_user_id) || [])];
    console.log('排除的用户ID:', excludedUserIds);

    // 获取有画像的其他用户
    // 使用 neq 代替 not in，更可靠
    let query = supabase
      .from('ai_analysis')
      .select('user_id')
      .neq('user_id', userId); // 排除当前用户

    // 如果有已连接的用户，也排除它们
    if (existingConnections && existingConnections.length > 0) {
      const connectedIds = existingConnections.map(c => c.target_user_id);
      console.log('已连接的用户ID:', connectedIds);
      // 使用 not in 排除已连接用户
      query = query.not('user_id', 'in', `(${connectedIds.join(',')})`);
    }

    const { data: otherAnalyses, error } = await query;

    if (error) {
      console.error('Error fetching other analyses:', error);
      throw error;
    }

    console.log('从ai_analysis获取到的候选用户数:', otherAnalyses?.length || 0);
    if (otherAnalyses && otherAnalyses.length > 0) {
      console.log('候选用户ID列表:', otherAnalyses.map(a => a.user_id));
    }

    if (!otherAnalyses || otherAnalyses.length === 0) {
      console.log('没有找到其他用户（可能都已连接或只有当前用户）');
      return [];
    }

    // 验证这些用户在users表中确实存在
    const candidateUserIds = otherAnalyses.map(a => a.user_id);
    console.log('开始验证用户存在性，候选用户ID:', candidateUserIds);
    
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .in('id', candidateUserIds);

    if (usersError) {
      console.error('❌ Error verifying users:', usersError);
      console.error('错误详情:', JSON.stringify(usersError, null, 2));
      throw usersError;
    }

    console.log('users表中实际存在的用户数:', existingUsers?.length || 0);
    if (existingUsers && existingUsers.length > 0) {
      console.log('实际存在的用户ID列表:', existingUsers.map(u => u.id));
    } else {
      console.warn('⚠️ users表查询返回空结果！');
      console.warn('正在尝试直接查询所有users表记录...');
      
      // 额外诊断：尝试查询所有users
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, first_name, last_name');
      
      if (allUsersError) {
        console.error('❌ 查询所有users也失败:', allUsersError);
        console.error('这可能是RLS或权限问题！');
      } else {
        console.log('✅ users表中共有', allUsers?.length || 0, '条记录');
        if (allUsers && allUsers.length > 0) {
          console.log('所有用户记录:', allUsers);
          console.log('🔍 对比分析：');
          console.log('  - 候选用户ID:', candidateUserIds);
          console.log('  - 实际用户ID:', allUsers.map(u => u.id));
        }
      }
    }

    // 只保留存在的用户
    const validUserIds = new Set(existingUsers?.map(u => u.id) || []);
    const validAnalyses = otherAnalyses.filter(a => validUserIds.has(a.user_id));

    console.log(`找到 ${validAnalyses.length} 个有效候选用户（原始: ${otherAnalyses.length}）`);
    
    if (validAnalyses.length === 0) {
      console.log('⚠️ 警告：没有找到有效的候选用户');
      console.log('可能原因：');
      console.log('1. ai_analysis表中的用户在users表中不存在（数据不一致）');
      console.log('2. 所有用户都已被连接');
      console.log('3. 只有当前用户有AI画像');
      return [];
    }

    console.log('✅ 有效候选用户ID列表:', validAnalyses.map(a => a.user_id));

    // 计算匹配分数（批量处理，但限制并发数）
    const matches = [];
    const batchSize = 5; // 每批处理5个用户

    for (let i = 0; i < validAnalyses.length && matches.length < limit * 2; i += batchSize) {
      const batch = validAnalyses.slice(i, i + batchSize);
      const batchPromises = batch.map(async (analysis) => {
        try {
          const matchResult = await calculateMatchScore(userId, analysis.user_id);
          return {
            userId: analysis.user_id,
            ...matchResult
          };
        } catch (error) {
          console.error(`Error calculating match for user ${analysis.user_id}:`, error);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      matches.push(...batchResults.filter(r => r !== null));
    }

    // 按分数排序并返回top N
    const sortedMatches = matches
      .sort((a, b) => (b?.score || 0) - (a?.score || 0))
      .slice(0, limit);

    console.log(`匹配完成，返回 ${sortedMatches.length} 个推荐`);
    return sortedMatches as Array<{
      userId: string;
      score: number;
      reasons: any;
      commonGoals: string[];
      commonInterests: string[];
    }>;
  } catch (error) {
    console.error('Error finding potential matches:', error);
    throw error;
  }
}

/**
 * 构建会议分析的Prompt
 */
function buildMeetingAnalysisPrompt(
  userData: UserData,
  conversationStarters: ConversationStarter[],
  transcript: string,
  participantName?: string
): string {
  const startersText = conversationStarters
    .map(s => {
      const typeMap: Record<string, string> = {
        learn: "想要学习的内容",
        ask: "可以被询问的话题",
        mind: "当前关注的事项",
        learned: "最近学到的内容",
        hustle: "副业/项目"
      };
      return `- ${typeMap[s.starter_type] || s.starter_type}: ${s.content}`;
    })
    .join('\n');

  return `你是一位专业的会议分析助手。请分析以下会议记录，为用户提取最有价值的信息，输出的价值点尽可能简洁，每个点不要超过2句话。

用户背景信息：
- 姓名：${userData.first_name} ${userData.last_name}
- 城市：${userData.city || '未提供'}
- 简介：${userData.intro || '未提供'}
- 目标：${userData.objectives?.join('、') || '未提供'}
- 兴趣：${userData.interests?.join('、') || '未提供'}

当前关注：
${startersText || '未提供'}

会议对象：${participantName || '未提供'}

会议记录：
${transcript}

请根据用户的背景，从会议记录中提取对用户最有价值的信息，要求：

1. 最多提取5个价值点
2. 每个价值点应该：
   - 与用户的目标或兴趣高度相关
   - 具有可操作性或学习价值
   - 简洁明了（不超过100字）
3. 为每个价值点分类（从以下类别选择）：
   - business_opportunity（商业机会）
   - learning_point（学习要点）
   - networking_resource（人脉资源）
   - industry_insight（行业洞察）
   - action_item（行动建议）
4. 按重要性排序（最重要的在前）

返回JSON格式：
{
  "insights": [
    {
      "text": "价值点描述",
      "category": "分类",
      "relevance_score": 0-100的相关度分数
    }
  ],
  "summary": "会议整体价值总结（50-80字）"
}`;
}

/**
 * 分析会议记录，提取价值信息
 */
export async function analyzeMeetingTranscript(
  userId: string,
  transcript: string,
  participantName?: string
): Promise<{ insights: any[]; summary: string }> {
  try {
    console.log('开始分析会议记录...', userId);

    // 获取用户数据和画像
    const [userResult, startersResult, analysisResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('conversation_starters').select('*').eq('user_id', userId),
      getUserAnalysis(userId)
    ]);

    if (userResult.error) {
      throw new Error('Failed to fetch user data');
    }

    const userData = userResult.data as UserData;
    const conversationStarters = (startersResult.data as ConversationStarter[]) || [];

    const prompt = buildMeetingAnalysisPrompt(
      userData,
      conversationStarters,
      transcript,
      participantName
    );

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的会议分析专家。请仔细分析会议记录，提取对用户最有价值的信息。返回的内容必须是有效的JSON格式。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const responseText = await callDeepSeekAPI(messages, true);
    const analysisData = JSON.parse(responseText);

    console.log('会议分析完成');
    return {
      insights: analysisData.insights || [],
      summary: analysisData.summary || ''
    };
  } catch (error) {
    console.error('Error analyzing meeting transcript:', error);
    throw error;
  }
}

/**
 * 将保存的insights整合到用户画像中
 */
export async function updateUserProfileWithInsights(userId: string): Promise<void> {
  try {
    console.log('开始更新用户画像，整合insights...', userId);

    // 获取当前用户画像
    const currentProfile = await getUserAnalysis(userId);
    if (!currentProfile) {
      console.log('用户暂无画像，跳过insights整合');
      return;
    }

    // 获取用户所有active的insights
    const { data: insights, error } = await supabase
      .from('meeting_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20); // 只取最近的20个insights

    if (error) {
      throw error;
    }

    if (!insights || insights.length === 0) {
      console.log('用户暂无insights，跳过画像更新');
      return;
    }

    // 构建更新prompt
    const insightsText = insights
      .map((insight, index) => {
        const categoryMap: Record<string, string> = {
          business_opportunity: '商业机会',
          learning_point: '学习要点',
          networking_resource: '人脉资源',
          industry_insight: '行业洞察',
          action_item: '行动建议'
        };
        return `${index + 1}. [${categoryMap[insight.category || 'unknown']}] ${insight.insight_text}`;
      })
      .join('\n');

    const prompt = `用户当前画像：
画像摘要：${currentProfile.profile_summary}
个性特征：${JSON.stringify(currentProfile.personality_traits, null, 2)}
目标分析：${JSON.stringify(currentProfile.goals_analysis, null, 2)}
兴趣分析：${JSON.stringify(currentProfile.interests_analysis, null, 2)}
匹配关键词：${currentProfile.matching_keywords.join('、')}

用户最近的会议收获（insights）：
${insightsText}

请更新用户画像，整合这些新的信息：
1. 更新匹配关键词（如果insights中有新的技能、兴趣点、专业领域等）
2. 调整目标优先级（如果insights显示新的方向或重点）
3. 补充个性特征分析（insights可能反映出新的特质）
4. 更新profile_summary（整合最新的信息）
5. 更新兴趣分析（insights可能显示新的兴趣领域）

返回更新后的完整画像JSON，格式与当前画像相同：
{
  "profile_summary": "更新后的摘要",
  "personality_traits": {...},
  "goals_analysis": {...},
  "interests_analysis": {...},
  "matching_keywords": [...]
}`;

    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的用户画像分析专家。请根据用户的会议收获（insights），更新用户画像。返回的内容必须是有效的JSON格式。'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const responseText = await callDeepSeekAPI(messages, true);
    const updatedProfile = JSON.parse(responseText);

    // 更新数据库中的画像
    const { error: updateError } = await supabase
      .from('ai_analysis')
      .update({
        profile_summary: updatedProfile.profile_summary,
        personality_traits: updatedProfile.personality_traits,
        goals_analysis: updatedProfile.goals_analysis,
        interests_analysis: updatedProfile.interests_analysis,
        matching_keywords: updatedProfile.matching_keywords,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    console.log('✅ 用户画像已更新，已整合insights');
  } catch (error) {
    console.error('Error updating user profile with insights:', error);
    throw error;
  }
}

/**
 * 异步分析用户画像（不阻塞主流程）
 * 用于后台执行，确保即使用户logout也能完成
 */
export async function analyzeUserProfileAsync(
  userId: string,
  forceRefresh: boolean = false
): Promise<AIAnalysis | null> {
  console.log(`🔄 开始异步 AI 分析: ${userId}, forceRefresh: ${forceRefresh}`);
  
  try {
    // 检查是否已有分析且不需要刷新
    if (!forceRefresh) {
      const { data: existing, error: checkError } = await supabase
        .from('ai_analysis')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('检查现有分析时出错:', checkError);
      }
      
      if (existing) {
        console.log('✓ AI 分析已存在，跳过重新分析');
        return existing as AIAnalysis;
      }
    }

    // 执行完整的分析流程 - 先获取用户数据
    console.log('🤖 开始执行 AI 画像分析...');
    
    // 获取用户数据
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      console.error('获取用户数据失败:', userError);
      throw new Error('无法获取用户数据');
    }
    
    // 获取 conversation starters
    const { data: conversationStarters, error: startersError } = await supabase
      .from('conversation_starters')
      .select('*')
      .eq('user_id', userId);
    
    if (startersError) {
      console.error('获取 conversation starters 失败:', startersError);
      throw new Error('无法获取 conversation starters');
    }
    
    // 调用分析函数
    const result = await analyzeUserProfile(userData, conversationStarters || []);
    console.log('✅ AI 分析完成并保存到数据库');
    return result;

  } catch (error) {
    console.error('❌ AI 分析失败:', error);
    
    // 记录失败但不抛出错误，避免中断主流程
    // TODO: 可以在这里添加重试逻辑或记录到错误日志表
    return null;
  }
}

/**
 * 检查并等待 AI 分析完成（带超时）
 * 用于匹配前确保用户有 AI 分析数据
 */
export async function waitForAIAnalysis(
  userId: string,
  maxWaitSeconds: number = 30
): Promise<boolean> {
  const startTime = Date.now();
  const checkInterval = 2000; // 每2秒检查一次
  const maxWaitMs = maxWaitSeconds * 1000;

  console.log(`⏳ 等待用户 ${userId} 的 AI 分析完成（最多 ${maxWaitSeconds} 秒）...`);

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const { data: analysis, error } = await supabase
        .from('ai_analysis')
        .select('id, created_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('检查 AI 分析状态时出错:', error);
        throw error;
      }

      if (analysis) {
        const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ AI 分析已完成（等待了 ${elapsedSeconds} 秒）`);
        return true;
      }

      // 显示进度
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      console.log(`⏳ 仍在等待... (${elapsedSeconds}/${maxWaitSeconds}秒)`);

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, checkInterval));

    } catch (error) {
      console.error('检查 AI 分析状态时出错:', error);
      return false;
    }
  }

  console.warn(`⚠️ 等待 AI 分析超时（${maxWaitSeconds}秒）`);
  return false;
}

/**
 * 确保用户有 AI 分析（检查、触发、等待）
 * 这是一个便捷函数，结合了检查和生成
 */
export async function ensureUserHasAIAnalysis(
  userId: string,
  maxWaitSeconds: number = 30
): Promise<boolean> {
  console.log(`🔍 确保用户 ${userId} 有 AI 分析...`);

  try {
    // 首先检查是否已有分析
    const { data: existing, error: checkError } = await supabase
      .from('ai_analysis')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      console.log('✅ 用户已有 AI 分析');
      return true;
    }

    // 没有分析，触发生成
    console.log('⚠️ 用户缺少 AI 分析，正在生成...');
    
    // 异步触发分析（不等待完成）
    analyzeUserProfileAsync(userId, true).catch(err => {
      console.error('后台 AI 分析失败:', err);
    });

    // 等待分析完成
    const analysisReady = await waitForAIAnalysis(userId, maxWaitSeconds);
    
    if (analysisReady) {
      console.log('✅ AI 分析已完成');
      return true;
    } else {
      console.warn('⚠️ AI 分析未在超时时间内完成');
      return false;
    }

  } catch (error) {
    console.error('确保 AI 分析时出错:', error);
    return false;
  }
}

