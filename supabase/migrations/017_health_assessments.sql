-- Create health_assessments table to track health assessment calls
CREATE TABLE IF NOT EXISTS health_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT,
  client_phone TEXT,
  client_why TEXT,
  client_commitment TEXT,
  call_outcome TEXT NOT NULL, -- 'enrolled', 'followup', 'thinking', 'not-ready', 'not-fit'
  enrolled BOOLEAN GENERATED ALWAYS AS (call_outcome = 'enrolled') STORED, -- Automatically true when outcome is 'enrolled'
  timer_seconds INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0, -- Percentage complete (0-100)
  call_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_health_assessments_user_id ON health_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_health_assessments_enrolled ON health_assessments(enrolled);
CREATE INDEX IF NOT EXISTS idx_health_assessments_created_at ON health_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_assessments_user_enrolled ON health_assessments(user_id, enrolled);

-- Enable RLS
ALTER TABLE health_assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own health assessments
CREATE POLICY "Users can view their own health assessments"
  ON health_assessments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own health assessments
CREATE POLICY "Users can insert their own health assessments"
  ON health_assessments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all health assessments
CREATE POLICY "Admins can view all health assessments"
  ON health_assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND LOWER(profiles.user_role) = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE health_assessments IS 'Tracks health assessment calls conducted by coaches';
COMMENT ON COLUMN health_assessments.enrolled IS 'Automatically true when call_outcome is "enrolled"';
COMMENT ON COLUMN health_assessments.progress IS 'Percentage of checklist completed (0-100)';
