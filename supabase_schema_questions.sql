-- Supabase Schema for User Questions and Answers
-- This file contains the SQL schema for the question module feature

-- ============================================
-- Table: questions
-- Stores questions for user profiling
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  context VARCHAR(50) NOT NULL, -- e.g., 'meeting-loading', 'profile-setup'
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries by context
CREATE INDEX IF NOT EXISTS idx_questions_context ON questions(context);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);

-- ============================================
-- Table: user_question_answers
-- Stores user answers to questions
-- ============================================
CREATE TABLE IF NOT EXISTS user_question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id VARCHAR(100) NOT NULL, -- Can be UUID or string identifier
  answer TEXT NOT NULL,
  input_method VARCHAR(10) CHECK (input_method IN ('voice', 'text')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_question_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_created_at ON user_question_answers(created_at DESC);

-- Add composite index for checking if user answered a question
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_answers_unique 
  ON user_question_answers(user_id, question_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on both tables
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_answers ENABLE ROW LEVEL SECURITY;

-- Questions: Public read access for active questions
CREATE POLICY "Anyone can view active questions"
  ON questions FOR SELECT
  USING (is_active = true);

-- Questions: Admin-only write access (adjust as needed)
CREATE POLICY "Only admins can manage questions"
  ON questions FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- User Answers: Users can only insert their own answers
CREATE POLICY "Users can insert their own answers"
  ON user_question_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Answers: Users can only view their own answers
CREATE POLICY "Users can view their own answers"
  ON user_question_answers FOR SELECT
  USING (auth.uid() = user_id);

-- User Answers: Users can update their own answers
CREATE POLICY "Users can update their own answers"
  ON user_question_answers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Answers: Users can delete their own answers
CREATE POLICY "Users can delete their own answers"
  ON user_question_answers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Trigger: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to questions table
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to user_question_answers table
CREATE TRIGGER update_user_answers_updated_at
  BEFORE UPDATE ON user_question_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data: Insert default questions
-- ============================================
INSERT INTO questions (text, context, "order") VALUES
  ('你希望通过这次会议达成什么目标？', 'meeting-loading', 1),
  ('你对哪些主题最感兴趣？', 'meeting-loading', 2),
  ('你希望在会议中分享什么？', 'meeting-loading', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE questions IS 'Stores questions for user profiling in various contexts';
COMMENT ON TABLE user_question_answers IS 'Stores user answers to profiling questions';
COMMENT ON COLUMN user_question_answers.input_method IS 'Method used to input the answer: voice or text';
COMMENT ON COLUMN questions.context IS 'Context where the question appears (e.g., meeting-loading)';

