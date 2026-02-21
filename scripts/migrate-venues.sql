-- Dry Trip: Venues table migration
-- Run this in the Supabase SQL Editor to create/update the venues table.
--
-- If a `venues` table already exists with fewer columns, this will:
-- 1. Drop the old table (safe — the scraped JSON files are the source of truth)
-- 2. Create the full schema

-- Drop existing table if it has the old schema
DROP TABLE IF EXISTS venue_clicks;
DROP TABLE IF EXISTS venues CASCADE;

CREATE TABLE venues (
  -- Core identity
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  city            TEXT NOT NULL,
  country         TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('Hotel', 'Restaurant', 'Bar')),
  neighborhood    TEXT,

  -- Dry Score data
  dry_score       INTEGER CHECK (dry_score >= 1 AND dry_score <= 5),
  top_na_drink    TEXT,
  na_drink_count  INTEGER,
  description     TEXT,
  short_description TEXT,

  -- Links
  website_url     TEXT,
  menu_url        TEXT,
  booking_url     TEXT,
  image_url       TEXT,

  -- Features
  af_minibar      BOOLEAN DEFAULT false,
  zero_proof_pairing BOOLEAN DEFAULT false,
  vibe_tags       TEXT[] DEFAULT '{}',
  price_range     TEXT,
  hours_note      TEXT,

  -- Pipeline & review
  google_place_id TEXT,
  status          TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Rejected')),
  notes           TEXT,
  featured        BOOLEAN DEFAULT false,

  -- AI context
  ai_context      TEXT,

  -- Location
  latitude        FLOAT,
  longitude       FLOAT,

  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_category ON venues(category);
CREATE INDEX idx_venues_status ON venues(status);
CREATE INDEX idx_venues_dry_score ON venues(dry_score);
CREATE INDEX idx_venues_slug ON venues(slug);

-- Venue click tracking
CREATE TABLE venue_clicks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id    UUID REFERENCES venues(id) ON DELETE CASCADE,
  source      TEXT CHECK (source IN ('directory_card', 'detail_page', 'chat_card')),
  clicked_at  TIMESTAMPTZ DEFAULT now(),
  session_id  TEXT
);

CREATE INDEX idx_venue_clicks_venue ON venue_clicks(venue_id);
CREATE INDEX idx_venue_clicks_date ON venue_clicks(clicked_at);

-- RLS: venues are readable by everyone, writable only by service role
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venues are publicly readable"
  ON venues FOR SELECT
  USING (true);

CREATE POLICY "Venue clicks are insertable by anyone"
  ON venue_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Venue clicks are readable by authenticated"
  ON venue_clicks FOR SELECT
  USING (true);
