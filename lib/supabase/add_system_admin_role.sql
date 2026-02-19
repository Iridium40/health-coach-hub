-- Add system_admin to the user_role check constraint
-- system_admin has all admin privileges plus access to system-level features (e.g. Access Codes)

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'profiles_user_role_check'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_role_check;
    END IF;

    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_role_check CHECK (user_role IN ('system_admin', 'admin', 'coach'));
END $$;

COMMENT ON COLUMN public.profiles.user_role IS 'User role: system_admin, admin, or coach';

-- Add signup_access_code column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS signup_access_code TEXT;

COMMENT ON COLUMN public.profiles.signup_access_code IS 'The access code the user entered during self-service sign-up';

-- Update handle_new_user to also store signup_access_code from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, coach_name, signup_access_code)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'coach_name',
    NEW.raw_user_meta_data->>'signup_access_code'
  );

  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for signup_access_codes to also allow system_admin

DROP POLICY IF EXISTS "Admins can insert access codes" ON signup_access_codes;
CREATE POLICY "Admins can insert access codes"
  ON signup_access_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) IN ('system_admin', 'admin'))
  );

DROP POLICY IF EXISTS "Admins can update access codes" ON signup_access_codes;
CREATE POLICY "Admins can update access codes"
  ON signup_access_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) IN ('system_admin', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) IN ('system_admin', 'admin'))
  );

DROP POLICY IF EXISTS "Admins can delete access codes" ON signup_access_codes;
CREATE POLICY "Admins can delete access codes"
  ON signup_access_codes FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND LOWER(user_role) IN ('system_admin', 'admin'))
  );
