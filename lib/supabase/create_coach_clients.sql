-- Track clients under each downline coach (privacy-safe labels only)

CREATE TABLE IF NOT EXISTS coach_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES downline_coaches(id) ON DELETE CASCADE,

  -- Privacy-first label only
  label VARCHAR(50) NOT NULL,
  is_potential_coach BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_clients_user_id ON coach_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_clients_coach_id ON coach_clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_clients_user_coach ON coach_clients(user_id, coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_clients_user_potential ON coach_clients(user_id, is_potential_coach);

ALTER TABLE coach_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coach clients"
  ON coach_clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coach clients"
  ON coach_clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coach clients"
  ON coach_clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coach clients"
  ON coach_clients FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_coach_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coach_clients_updated_at ON coach_clients;
CREATE TRIGGER coach_clients_updated_at
  BEFORE UPDATE ON coach_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_coach_clients_updated_at();
