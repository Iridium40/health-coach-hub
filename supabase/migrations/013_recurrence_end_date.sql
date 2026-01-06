-- Add recurrence_end_date column to zoom_calls table
-- This column stores the end date for recurring meetings

ALTER TABLE zoom_calls 
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;

-- Add a comment explaining the column
COMMENT ON COLUMN zoom_calls.recurrence_end_date IS 'The end date for recurring meetings. After this date, no more occurrences will be generated.';
