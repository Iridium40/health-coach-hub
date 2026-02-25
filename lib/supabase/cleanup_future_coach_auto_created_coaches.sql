-- Cleanup script: remove mistakenly auto-created coach entries
-- Context:
-- A bug previously created rows in `downline_coaches` when a client status
-- was set to `future_coach`. Only `coach_launched` should create coach rows.
--
-- Safety rules:
-- - Match by same user + same normalized label
-- - Only remove when the client is currently `future_coach`
-- - Keep rows if a matching `coach_launched` client exists
--
-- Run in Supabase SQL editor.
-- Recommended flow:
-- 1) Run the PREVIEW query and verify rows
-- 2) Run the DELETE inside a transaction
-- 3) COMMIT if results look right (or ROLLBACK)

-- ============================================
-- PREVIEW: rows that would be deleted
-- ============================================
SELECT
  dc.id AS coach_id,
  dc.user_id,
  dc.label AS coach_label,
  dc.stage,
  dc.created_at AS coach_created_at
FROM downline_coaches dc
WHERE EXISTS (
  SELECT 1
  FROM clients c
  WHERE c.user_id = dc.user_id
    AND lower(trim(c.label)) = lower(trim(dc.label))
    AND c.status = 'future_coach'
)
AND NOT EXISTS (
  SELECT 1
  FROM clients c2
  WHERE c2.user_id = dc.user_id
    AND lower(trim(c2.label)) = lower(trim(dc.label))
    AND c2.status = 'coach_launched'
)
ORDER BY dc.user_id, dc.created_at DESC;

-- ============================================
-- DELETE: execute after preview verification
-- ============================================
BEGIN;

DELETE FROM downline_coaches dc
WHERE EXISTS (
  SELECT 1
  FROM clients c
  WHERE c.user_id = dc.user_id
    AND lower(trim(c.label)) = lower(trim(dc.label))
    AND c.status = 'future_coach'
)
AND NOT EXISTS (
  SELECT 1
  FROM clients c2
  WHERE c2.user_id = dc.user_id
    AND lower(trim(c2.label)) = lower(trim(dc.label))
    AND c2.status = 'coach_launched'
);

-- Check how many rows remain matching the bad condition (should be 0)
SELECT COUNT(*) AS remaining_bad_rows
FROM downline_coaches dc
WHERE EXISTS (
  SELECT 1
  FROM clients c
  WHERE c.user_id = dc.user_id
    AND lower(trim(c.label)) = lower(trim(dc.label))
    AND c.status = 'future_coach'
)
AND NOT EXISTS (
  SELECT 1
  FROM clients c2
  WHERE c2.user_id = dc.user_id
    AND lower(trim(c2.label)) = lower(trim(dc.label))
    AND c2.status = 'coach_launched'
);

-- If results look correct, run:
-- COMMIT;
-- If not, run:
-- ROLLBACK;
