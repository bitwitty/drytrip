-- ============================================================
-- Publish all 22 new venue INSERTs from the London audit
-- All scores confirmed during audit — no further review needed
-- Run in Supabase SQL Editor after new-venue-inserts.sql
-- ============================================================

UPDATE venues SET status = 'Published', updated_at = now()
WHERE slug IN (
  'seabird-southwark',
  'albie-southwark',
  'nickel-bar-city',
  'claridges-bar-mayfair',
  'the-fumoir-mayfair',
  'claridges-restaurant-mayfair',
  'mr-foggs-residence-mayfair',
  'mr-foggs-apothecary-mayfair',
  'mr-foggs-gin-parlour-covent-garden',
  'mr-foggs-botanical-tavern-fitzrovia',
  'mr-foggs-society-of-exploration-covent-garden',
  'mr-foggs-tavern-covent-garden',
  'mr-foggs-pawnbrokers-soho',
  'mr-foggs-hat-tavern-soho',
  'mr-foggs-city-tavern-liverpool-street',
  'bar-lina-shoreditch',
  'bar-lina-canary-wharf',
  'three-sheets-soho',
  'dishoom-kings-cross',
  'dishoom-covent-garden',
  'dishoom-shoreditch',
  'cocktail-club-oxford-circus',
  'cocktail-club-shoreditch'
);
