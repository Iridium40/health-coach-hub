-- Rank Calculator Tables
-- Track coach rank progress and history

-- Coach rank data extension
CREATE TABLE IF NOT EXISTS coach_rank_data (
  coach_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_rank TEXT NOT NULL DEFAULT 'Coach' 
    CHECK (current_rank IN ('Coach', 'Senior Coach', 'Executive Director', 'FIBC', 'Global Director', 'Presidential Director', 'IPD')),
  rank_achieved_date DATE,
  
  -- Volume tracking (coach enters manually)
  current_fqv INTEGER DEFAULT 0,
  current_pqv INTEGER DEFAULT 0,
  qualifying_points INTEGER DEFAULT 0,
  
  -- Team tracking
  frontline_coaches INTEGER DEFAULT 0,
  total_team_size INTEGER DEFAULT 0,
  
  -- Goals
  target_rank TEXT CHECK (target_rank IS NULL OR target_rank IN ('Coach', 'Senior Coach', 'Executive Director', 'FIBC', 'Global Director', 'Presidential Director', 'IPD')),
  target_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical rank achievements
CREATE TABLE IF NOT EXISTS rank_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank_achieved TEXT NOT NULL CHECK (rank_achieved IN ('Coach', 'Senior Coach', 'Executive Director', 'FIBC', 'Global Director', 'Presidential Director', 'IPD')),
  achieved_date DATE NOT NULL,
  fqv_at_achievement INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rank_history_coach ON rank_history(coach_id);
CREATE INDEX IF NOT EXISTS idx_rank_history_date ON rank_history(achieved_date DESC);

-- Add updated_at trigger
CREATE TRIGGER update_coach_rank_data_updated_at
  BEFORE UPDATE ON coach_rank_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE coach_rank_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_rank_data
CREATE POLICY "Users can view own rank data"
  ON coach_rank_data
  FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Users can insert own rank data"
  ON coach_rank_data
  FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update own rank data"
  ON coach_rank_data
  FOR UPDATE
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

-- RLS Policies for rank_history
CREATE POLICY "Users can view own rank history"
  ON rank_history
  FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Users can insert own rank history"
  ON rank_history
  FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON coach_rank_data TO authenticated;
GRANT SELECT, INSERT ON rank_history TO authenticated;

-- Function to get or create rank data for a user
CREATE OR REPLACE FUNCTION get_or_create_rank_data(p_user_id UUID)
RETURNS coach_rank_data AS $$
DECLARE
  v_result coach_rank_data;
BEGIN
  -- Try to get existing data
  SELECT * INTO v_result FROM coach_rank_data WHERE coach_id = p_user_id;
  
  -- If not found, create default record
  IF NOT FOUND THEN
    INSERT INTO coach_rank_data (coach_id, current_rank)
    VALUES (p_user_id, 'Coach')
    RETURNING * INTO v_result;
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_or_create_rank_data TO authenticated;
