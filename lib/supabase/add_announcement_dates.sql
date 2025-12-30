-- Add start_date and end_date columns to announcements table

ALTER TABLE public.announcements
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN public.announcements.start_date IS 'Start date for when the announcement becomes active';
COMMENT ON COLUMN public.announcements.end_date IS 'End date for when the announcement expires';

