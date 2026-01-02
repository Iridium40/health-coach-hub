-- Create coach_relationships table to track sponsor-coach relationships
CREATE TABLE IF NOT EXISTS coach_relationships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sponsor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sponsor_id, coach_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_coach_relationships_sponsor_id ON coach_relationships(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_coach_relationships_coach_id ON coach_relationships(coach_id);

-- Enable Row Level Security
ALTER TABLE coach_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_relationships
-- Sponsors can view their downline coaches
CREATE POLICY "Sponsors can view their downline coaches"
  ON coach_relationships FOR SELECT
  USING (auth.uid() = sponsor_id);

-- Coaches can view who their sponsor is
CREATE POLICY "Coaches can view their sponsor"
  ON coach_relationships FOR SELECT
  USING (auth.uid() = coach_id);

-- Admins can view all relationships
CREATE POLICY "Admins can view all coach relationships"
  ON coach_relationships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Allow authenticated users to create relationships (when sponsoring)
CREATE POLICY "Authenticated users can create coach relationships"
  ON coach_relationships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sponsor_id);

-- Update RLS policy for user_progress to allow sponsors to view their downline's progress
CREATE POLICY "Sponsors can view their downline's progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coach_relationships
      WHERE coach_relationships.sponsor_id = auth.uid()
      AND coach_relationships.coach_id = user_progress.user_id
    )
  );

-- Admins can view all progress
CREATE POLICY "Admins can view all progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );
