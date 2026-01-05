-- Migration: Simplify prospect stages
-- From: cold, warm, ha_scheduled, ha_done, converted, coach, not_interested
-- To: new, interested, ha_scheduled, converted, coach, not_interested, not_closed

-- Step 1: Drop existing status check constraint (if exists)
ALTER TABLE public.prospects DROP CONSTRAINT IF EXISTS prospects_status_check;

-- Step 2: Migrate existing data to new status values
UPDATE public.prospects SET status = 'new' WHERE status = 'cold';
UPDATE public.prospects SET status = 'interested' WHERE status = 'warm';
UPDATE public.prospects SET status = 'not_closed' WHERE status = 'ha_done';

-- Step 3: Add new status check constraint with updated values
ALTER TABLE public.prospects 
ADD CONSTRAINT prospects_status_check 
CHECK (status = ANY (ARRAY[
  'new'::text, 
  'interested'::text, 
  'ha_scheduled'::text, 
  'converted'::text, 
  'coach'::text, 
  'not_interested'::text, 
  'not_closed'::text
]));

-- Verify: Check the current statuses
-- SELECT DISTINCT status, COUNT(*) FROM public.prospects GROUP BY status;
