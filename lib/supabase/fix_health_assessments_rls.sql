-- Fix RLS policies for health_assessments table
-- This table needs to allow anonymous inserts since clients fill out the form without logging in

-- First, ensure RLS is enabled
ALTER TABLE health_assessments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert health assessments" ON health_assessments;
DROP POLICY IF EXISTS "Coaches can view their own assessments" ON health_assessments;
DROP POLICY IF EXISTS "Coaches can update their own assessments" ON health_assessments;

-- Allow anyone (including anonymous users) to insert health assessments
-- This is necessary because clients fill out the form without being logged in
CREATE POLICY "Anyone can insert health assessments"
  ON health_assessments FOR INSERT
  WITH CHECK (true);

-- Coaches can only view assessments assigned to them
CREATE POLICY "Coaches can view their own assessments"
  ON health_assessments FOR SELECT
  USING (auth.uid() = coach_id);

-- Coaches can update their own assessments (e.g., mark as read)
CREATE POLICY "Coaches can update their own assessments"
  ON health_assessments FOR UPDATE
  USING (auth.uid() = coach_id);

-- Coaches can delete their own assessments
CREATE POLICY "Coaches can delete their own assessments"
  ON health_assessments FOR DELETE
  USING (auth.uid() = coach_id);

-- Grant insert permission to anon role
GRANT INSERT ON health_assessments TO anon;
GRANT SELECT ON health_assessments TO authenticated;
GRANT UPDATE ON health_assessments TO authenticated;
GRANT DELETE ON health_assessments TO authenticated;
