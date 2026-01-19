-- Performance + safety improvements for scaling (misc tables)
-- - Add missing composite/partial indexes matching real query patterns
-- - Fix an overly-permissive badge insert policy

DO $$
BEGIN
  -- ============================================
  -- PROFILES (Downline page filters by sponsor_id)
  -- ============================================
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='sponsor_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_sponsor_id ON public.profiles (sponsor_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='optavia_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_optavia_id ON public.profiles (optavia_id)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='parent_optavia_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_parent_optavia_id ON public.profiles (parent_optavia_id)';
  END IF;

  -- ============================================
  -- ANNOUNCEMENTS (homepage pulls latest active)
  -- Query: eq(is_active,true) order(created_at desc) limit(5)
  -- ============================================
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='announcements') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_announcements_active_created_at ON public.announcements (created_at DESC) WHERE is_active = true';
  END IF;

  -- ============================================
  -- ANNOUNCEMENT_READS (load read list by user)
  -- Query: eq(user_id)
  -- ============================================
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='announcement_reads') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_announcement_reads_user_id ON public.announcement_reads (user_id)';
  END IF;

  -- ============================================
  -- REMINDERS (query: eq(user_id) order(due_date asc))
  -- ============================================
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='reminders') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reminders_user_due_date ON public.reminders (user_id, due_date)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reminders_user_due_date_open ON public.reminders (user_id, due_date) WHERE is_completed = false';
  END IF;

  -- ============================================
  -- ZOOM_CALLS (query: in(status) order(scheduled_at asc))
  -- ============================================
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='zoom_calls') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_zoom_calls_status_scheduled_at ON public.zoom_calls (status, scheduled_at)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_zoom_calls_recurring ON public.zoom_calls (is_recurring) WHERE is_recurring = true';
  END IF;

  -- ============================================
  -- TRAINING (active resources/categories are read constantly)
  -- ============================================
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='training_resources') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_training_resources_active_sort ON public.training_resources (sort_order) WHERE is_active = true';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='training_categories') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_training_categories_active_sort ON public.training_categories (sort_order) WHERE is_active = true';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='training_resource_completions') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_training_resource_completions_user_id ON public.training_resource_completions (user_id)';
  END IF;

  -- ============================================
  -- USER_BADGES (query: eq(user_id) order(earned_at desc))
  -- ============================================
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_badges') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_badges_user_earned_at ON public.user_badges (user_id, earned_at DESC)';
  END IF;
END $$;

-- ============================================
-- POLICY FIX: remove overly-permissive badge insert policy
-- The service role bypasses RLS and does not need an allow-all policy.
-- Keeping it would allow any authenticated user to insert badges for any user.
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_badges'
      AND policyname = 'System can insert badges for any user'
  ) THEN
    EXECUTE 'DROP POLICY "System can insert badges for any user" ON public.user_badges';
  END IF;
END $$;

