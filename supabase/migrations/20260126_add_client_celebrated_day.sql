-- Add last_celebrated_day column to track which milestone day was last celebrated
-- This prevents the "Celebrate!" button from flashing after the coach has already celebrated

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS last_celebrated_day INTEGER NULL;

-- Add comment for documentation
COMMENT ON COLUMN clients.last_celebrated_day IS 'The program day number when the last milestone was celebrated (e.g., 7, 14, 21, 30). Used to stop the celebrate button from flashing.';
