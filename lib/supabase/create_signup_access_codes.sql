-- Signup Access Codes table
-- Admin-managed codes that gate self-registration
CREATE TABLE IF NOT EXISTS signup_access_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signup_access_codes_code ON signup_access_codes(code);

-- Enable RLS
ALTER TABLE signup_access_codes ENABLE ROW LEVEL SECURITY;

-- Anonymous users need SELECT to validate codes during signup (before auth)
GRANT SELECT ON signup_access_codes TO anon;

CREATE POLICY "Anyone can validate active access codes"
  ON signup_access_codes FOR SELECT
  TO anon
  USING (is_active = true);

-- Authenticated users can read all codes
CREATE POLICY "Authenticated users can read access codes"
  ON signup_access_codes FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage codes
CREATE POLICY "Admins can insert access codes"
  ON signup_access_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) = 'admin')
  );

CREATE POLICY "Admins can update access codes"
  ON signup_access_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) = 'admin')
  );

CREATE POLICY "Admins can delete access codes"
  ON signup_access_codes FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) = 'admin')
  );

-- Allow anonymous users to increment usage_count on signup
-- This uses a separate policy so anon can update only usage_count
GRANT UPDATE (usage_count) ON signup_access_codes TO anon;

CREATE POLICY "Anyone can increment usage count"
  ON signup_access_codes FOR UPDATE
  TO anon
  USING (is_active = true)
  WITH CHECK (is_active = true);

-- Updated_at trigger
CREATE TRIGGER update_signup_access_codes_updated_at
  BEFORE UPDATE ON signup_access_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE signup_access_codes IS 'Admin-managed codes that gate self-registration';
COMMENT ON COLUMN signup_access_codes.code IS 'The code text admins distribute (e.g. COACH2026)';
COMMENT ON COLUMN signup_access_codes.label IS 'Friendly name for the code';
COMMENT ON COLUMN signup_access_codes.usage_count IS 'How many times this code has been used';
