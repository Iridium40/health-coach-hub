-- Add parent_optavia_id column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS parent_optavia_id TEXT;

-- Create index for better query performance when looking up downline coaches
CREATE INDEX IF NOT EXISTS idx_profiles_parent_optavia_id ON profiles(parent_optavia_id);
CREATE INDEX IF NOT EXISTS idx_profiles_optavia_id ON profiles(optavia_id);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.parent_optavia_id IS 'Optavia ID of the coach who sponsored this coach';

-- Update RLS policy for user_progress to allow sponsors to view their downline's progress
-- This policy allows a coach to view progress of any coach whose parent_optavia_id matches their optavia_id
DROP POLICY IF EXISTS "Sponsors can view their downline's progress" ON user_progress;
CREATE POLICY "Sponsors can view their downline's progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles sponsor_profile
      WHERE sponsor_profile.id = auth.uid()
      AND sponsor_profile.optavia_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM profiles coach_profile
        WHERE coach_profile.id = user_progress.user_id
        AND coach_profile.parent_optavia_id = sponsor_profile.optavia_id
      )
    )
  );

-- Update RLS policy for profiles to allow sponsors to view their downline coaches' profiles
CREATE POLICY "Sponsors can view their downline coaches' profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    -- Users can always view their own profile
    auth.uid() = id
    OR
    -- Sponsors can view profiles of coaches they sponsor
    EXISTS (
      SELECT 1 FROM profiles sponsor_profile
      WHERE sponsor_profile.id = auth.uid()
      AND sponsor_profile.optavia_id IS NOT NULL
      AND profiles.parent_optavia_id = sponsor_profile.optavia_id
    )
  );
