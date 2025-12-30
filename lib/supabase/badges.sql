-- Create user_badges table to track achievement badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  category TEXT, -- The category this badge is for (e.g., "Getting Started", "Business Building")
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, badge_type, category)
);

-- Add comments for documentation
COMMENT ON TABLE public.user_badges IS 'Tracks achievement badges earned by users';
COMMENT ON COLUMN public.user_badges.badge_type IS 'Type of badge (e.g., "category_complete")';
COMMENT ON COLUMN public.user_badges.category IS 'The category this badge is for (e.g., "Getting Started", "Business Building", "Client Support", "Training")';
COMMENT ON COLUMN public.user_badges.earned_at IS 'Timestamp when the badge was earned';

-- RLS Policies for user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges."
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges."
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow system to insert badges (for automatic badge awarding)
CREATE POLICY "System can insert badges for any user"
  ON user_badges FOR INSERT
  WITH CHECK (true);

-- Allow admins to view all badges
CREATE POLICY "Admins can view all badges"
  ON user_badges FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'admin')
  );

