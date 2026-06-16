-- Migration: Add instance-based recurring events support
-- This allows editing individual occurrences of recurring events

-- Add parent_id to link instances to their template
ALTER TABLE zoom_calls 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES zoom_calls(id) ON DELETE CASCADE;

-- Add is_template to identify the master recurring event template
ALTER TABLE zoom_calls 
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;

-- Add occurrence_index to track which occurrence this is in the series (1-based)
ALTER TABLE zoom_calls 
ADD COLUMN IF NOT EXISTS occurrence_index INTEGER;

-- Create index for efficient querying of instances by parent
CREATE INDEX IF NOT EXISTS idx_zoom_calls_parent_id ON zoom_calls(parent_id);

-- Create index for filtering templates vs instances
CREATE INDEX IF NOT EXISTS idx_zoom_calls_is_template ON zoom_calls(is_template);

-- Update RLS policies to allow reading instances based on parent access
-- (Existing policies should work since instances inherit the same call_type)

COMMENT ON COLUMN zoom_calls.parent_id IS 'References the template event for recurring instances';
COMMENT ON COLUMN zoom_calls.is_template IS 'True for recurring event templates, false for instances and non-recurring events';
COMMENT ON COLUMN zoom_calls.occurrence_index IS 'The occurrence number in a recurring series (1-based)';
