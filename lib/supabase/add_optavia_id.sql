-- Add optavia_id column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS optavia_id TEXT;

-- Create index for faster lookups by optavia_id
CREATE INDEX IF NOT EXISTS idx_profiles_optavia_id ON profiles(optavia_id);

-- Add optavia_id column to invites table (for storing invited coach's Optavia ID)
ALTER TABLE invites ADD COLUMN IF NOT EXISTS optavia_id TEXT;

