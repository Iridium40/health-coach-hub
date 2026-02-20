-- Add first_login_only column to announcements table
-- When true, the announcement will only be shown to users logging in for the first time (is_new_coach = true)
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS first_login_only BOOLEAN DEFAULT false;

COMMENT ON COLUMN announcements.first_login_only IS 'When true, only show this announcement to first-time login users (is_new_coach = true)';
