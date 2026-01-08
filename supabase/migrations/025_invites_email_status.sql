-- Add email delivery status tracking to invites table
-- This allows us to track bounces from Resend webhooks

-- Add email_status column to track delivery status
ALTER TABLE invites 
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'sent';

-- Add email_bounced_at timestamp for when bounce occurred
ALTER TABLE invites 
ADD COLUMN IF NOT EXISTS email_bounced_at TIMESTAMPTZ;

-- Add email_bounce_reason to store the bounce reason
ALTER TABLE invites 
ADD COLUMN IF NOT EXISTS email_bounce_reason TEXT;

-- Add resend_message_id to link with Resend's message tracking
ALTER TABLE invites 
ADD COLUMN IF NOT EXISTS resend_message_id TEXT;

-- Create index for faster lookups by email status
CREATE INDEX IF NOT EXISTS idx_invites_email_status ON invites(email_status);

-- Create index for resend message ID lookups (used by webhooks)
CREATE INDEX IF NOT EXISTS idx_invites_resend_message_id ON invites(resend_message_id);

-- Add comments for documentation
COMMENT ON COLUMN invites.email_status IS 'Email delivery status: sent, delivered, bounced, complained';
COMMENT ON COLUMN invites.email_bounced_at IS 'Timestamp when email bounced (if applicable)';
COMMENT ON COLUMN invites.email_bounce_reason IS 'Reason for bounce from email provider';
COMMENT ON COLUMN invites.resend_message_id IS 'Resend message ID for webhook correlation';
