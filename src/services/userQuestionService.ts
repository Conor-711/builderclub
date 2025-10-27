/**
 * User Question Service
 * Handles user question answers for user profiling
 */

import { supabase } from '@/lib/supabase';

export interface Question {
  id: string;
  text: string;
  context: string;
  order: number;
  created_at: string;
}

export interface UserAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer: string;
  input_method: 'voice' | 'text';
  created_at: string;
}

/**
 * Get questions for a specific context (e.g., 'meeting-loading')
 */
export async function getQuestionsForContext(context: string): Promise<Question[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('context', context)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get questions:', error);
    throw error;
  }
}

/**
 * Submit a user's answer to a question
 */
export async function submitAnswer(
  userId: string,
  questionId: string,
  answer: string,
  inputMethod: 'voice' | 'text'
): Promise<UserAnswer> {
  try {
    const { data, error } = await supabase
      .from('user_question_answers')
      .insert({
        user_id: userId,
        question_id: questionId,
        answer: answer.trim(),
        input_method: inputMethod,
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }

    console.log('✅ Answer submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to submit answer:', error);
    throw error;
  }
}

/**
 * Get user's answers for a specific context
 */
export async function getUserAnswers(
  userId: string,
  context?: string
): Promise<UserAnswer[]> {
  try {
    let query = supabase
      .from('user_question_answers')
      .select(`
        *,
        questions (
          text,
          context
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (context) {
      query = query.eq('questions.context', context);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user answers:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get user answers:', error);
    throw error;
  }
}

/**
 * Check if user has already answered a specific question
 */
export async function hasAnsweredQuestion(
  userId: string,
  questionId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_question_answers')
      .select('id')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .limit(1);

    if (error) {
      console.error('Error checking if question answered:', error);
      throw error;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Failed to check if question answered:', error);
    throw error;
  }
}

/**
 * Delete a user's answer
 */
export async function deleteAnswer(answerId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_question_answers')
      .delete()
      .eq('id', answerId);

    if (error) {
      console.error('Error deleting answer:', error);
      throw error;
    }

    console.log('✅ Answer deleted successfully');
  } catch (error) {
    console.error('Failed to delete answer:', error);
    throw error;
  }
}

export default {
  getQuestionsForContext,
  submitAnswer,
  getUserAnswers,
  hasAnsweredQuestion,
  deleteAnswer,
};

