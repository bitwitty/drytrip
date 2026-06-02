-- Dry Trip: Urgent RLS fix
-- Run this in the Supabase SQL Editor immediately.
-- Ensures ALL tables have RLS enabled and proper policies.

-- ============================================================
-- 1. ENABLE RLS on every table (idempotent — safe to re-run)
-- ============================================================
ALTER TABLE venues        ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_clicks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. VENUES — public can read, only service-role can write
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='venues' AND policyname='Venues are publicly readable') THEN
    CREATE POLICY "Venues are publicly readable" ON venues FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='venues' AND policyname='Venues are not insertable by anon') THEN
    CREATE POLICY "Venues are not insertable by anon" ON venues FOR INSERT WITH CHECK (false);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='venues' AND policyname='Venues are not updatable by anon') THEN
    CREATE POLICY "Venues are not updatable by anon" ON venues FOR UPDATE USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='venues' AND policyname='Venues are not deletable by anon') THEN
    CREATE POLICY "Venues are not deletable by anon" ON venues FOR DELETE USING (false);
  END IF;
END $$;

-- ============================================================
-- 3. WAITLIST — anyone can insert (signup), nobody can read/update/delete
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='waitlist' AND policyname='Waitlist inserts are open') THEN
    CREATE POLICY "Waitlist inserts are open" ON waitlist FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='waitlist' AND policyname='Waitlist reads are blocked for anon') THEN
    CREATE POLICY "Waitlist reads are blocked for anon" ON waitlist FOR SELECT USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='waitlist' AND policyname='Waitlist updates are blocked') THEN
    CREATE POLICY "Waitlist updates are blocked" ON waitlist FOR UPDATE USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='waitlist' AND policyname='Waitlist deletes are blocked') THEN
    CREATE POLICY "Waitlist deletes are blocked" ON waitlist FOR DELETE USING (false);
  END IF;
END $$;

-- ============================================================
-- 4. VENUE_CLICKS — anyone can insert (tracking), reads for service-role only
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='venue_clicks' AND policyname='Venue clicks are insertable by anyone') THEN
    CREATE POLICY "Venue clicks are insertable by anyone" ON venue_clicks FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='venue_clicks' AND policyname='Venue clicks reads blocked for anon') THEN
    CREATE POLICY "Venue clicks reads blocked for anon" ON venue_clicks FOR SELECT USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='venue_clicks' AND policyname='Venue clicks updates blocked') THEN
    CREATE POLICY "Venue clicks updates blocked" ON venue_clicks FOR UPDATE USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='venue_clicks' AND policyname='Venue clicks deletes blocked') THEN
    CREATE POLICY "Venue clicks deletes blocked" ON venue_clicks FOR DELETE USING (false);
  END IF;
END $$;

-- ============================================================
-- 5. REVIEWS — public can read approved, only service-role can write
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Reviews are publicly readable') THEN
    CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Reviews inserts blocked for anon') THEN
    CREATE POLICY "Reviews inserts blocked for anon" ON reviews FOR INSERT WITH CHECK (false);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Reviews updates blocked for anon') THEN
    CREATE POLICY "Reviews updates blocked for anon" ON reviews FOR UPDATE USING (false);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='Reviews deletes blocked for anon') THEN
    CREATE POLICY "Reviews deletes blocked for anon" ON reviews FOR DELETE USING (false);
  END IF;
END $$;

-- ============================================================
-- DONE. Verify with:
-- SELECT tablename, policyname, cmd FROM pg_policies ORDER BY tablename;
-- ============================================================
