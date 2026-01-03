-- Quiz Completions Table
-- Tracks when coaches complete training module quizzes

CREATE TABLE IF NOT EXISTS quiz_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  module_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  elapsed_seconds INTEGER,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  
  -- Ensure one completion record per user per module (latest attempt)
  UNIQUE(user_id, module_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quiz_completions_user_id ON quiz_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_completions_module_id ON quiz_completions(module_id);
CREATE INDEX IF NOT EXISTS idx_quiz_completions_completed_at ON quiz_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_completions_passed ON quiz_completions(passed);

-- Enable RLS
ALTER TABLE quiz_completions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own completions
CREATE POLICY "Users can view own quiz completions"
  ON quiz_completions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own completions
CREATE POLICY "Users can insert own quiz completions"
  ON quiz_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own completions (for retakes)
CREATE POLICY "Users can update own quiz completions"
  ON quiz_completions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Sponsor Reporting View
-- Allows sponsors to see their team members' quiz progress
CREATE OR REPLACE VIEW sponsor_team_quiz_progress AS
SELECT 
  p.sponsor_id,
  qc.user_id AS coach_id,
  up.full_name AS coach_name,
  up.email AS coach_email,
  qc.module_id,
  qc.module_title,
  qc.score,
  qc.total_questions,
  qc.percentage,
  qc.passed,
  qc.completed_at
FROM quiz_completions qc
JOIN profiles p ON qc.user_id = p.id
JOIN profiles up ON qc.user_id = up.id
WHERE p.sponsor_id IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON sponsor_team_quiz_progress TO authenticated;

-- Function to get team quiz stats for a sponsor
CREATE OR REPLACE FUNCTION get_team_quiz_stats(sponsor_user_id UUID)
RETURNS TABLE (
  coach_id UUID,
  coach_name TEXT,
  coach_email TEXT,
  total_quizzes_completed INTEGER,
  total_quizzes_passed INTEGER,
  average_score NUMERIC,
  last_completion TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS coach_id,
    p.full_name AS coach_name,
    p.email AS coach_email,
    COUNT(qc.id)::INTEGER AS total_quizzes_completed,
    COUNT(CASE WHEN qc.passed THEN 1 END)::INTEGER AS total_quizzes_passed,
    ROUND(AVG(qc.percentage), 1) AS average_score,
    MAX(qc.completed_at) AS last_completion
  FROM profiles p
  LEFT JOIN quiz_completions qc ON p.id = qc.user_id
  WHERE p.sponsor_id = sponsor_user_id
  GROUP BY p.id, p.full_name, p.email
  ORDER BY last_completion DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
