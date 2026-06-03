-- ============================================================
-- Backfill lat/lng for 23 new London venues
-- Coordinates sourced from Google Maps
-- Run in Supabase SQL Editor
-- ============================================================

-- Hoxton Southwark venues (both in same building)
UPDATE venues SET latitude = 51.5048, longitude = -0.0990 WHERE slug = 'seabird-southwark';
UPDATE venues SET latitude = 51.5048, longitude = -0.0990 WHERE slug = 'albie-southwark';

-- Nickel Bar (The Ned, 27 Poultry)
UPDATE venues SET latitude = 51.5134, longitude = -0.0911 WHERE slug = 'nickel-bar-city';

-- Claridge's venues (all at Brook Street, W1K 4HR)
UPDATE venues SET latitude = 51.5128, longitude = -0.1494 WHERE slug = 'claridges-bar-mayfair';
UPDATE venues SET latitude = 51.5128, longitude = -0.1494 WHERE slug = 'the-fumoir-mayfair';
UPDATE venues SET latitude = 51.5128, longitude = -0.1494 WHERE slug = 'claridges-restaurant-mayfair';

-- Mr Fogg's Residence (15 Bruton Lane, Mayfair)
UPDATE venues SET latitude = 51.5098, longitude = -0.1445 WHERE slug = 'mr-foggs-residence-mayfair';

-- Mr Fogg's Apothecary (10 Bourdon Street, Mayfair)
UPDATE venues SET latitude = 51.5102, longitude = -0.1476 WHERE slug = 'mr-foggs-apothecary-mayfair';

-- Mr Fogg's Gin Parlour (1 New Row, Covent Garden)
UPDATE venues SET latitude = 51.5117, longitude = -0.1271 WHERE slug = 'mr-foggs-gin-parlour-covent-garden';

-- Mr Fogg's Botanical Tavern (48 Mortimer Street, Fitzrovia)
UPDATE venues SET latitude = 51.5184, longitude = -0.1414 WHERE slug = 'mr-foggs-botanical-tavern-fitzrovia';

-- Mr Fogg's Society of Exploration (1a Bedford Street, Covent Garden)
UPDATE venues SET latitude = 51.5106, longitude = -0.1248 WHERE slug = 'mr-foggs-society-of-exploration-covent-garden';

-- Mr Fogg's Tavern (58 St Martin's Lane, Covent Garden)
UPDATE venues SET latitude = 51.5113, longitude = -0.1266 WHERE slug = 'mr-foggs-tavern-covent-garden';

-- Mr Fogg's Pawnbrokers (57 Whitfield Street, Soho — actually Fitzrovia border)
UPDATE venues SET latitude = 51.5202, longitude = -0.1367 WHERE slug = 'mr-foggs-pawnbrokers-soho';

-- Mr Fogg's Hat Tavern (38 Greek Street, Soho)
UPDATE venues SET latitude = 51.5143, longitude = -0.1314 WHERE slug = 'mr-foggs-hat-tavern-soho';

-- Mr Fogg's City Tavern (17 Eldon Street, Liverpool Street)
UPDATE venues SET latitude = 51.5168, longitude = -0.0851 WHERE slug = 'mr-foggs-city-tavern-liverpool-street';

-- Bar Lina — Shoreditch (Rivington Street area)
UPDATE venues SET latitude = 51.5259, longitude = -0.0790 WHERE slug = 'bar-lina-shoreditch';

-- Bar Lina — Canary Wharf (Crossrail Place area)
UPDATE venues SET latitude = 51.5054, longitude = -0.0183 WHERE slug = 'bar-lina-canary-wharf';

-- Three Sheets — Soho (Lexington Street area)
UPDATE venues SET latitude = 51.5127, longitude = -0.1377 WHERE slug = 'three-sheets-soho';

-- Dishoom — King's Cross (Granary Square)
UPDATE venues SET latitude = 51.5358, longitude = -0.1259 WHERE slug = 'dishoom-kings-cross';

-- Dishoom — Covent Garden (12 Upper St Martin's Lane)
UPDATE venues SET latitude = 51.5118, longitude = -0.1270 WHERE slug = 'dishoom-covent-garden';

-- Dishoom — Shoreditch (7 Boundary Street)
UPDATE venues SET latitude = 51.5255, longitude = -0.0779 WHERE slug = 'dishoom-shoreditch';

-- Cocktail Club — Oxford Circus (Goodge Street area)
UPDATE venues SET latitude = 51.5195, longitude = -0.1353 WHERE slug = 'cocktail-club-oxford-circus';

-- Cocktail Club — Shoreditch (Old Street area)
UPDATE venues SET latitude = 51.5260, longitude = -0.0800 WHERE slug = 'cocktail-club-shoreditch';
