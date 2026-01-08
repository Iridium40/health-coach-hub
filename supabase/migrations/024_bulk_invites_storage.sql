-- Create storage bucket for bulk invite CSV files
-- Run this in Supabase SQL Editor or via migrations

-- Note: Bucket creation is typically done via Supabase Dashboard or API
-- This migration sets up the storage policies for the 'bulk-invites' bucket

-- Instructions for creating the bucket:
-- 1. Go to Supabase Dashboard -> Storage
-- 2. Click "New bucket"
-- 3. Name it: bulk-invites
-- 4. Make it Private (only authenticated admins should access)
-- 5. Click "Create bucket"

-- Policy 1: Allow admins to upload CSV files
CREATE POLICY "Admins can upload bulk invite files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bulk-invites'::text
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
);

-- Policy 2: Allow admins to read files
CREATE POLICY "Admins can read bulk invite files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'bulk-invites'::text
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
);

-- Policy 3: Allow admins to delete files
CREATE POLICY "Admins can delete bulk invite files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'bulk-invites'::text
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
);

-- Policy 4: Allow admins to update files
CREATE POLICY "Admins can update bulk invite files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'bulk-invites'::text
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'bulk-invites'::text
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
);
