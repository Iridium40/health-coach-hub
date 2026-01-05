-- Enable RLS on training_categories if not already enabled
ALTER TABLE public.training_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view active training categories" ON public.training_categories;
DROP POLICY IF EXISTS "Admins can manage training categories" ON public.training_categories;

-- Policy: Everyone can read active categories
CREATE POLICY "Anyone can view active training categories"
ON public.training_categories
FOR SELECT
USING (is_active = true);

-- Policy: Admins can SELECT all categories (including inactive)
CREATE POLICY "Admins can view all training categories"
ON public.training_categories
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
);

-- Policy: Admins can INSERT categories
CREATE POLICY "Admins can insert training categories"
ON public.training_categories
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
);

-- Policy: Admins can UPDATE categories
CREATE POLICY "Admins can update training categories"
ON public.training_categories
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
);

-- Policy: Admins can DELETE categories
CREATE POLICY "Admins can delete training categories"
ON public.training_categories
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_role = 'admin'
  )
);
