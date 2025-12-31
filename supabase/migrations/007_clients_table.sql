-- ============================================
-- SCHEMA: Clients Table
-- Captures client information when coaches send meal plans
-- ============================================

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_optavia_id TEXT, -- Coach's Optavia ID at time of client creation
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  last_plan_sent_at TIMESTAMPTZ,
  last_plan_type TEXT CHECK (last_plan_type IN ('5&1', '4&2')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Each coach can only have one client with the same email
  UNIQUE(coach_id, email)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy: Coaches can only see their own clients
CREATE POLICY "Coaches can view their own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

-- Policy: Coaches can insert their own clients
CREATE POLICY "Coaches can insert their own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = auth.uid());

-- Policy: Coaches can update their own clients
CREATE POLICY "Coaches can update their own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Policy: Coaches can delete their own clients
CREATE POLICY "Coaches can delete their own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (coach_id = auth.uid());

-- Policy: Admins can see all clients
CREATE POLICY "Admins can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

