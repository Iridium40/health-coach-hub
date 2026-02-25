-- Persist social media generator preferences per coach profile
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS posting_preferences JSONB;

COMMENT ON COLUMN public.profiles.posting_preferences IS
'Saved coach posting preferences used by the Social Media Post Generator.';

