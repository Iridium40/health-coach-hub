-- Allow reminders linked to coach-client entries

DO $$
DECLARE
  existing_constraint_name text;
BEGIN
  SELECT con.conname
  INTO existing_constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'reminders'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%entity_type%'
  LIMIT 1;

  IF existing_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.reminders DROP CONSTRAINT %I', existing_constraint_name);
  END IF;
END $$;

ALTER TABLE public.reminders
  ADD CONSTRAINT reminders_entity_type_check
  CHECK (entity_type IN ('prospect', 'client', 'coach_client'));
