-- Add notification_phone column to profiles table for SMS calendar invites
-- Run this in your Supabase SQL Editor

-- ============================================
-- PROFILES TABLE: Add notification_phone column
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'notification_phone'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN notification_phone TEXT NULL;
    
    RAISE NOTICE 'Column notification_phone added to profiles table';
  ELSE
    RAISE NOTICE 'Column notification_phone already exists in profiles table';
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.notification_phone IS 'Phone number (10 digits, US only) for sending SMS calendar invites';
