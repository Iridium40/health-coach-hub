-- ============================================
-- SCHEMA: Zoom Calls Management
-- Weekly coaching calls - some coach-only, some with clients
-- ============================================

-- Create zoom_calls table
CREATE TABLE IF NOT EXISTS zoom_calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Call type: coach_only or includes_clients
  call_type TEXT NOT NULL CHECK (call_type IN ('coach_only', 'with_clients')),
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  timezone TEXT DEFAULT 'America/New_York',
  
  -- Recurrence (optional - for display purposes)
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- e.g., "weekly", "biweekly", "monthly"
  recurrence_day TEXT, -- e.g., "Monday", "Wednesday"
  
  -- Zoom details
  zoom_link TEXT,
  zoom_meeting_id TEXT,
  zoom_passcode TEXT,
  
  -- Recording (available after call ends)
  recording_url TEXT,
  recording_platform TEXT CHECK (recording_platform IN ('zoom', 'vimeo', 'youtube', NULL)),
  recording_available_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_zoom_calls_scheduled_at ON zoom_calls(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_zoom_calls_status ON zoom_calls(status);
CREATE INDEX IF NOT EXISTS idx_zoom_calls_call_type ON zoom_calls(call_type);
CREATE INDEX IF NOT EXISTS idx_zoom_calls_upcoming ON zoom_calls(scheduled_at) 
  WHERE status = 'upcoming';

-- Enable RLS
ALTER TABLE zoom_calls ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users (coaches) can view all calls
CREATE POLICY "Coaches can view all zoom calls"
  ON zoom_calls FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can insert
CREATE POLICY "Admins can create zoom calls"
  ON zoom_calls FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND LOWER(profiles.user_role) = 'admin'
    )
  );

-- Policy: Only admins can update
CREATE POLICY "Admins can update zoom calls"
  ON zoom_calls FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND LOWER(profiles.user_role) = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND LOWER(profiles.user_role) = 'admin'
    )
  );

-- Policy: Only admins can delete
CREATE POLICY "Admins can delete zoom calls"
  ON zoom_calls FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND LOWER(profiles.user_role) = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_zoom_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS zoom_calls_updated_at ON zoom_calls;
CREATE TRIGGER zoom_calls_updated_at
  BEFORE UPDATE ON zoom_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_zoom_calls_updated_at();

-- ============================================
-- Optional: Call reminders tracking
-- Track which users have been reminded about upcoming calls
-- ============================================

CREATE TABLE IF NOT EXISTS zoom_call_reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  zoom_call_id UUID REFERENCES zoom_calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '1h', '15min')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zoom_call_id, user_id, reminder_type)
);

-- Enable RLS
ALTER TABLE zoom_call_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own reminders
CREATE POLICY "Users can view their own reminders"
  ON zoom_call_reminders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: System can insert reminders (via service role)
CREATE POLICY "System can insert reminders"
  ON zoom_call_reminders FOR INSERT
  TO authenticated
  WITH CHECK (true);
