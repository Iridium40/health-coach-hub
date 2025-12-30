-- Create invites table to track user invitations
CREATE TABLE IF NOT EXISTS invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invite_key TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invited_email TEXT,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invites_invite_key ON invites(invite_key);
CREATE INDEX IF NOT EXISTS idx_invites_invited_by ON invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_invites_invited_email ON invites(invited_email);
CREATE INDEX IF NOT EXISTS idx_invites_used_by ON invites(used_by);

-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invites
-- Allow authenticated users to view invites they created
CREATE POLICY "Users can view invites they created"
  ON invites FOR SELECT
  USING (auth.uid() = invited_by);

-- Allow authenticated users to view invites sent to their email (for signup)
CREATE POLICY "Users can view invites for their email"
  ON invites FOR SELECT
  USING (
    invited_email IS NOT NULL 
    AND invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow admins to view all invites
CREATE POLICY "Admins can view all invites"
  ON invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Allow authenticated users to create invites
CREATE POLICY "Authenticated users can create invites"
  ON invites FOR INSERT
  WITH CHECK (auth.uid() = invited_by);

-- Allow system to update invites (when used)
CREATE POLICY "System can update invites when used"
  ON invites FOR UPDATE
  USING (
    auth.uid() = used_by 
    OR auth.uid() = invited_by
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Allow users to delete their own invites
CREATE POLICY "Users can delete their own invites"
  ON invites FOR DELETE
  USING (auth.uid() = invited_by);

-- Allow admins to delete any invite
CREATE POLICY "Admins can delete any invite"
  ON invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_invites_updated_at
  BEFORE UPDATE ON invites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comment for documentation
COMMENT ON TABLE invites IS 'Tracks user invitations for signup';
COMMENT ON COLUMN invites.invite_key IS 'Unique key used in invite link';
COMMENT ON COLUMN invites.invited_by IS 'User who created the invite';
COMMENT ON COLUMN invites.invited_email IS 'Optional: specific email this invite is for';
COMMENT ON COLUMN invites.used_by IS 'User who used this invite (null if unused)';
COMMENT ON COLUMN invites.used_at IS 'Timestamp when invite was used';
COMMENT ON COLUMN invites.expires_at IS 'Optional expiration date for the invite';

