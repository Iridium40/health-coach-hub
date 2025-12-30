-- Add push_scheduled_at column to announcements table

ALTER TABLE public.announcements
ADD COLUMN IF NOT EXISTS push_scheduled_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.announcements.push_scheduled_at IS 'Scheduled date/time for sending push notification. If null and send_push is true, send immediately.';

