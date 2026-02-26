-- Update coach_rank CHECK constraint to include all OPTAVIA coach ranks

DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_coach_rank_check'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_coach_rank_check;
    END IF;
    
    -- Add new constraint with all OPTAVIA coach ranks
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_coach_rank_check CHECK (
        coach_rank IN (
            'Coach',      -- New Coach
            'SC',         -- Senior Coach
            'Manager',    -- Manager
            'AD',         -- Associate Director
            'Director',   -- Director
            'ED',         -- Executive Director
            'ND',         -- National Director
            'GD',         -- Global Director
            'PD',         -- Presidential Director
            'IED',        -- Integrated Executive Director
            'IND',        -- Integrated National Director
            'IGD',        -- Integrated Global Director
            'IPD'         -- Integrated Presidential Director
        )
    );
END $$;

-- Update comment for documentation
COMMENT ON COLUMN public.profiles.coach_rank IS 'OPTAVIA Coach Rank: Coach, SC, Manager, AD, Director, ED, ND, GD, PD, IED, IND, IGD, or IPD';

