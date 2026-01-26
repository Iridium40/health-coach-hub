-- Add optional start_time and end_time columns for events
-- These allow events to have specific times while still being optional (for all-day events)

ALTER TABLE zoom_calls 
ADD COLUMN IF NOT EXISTS start_time VARCHAR(5) NULL,
ADD COLUMN IF NOT EXISTS end_time VARCHAR(5) NULL;

-- Add comment for documentation
COMMENT ON COLUMN zoom_calls.start_time IS 'Optional start time for events in HH:MM format (e.g., 09:00). Null for all-day events.';
COMMENT ON COLUMN zoom_calls.end_time IS 'Optional end time for events in HH:MM format (e.g., 17:00). Null for all-day events.';
