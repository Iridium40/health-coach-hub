-- Add org_id column to profiles table for organization-based access control
-- org_id = 1: Full access to all features
-- org_id = 2: Training only (limited access)

-- Add org_id column with default value of 1 (full access)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS org_id INTEGER DEFAULT 1;

-- Add a comment explaining the column
COMMENT ON COLUMN profiles.org_id IS 'Organization ID for access control: 1=Full access, 2=Training only';

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(org_id);
