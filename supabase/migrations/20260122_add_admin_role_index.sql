-- Add index for admin role lookups (used in many RLS policies)
-- This partial index only includes admin users, keeping it small and fast

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_profiles_admin_role'
    ) THEN
        CREATE INDEX idx_profiles_admin_role 
        ON public.profiles(user_role) 
        WHERE user_role = 'admin';
        
        RAISE NOTICE 'Created index idx_profiles_admin_role';
    ELSE
        RAISE NOTICE 'Index idx_profiles_admin_role already exists';
    END IF;
END $$;
