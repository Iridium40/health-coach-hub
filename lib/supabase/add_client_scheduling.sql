-- Add scheduling, phone, recurring columns to clients/prospects, and notification_email to profiles
-- Run this in your Supabase SQL Editor

-- ============================================
-- PROFILES TABLE: Add notification_email column
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'notification_email'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN notification_email TEXT NULL;
    
    RAISE NOTICE 'Column notification_email added to profiles table';
  ELSE
    RAISE NOTICE 'Column notification_email already exists in profiles table';
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.notification_email IS 'Email address for receiving scheduling notifications and calendar invites';

-- ============================================
-- CLIENTS TABLE: Add scheduling and recurring columns
-- ============================================
DO $$ 
BEGIN
  -- Add next_scheduled_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'next_scheduled_at'
  ) THEN
    ALTER TABLE public.clients 
    ADD COLUMN next_scheduled_at TIMESTAMP WITH TIME ZONE NULL;
    
    CREATE INDEX IF NOT EXISTS idx_clients_next_scheduled_at 
    ON public.clients (next_scheduled_at) 
    WHERE next_scheduled_at IS NOT NULL;
    
    RAISE NOTICE 'Column next_scheduled_at added to clients table';
  ELSE
    RAISE NOTICE 'Column next_scheduled_at already exists in clients table';
  END IF;
  
  -- Add phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.clients 
    ADD COLUMN phone TEXT NULL;
    
    RAISE NOTICE 'Column phone added to clients table';
  ELSE
    RAISE NOTICE 'Column phone already exists in clients table';
  END IF;
  
  -- Add recurring_frequency column (none, weekly, biweekly, monthly)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'recurring_frequency'
  ) THEN
    ALTER TABLE public.clients 
    ADD COLUMN recurring_frequency TEXT NULL CHECK (recurring_frequency IN ('none', 'weekly', 'biweekly', 'monthly'));
    
    RAISE NOTICE 'Column recurring_frequency added to clients table';
  ELSE
    RAISE NOTICE 'Column recurring_frequency already exists in clients table';
  END IF;
  
  -- Add recurring_day column (0-6 for day of week)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'recurring_day'
  ) THEN
    ALTER TABLE public.clients 
    ADD COLUMN recurring_day INTEGER NULL CHECK (recurring_day >= 0 AND recurring_day <= 6);
    
    RAISE NOTICE 'Column recurring_day added to clients table';
  ELSE
    RAISE NOTICE 'Column recurring_day already exists in clients table';
  END IF;
  
  -- Add recurring_time column (HH:MM format in 24-hour)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'clients' 
    AND column_name = 'recurring_time'
  ) THEN
    ALTER TABLE public.clients 
    ADD COLUMN recurring_time TEXT NULL;
    
    RAISE NOTICE 'Column recurring_time added to clients table';
  ELSE
    RAISE NOTICE 'Column recurring_time already exists in clients table';
  END IF;
END $$;

COMMENT ON COLUMN public.clients.next_scheduled_at IS 'Next scheduled check-in date/time for the client';
COMMENT ON COLUMN public.clients.phone IS 'Client phone number for SMS reminders';
COMMENT ON COLUMN public.clients.recurring_frequency IS 'Recurring frequency: none, weekly, biweekly, or monthly';
COMMENT ON COLUMN public.clients.recurring_day IS 'Day of week for recurring meetings (0=Sunday, 6=Saturday)';
COMMENT ON COLUMN public.clients.recurring_time IS 'Time for recurring meetings in HH:MM 24-hour format';

-- ============================================
-- PROSPECTS TABLE: Add ha_scheduled_at and phone columns
-- ============================================
DO $$ 
BEGIN
  -- Add ha_scheduled_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'prospects' 
    AND column_name = 'ha_scheduled_at'
  ) THEN
    ALTER TABLE public.prospects 
    ADD COLUMN ha_scheduled_at TIMESTAMP WITH TIME ZONE NULL;
    
    CREATE INDEX IF NOT EXISTS idx_prospects_ha_scheduled_at 
    ON public.prospects (ha_scheduled_at) 
    WHERE ha_scheduled_at IS NOT NULL;
    
    RAISE NOTICE 'Column ha_scheduled_at added to prospects table';
  ELSE
    RAISE NOTICE 'Column ha_scheduled_at already exists in prospects table';
  END IF;
  
  -- Add phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'prospects' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.prospects 
    ADD COLUMN phone TEXT NULL;
    
    RAISE NOTICE 'Column phone added to prospects table';
  ELSE
    RAISE NOTICE 'Column phone already exists in prospects table';
  END IF;
END $$;

COMMENT ON COLUMN public.prospects.ha_scheduled_at IS 'Scheduled date/time for Health Assessment call';
COMMENT ON COLUMN public.prospects.phone IS 'Prospect phone number for SMS reminders';
