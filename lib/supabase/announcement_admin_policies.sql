-- RLS Policies for announcements (admin access)
-- Allow admins to create, update, and delete announcements

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can update announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON announcements;

-- Policy for admins to insert announcements
CREATE POLICY "Admins can insert announcements"
ON announcements FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
);

-- Policy for admins to update announcements
CREATE POLICY "Admins can update announcements"
ON announcements FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
);

-- Policy for admins to delete announcements
CREATE POLICY "Admins can delete announcements"
ON announcements FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
);

