-- Migration: Add event-related fields to zoom_calls table
-- Supports multi-day events (like incentive trips) and in-person locations

-- Add event_type to distinguish between meetings and events
ALTER TABLE zoom_calls ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'meeting' 
  CHECK (event_type IN ('meeting', 'event'));

-- Add end_date for multi-day events (like incentive trips)
ALTER TABLE zoom_calls ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add location for in-person events/meetings
ALTER TABLE zoom_calls ADD COLUMN IF NOT EXISTS location TEXT;

-- Add is_virtual flag (true for Zoom meetings, false for in-person)
ALTER TABLE zoom_calls ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT true;

-- Create index for event_type queries
CREATE INDEX IF NOT EXISTS idx_zoom_calls_event_type ON zoom_calls(event_type);
