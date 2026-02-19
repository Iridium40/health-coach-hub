-- Add user_role and coach_rank columns to profiles table

-- Add columns first (if they don't exist)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_role TEXT,
ADD COLUMN IF NOT EXISTS coach_rank TEXT;

-- Add constraints (drop existing constraint if it exists, then add new one)
DO $$ 
BEGIN
    -- Drop existing constraints if they exist
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_user_role_check'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_role_check;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_coach_rank_check'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_coach_rank_check;
    END IF;
    
    -- Add new constraints
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_role_check CHECK (user_role IN ('system_admin', 'admin', 'coach'));
    
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_coach_rank_check CHECK (coach_rank IN ('SC', 'ED', 'IN', 'IR', 'GB', 'IPD'));
END $$;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.user_role IS 'User role: system_admin, admin, or coach';
COMMENT ON COLUMN public.profiles.coach_rank IS 'Coach rank: SC, ED, IN, IR, GB, or IPD';

