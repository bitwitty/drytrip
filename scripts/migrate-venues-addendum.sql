-- Dry Trip: Addendum migration
-- Run this in the Supabase SQL Editor AFTER the initial migration.
-- Additive only — does NOT drop or recreate existing tables.

-- 1. Add verification/source fields to venues
ALTER TABLE venues ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS last_verified DATE;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- 2. Create reviews table (stub — no UI in MVP)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  author_name TEXT,
  author_email TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_venue_id ON reviews(venue_id);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Reviews are publicly readable'
  ) THEN
    CREATE POLICY "Reviews are publicly readable"
      ON reviews FOR SELECT
      USING (true);
  END IF;
END
$$;

-- 3. Set initial verification data for existing Published venues
UPDATE venues
SET last_verified = CURRENT_DATE,
    verified_by = 'kat',
    source = 'pipeline'
WHERE status = 'Published'
  AND last_verified IS NULL;
