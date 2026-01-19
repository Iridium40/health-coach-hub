-- Performance improvements for scaling (clients/prospects)
-- - Add safe indexes for common access patterns
-- - Add RPC functions for server-side stats aggregation (prevents loading all rows just to compute counts)

-- ============================================
-- INDEXES (safe: only create if table/columns exist)
-- ============================================
DO $$
BEGIN
  -- CLIENTS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='clients')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='clients' AND column_name='user_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clients_user_id_created_at ON public.clients (user_id, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clients_user_id_status ON public.clients (user_id, status)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='clients' AND column_name='next_scheduled_at')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='clients' AND column_name='user_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clients_user_id_next_scheduled_at ON public.clients (user_id, next_scheduled_at) WHERE next_scheduled_at IS NOT NULL';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='clients' AND column_name='last_touchpoint_date')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='clients' AND column_name='user_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_clients_user_id_last_touchpoint_date ON public.clients (user_id, last_touchpoint_date)';
  END IF;

  -- PROSPECTS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='prospects')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='prospects' AND column_name='user_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_prospects_user_id_created_at ON public.prospects (user_id, created_at DESC)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_prospects_user_id_status ON public.prospects (user_id, status)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='prospects' AND column_name='next_action')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='prospects' AND column_name='user_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_prospects_user_id_next_action ON public.prospects (user_id, next_action)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='prospects' AND column_name='ha_scheduled_at')
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='prospects' AND column_name='user_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_prospects_user_id_ha_scheduled_at ON public.prospects (user_id, ha_scheduled_at) WHERE ha_scheduled_at IS NOT NULL';
  END IF;
END $$;

-- ============================================
-- RPC FUNCTIONS: server-side stats
-- IMPORTANT: rely on auth.uid() so callers only get their own data.
-- ============================================

-- Clients stats
CREATE OR REPLACE FUNCTION public.get_client_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'active', (
      SELECT count(*) FROM public.clients
      WHERE user_id = auth.uid() AND status = 'active'
    ),
    'paused', (
      SELECT count(*) FROM public.clients
      WHERE user_id = auth.uid() AND status = 'paused'
    ),
    'completed', (
      SELECT count(*) FROM public.clients
      WHERE user_id = auth.uid() AND status = 'completed'
    ),
    'churned', (
      SELECT count(*) FROM public.clients
      WHERE user_id = auth.uid() AND status = 'churned'
    ),
    'coachProspects', (
      SELECT count(*) FROM public.clients
      WHERE user_id = auth.uid() AND status = 'active' AND is_coach_prospect = true
    ),
    -- "Needs attention" approximates the app logic but stays purely in SQL for scale.
    'needsAttention', (
      SELECT count(*) FROM public.clients
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND (
          (next_scheduled_at IS NOT NULL AND next_scheduled_at::date <= current_date)
          OR (last_touchpoint_date IS NULL)
          OR (last_touchpoint_date <= (current_date - 10))
        )
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_client_stats() TO authenticated;

-- Prospects stats
CREATE OR REPLACE FUNCTION public.get_prospect_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', (
      SELECT count(*) FROM public.prospects
      WHERE user_id = auth.uid()
        AND status NOT IN ('not_interested', 'not_closed')
    ),
    'new', (
      SELECT count(*) FROM public.prospects
      WHERE user_id = auth.uid() AND status = 'new'
    ),
    'interested', (
      SELECT count(*) FROM public.prospects
      WHERE user_id = auth.uid() AND status = 'interested'
    ),
    'haScheduled', (
      SELECT count(*) FROM public.prospects
      WHERE user_id = auth.uid() AND status = 'ha_scheduled'
    ),
    'converted', (
      SELECT count(*) FROM public.prospects
      WHERE user_id = auth.uid() AND status = 'converted'
    ),
    'coaches', (
      SELECT count(*) FROM public.prospects
      WHERE user_id = auth.uid() AND status = 'coach'
    ),
    'notInterested', (
      SELECT count(*) FROM public.prospects
      WHERE user_id = auth.uid() AND status = 'not_interested'
    ),
    'notClosed', (
      SELECT count(*) FROM public.prospects
      WHERE user_id = auth.uid() AND status = 'not_closed'
    ),
    'recycled', (
      SELECT count(*) FROM public.prospects
      WHERE user_id = auth.uid() AND status IN ('not_interested', 'not_closed')
    ),
    'overdue', (
      SELECT count(*) FROM public.prospects
      WHERE user_id = auth.uid()
        AND next_action IS NOT NULL
        AND status NOT IN ('converted', 'coach', 'not_interested', 'not_closed')
        AND next_action < current_date
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_prospect_stats() TO authenticated;

