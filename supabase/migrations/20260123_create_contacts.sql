-- Create contacts table to track email delivery status
-- This table is used by Resend webhooks to log email events

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  email_id TEXT, -- Resend email ID
  event_type TEXT NOT NULL, -- delivered, bounced, complained, opened, clicked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Event-specific data
  bounce_reason TEXT,
  complaint_type TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_email ON contacts(contact_email);
CREATE INDEX IF NOT EXISTS idx_contacts_email_id ON contacts(email_id);
CREATE INDEX IF NOT EXISTS idx_contacts_event_type ON contacts(event_type);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Admin-only access (webhooks use service role key which bypasses RLS)
CREATE POLICY "Admin users can view contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_contacts_updated_at();

-- Add comment
COMMENT ON TABLE contacts IS 'Tracks email delivery events from Resend webhooks';
