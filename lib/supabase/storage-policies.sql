-- Storage Bucket Policies for user_avatars
-- These policies allow authenticated users to upload, read, and delete avatars
-- Note: If you want to disable RLS on storage, you can skip these policies
-- and instead disable RLS on the storage.objects table

-- First, make sure RLS is enabled on storage.objects (it should be by default)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to upload avatars
-- This allows any authenticated user to upload to the bucket
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user_avatars'::text
);

-- Policy 2: Allow public read access to avatars
CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'user_avatars'::text
);

-- Policy 3: Allow authenticated users to delete avatars
-- This allows any authenticated user to delete from the bucket
-- For more security, you could restrict to only files they own
CREATE POLICY "Authenticated users can delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user_avatars'::text
);

-- Policy 4: Allow authenticated users to update avatars
CREATE POLICY "Authenticated users can update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user_avatars'::text
)
WITH CHECK (
  bucket_id = 'user_avatars'::text
);

