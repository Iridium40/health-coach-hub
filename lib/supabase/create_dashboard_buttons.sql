-- Dashboard Buttons table
-- Admin-managed buttons displayed on the dashboard page
CREATE TABLE IF NOT EXISTS dashboard_buttons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'green',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed 4 default buttons
INSERT INTO dashboard_buttons (sort_order, label, url, color) VALUES
  (0, 'Continue Training', '/training', 'blue'),
  (1, 'Add to 100''s List', '/prospect-tracker', 'green'),
  (2, 'Add Client', '/client-tracker', 'purple'),
  (3, 'View Calendar', '/calendar', 'orange');

-- RLS: all authenticated users can read, only admins can modify
ALTER TABLE dashboard_buttons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dashboard_buttons"
  ON dashboard_buttons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update dashboard_buttons"
  ON dashboard_buttons FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) = 'admin')
  );

CREATE POLICY "Admins can insert dashboard_buttons"
  ON dashboard_buttons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) = 'admin')
  );

CREATE POLICY "Admins can delete dashboard_buttons"
  ON dashboard_buttons FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) = 'admin')
  );
