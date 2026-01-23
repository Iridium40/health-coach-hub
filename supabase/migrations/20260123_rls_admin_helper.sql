-- Create helper function for admin checks in RLS policies
-- This reduces the overhead of repeated subqueries in RLS policies

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
$$;

-- Add comment for documentation
COMMENT ON FUNCTION is_admin() IS 'Helper function to check if the current user is an admin. Used in RLS policies to reduce query overhead.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
