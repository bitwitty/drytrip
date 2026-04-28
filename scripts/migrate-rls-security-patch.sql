-- Dry Trip: RLS Security Patch
-- Run this in the Supabase SQL Editor.
-- Adds UPDATE and DELETE deny policies so the public anon key cannot
-- mutate venue data. All writes must go through the service-role key
-- (supabaseAdmin), which is only available server-side.

-- Venues: deny UPDATE for anon/public roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'venues' AND policyname = 'Venues are not updatable by anon'
  ) THEN
    CREATE POLICY "Venues are not updatable by anon"
      ON venues FOR UPDATE
      USING (false);
  END IF;
END
$$;

-- Venues: deny DELETE for anon/public roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'venues' AND policyname = 'Venues are not deletable by anon'
  ) THEN
    CREATE POLICY "Venues are not deletable by anon"
      ON venues FOR DELETE
      USING (false);
  END IF;
END
$$;

-- Venues: deny INSERT for anon/public roles (pipeline uses service-role key anyway)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'venues' AND policyname = 'Venues are not insertable by anon'
  ) THEN
    CREATE POLICY "Venues are not insertable by anon"
      ON venues FOR INSERT
      WITH CHECK (false);
  END IF;
END
$$;

-- Waitlist: enable RLS and restrict reads (emails should not be publicly readable)
ALTER TABLE IF EXISTS waitlist ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'waitlist' AND policyname = 'Waitlist inserts are open'
  ) THEN
    CREATE POLICY "Waitlist inserts are open"
      ON waitlist FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'waitlist' AND policyname = 'Waitlist reads are blocked for anon'
  ) THEN
    CREATE POLICY "Waitlist reads are blocked for anon"
      ON waitlist FOR SELECT
      USING (false);
  END IF;
END
$$;
