-- ============================================================
-- Dry Trip: New London venue INSERTs (Step 4 — London-only launch)
-- Run in Supabase SQL Editor
-- All inserted as Draft — Kat reviews before publishing
-- ============================================================

-- ------------------------------------------------------------
-- 1. SEABIRD — Southwark (Score 3)
-- 14th floor rooftop at The Hoxton Southwark
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Seabird', 'seabird-southwark', 'London', 'United Kingdom', 'Bar', 'Southwark',
  3, 'Hatchling 0% ABV (Pentire Adrift, Martini Vibrante, lychee, dragon fruit, seasonal berries)', 5,
  'Rooftop seafood restaurant and cocktail bar on the 14th floor of The Hoxton Southwark. Bird-themed menu with integrated NA cocktails featuring Pentire spirits.',
  'https://thehoxton.com/london/southwark/seabird', '£11-21 cocktails',
  ARRAY['rooftop', 'seafood', 'cocktails', 'date-night', 'views'], 'Draft',
  'Parent hotel: The Hoxton Southwark. 3 NA cocktails (Hatchling, Hummingbird, Spoonbill) + 2 NA beers. Commercial Pentire/Martini Vibrante bases, integrated into bird-themed list.',
  'Rooftop bar with oyster bar and City/South Bank views. NA cocktails integrated alongside alcoholic versions in bird-themed menu. Pentire Adrift and Seaward as base spirits. Lucky Saint and Siren Soundwave IPA on AF beer list.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 2. ALBIE — Southwark (Score 3)
-- Ground floor at The Hoxton Southwark
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Albie', 'albie-southwark', 'London', 'United Kingdom', 'Restaurant', 'Southwark',
  3, 'Pentire Spritz 0% ABV (Pentire Coastal Spritz, cranberry, thyme, tonic)', 14,
  'All-day Mediterranean restaurant at The Hoxton Southwark. Largest NA spirits inventory of any single London venue — 5 brands stocked plus dedicated mocktails and fresh juice programme.',
  'https://thehoxton.com/london/southwark/albie-restaurant', '£8-11 NA cocktails',
  ARRAY['all-day', 'mediterranean', 'brunch', 'casual', 'hotel-lobby'], 'Draft',
  'Parent hotel: The Hoxton Southwark. 3 mocktails + 9 NA spirit pours (CleanCo x4, Martini x2, Pentire x2, Seedlip) + 2 NA beers + 9 fresh juices. Largest NA spirits inventory of any single venue.',
  'All-day restaurant with carbon labelling on dishes. Mocktails section (3 drinks, £10-11), dedicated NA aperitivo section with 9 standalone spirit pours (£8-9), fresh juice programme (3 blended + 6 standard), Lucky Saint on draught. Commercial bases throughout but exceptional breadth.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 3. NICKEL BAR — City of London (Score 3)
-- Relisted from "The Ned" hotel entry
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Nickel Bar', 'nickel-bar-city', 'London', 'United Kingdom', 'Bar', 'City of London',
  3, 'No Tai (Feragaia, grapefruit, orgeat, citrus)', 6,
  'Classic American cocktail bar in the Grade I listed former Midland Bank HQ. Art Deco grandeur with a dedicated NA section featuring niche spirit brands.',
  'https://www.thened.com/london/restaurants/the-nickel-bar', '£9-17.50 cocktails',
  ARRAY['art-deco', 'cocktails', 'grand', 'after-work', 'special-occasion'], 'Draft',
  'Relisted from The Ned hotel entry. Dedicated NA section: 4 cocktails (No Tai, French Lady, Virgin Picante, Seedlip & Tonic) + Crodino + 1 NA beer. Niche NA brands: Feragaia (Scottish botanical), Almave (Lewis Hamilton NA tequila).',
  'Grade I listed Midland Bank HQ, verdite-green marble, serious spirits collection. Dedicated "NON-ALCOHOLIC" section with 4 cocktails at £9 each. Uses Feragaia, Seedlip Grove 42, Almave, Crodino. Lucky Saint 0.5% lager also available.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 4a. CLARIDGE'S BAR — Mayfair (Score 3)
-- Split from Claridge's hotel entry
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Claridge''s Bar', 'claridges-bar-mayfair', 'London', 'United Kingdom', 'Bar', 'Mayfair',
  3, 'Spiced Mule (Seedlip Spice 94, falernum, lime, ginger ale)', 7,
  'Main cocktail bar at Claridge''s. Dedicated NA section with 5 cocktails and Wild Idol NA sparkling wines by the glass.',
  'https://www.claridges.co.uk/restaurants-bars/claridges-bar/', '£15-18 NA options',
  ARRAY['luxury', 'hotel-bar', 'cocktails', 'mayfair', 'celebration'], 'Draft',
  'Split from Claridge''s hotel entry. 5 NA cocktails (all £15) + Wild Idol NA sparkling (Brut & Rosé, £18/glass). Premium commercial bases: Seedlip, Tanqueray 0.0%, Clean Co, Martini Vibrante. Craft gap vs alcoholic side (fat-washing, oleo saccharum).',
  'Intimate leather-and-wood bar at Claridge''s hotel. Dedicated "Non-Alcoholic" section with 5 cocktails at £15 each, plus Wild Idol Brut & Rosé 2024 sparkling (£18/glass, £90/bottle). Photography by Richard Young. 88 pages of champagne on alcoholic side.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 4b. THE FUMOIR — Mayfair (Score 3)
-- Split from Claridge's hotel entry
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'The Fumoir', 'the-fumoir-mayfair', 'London', 'United Kingdom', 'Bar', 'Mayfair',
  3, 'Regal Tea Sparkle (The Pathfinder, Earl Grey Tea, maple, Wild Idol Sparkling)', 5,
  'Intimate cocktail lounge at Claridge''s. 1930s Art Deco with René Lalique panel. Dedicated "Spirit Free" section in the Bright Young Things menu.',
  'https://www.claridges.co.uk/restaurants-bars/the-fumoir/', '£9-15 NA options',
  ARRAY['intimate', 'art-deco', 'whisky', 'date-night', 'luxury'], 'Draft',
  'Split from Claridge''s hotel entry. 4 Spirit Free cocktails (all £15) + Lucky Saint (£9). Commercial bases: Pathfinder, CleanCo x2, Abstinence. Same illustration treatment as alcoholic sections.',
  'Former smoking lounge at Claridge''s, 1930s Art Deco with René Lalique panel (1931). "Bright Young Things" Jazz Age theme. Dedicated "Spirit Free" section with same design quality as alcoholic sections. Vintage spirits focus (rare Macallans, Japanese whisky).',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 4c. CLARIDGE'S RESTAURANT (Dante x Claridge's) — Mayfair (Score 3)
-- Split from Claridge's hotel entry
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Claridge''s Restaurant', 'claridges-restaurant-mayfair', 'London', 'United Kingdom', 'Restaurant', 'Mayfair',
  3, 'Pineapple Sgroppino (fluffy pineapple, Lyre''s prosecco, agave, lime)', 4,
  'Dante NYC collaboration at Claridge''s. Dedicated NA section with some house touches — fluffy pineapple technique, house cranberry blend. Wild Idol sparkling by the glass.',
  'https://www.claridges.co.uk/restaurants-bars/claridges-restaurant/', '£14 NA cocktails',
  ARRAY['fine-dining', 'italian', 'negroni', 'art-deco', 'special-occasion'], 'Draft',
  'Split from Claridge''s hotel entry. Dante NYC collab. 3 NA cocktails (all £14) + Wild Idol sparkling. Some house touches: fluffy pineapple technique, Dante cranberry blend. Caviar Martini and 9 bespoke negroni variants on alcoholic side.',
  'Dante NYC (est. 1915, Greenwich Village) collaboration with Claridge''s. Dedicated "Non-Alcoholic" section with 3 cocktails at £14. Negroni Sessions at £12 between 3-5pm daily. Grand art deco dining room. NA programme small but shows some house craft (fluffy pineapple, house cranberry).',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 5a. MR FOGG'S RESIDENCE — Mayfair (Score 3)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Mr Fogg''s Residence', 'mr-foggs-residence-mayfair', 'London', 'United Kingdom', 'Bar', 'Mayfair',
  3, 'Velvet Boudoir NA (Everleaf Marine, Martini Vibrante, caramelised pineapple & ginger shrub)', 9,
  'Immersive Victorian explorer-themed bar. NA cocktails integrated alongside alcoholic versions in themed room sections, plus AF sparkling and beer.',
  'https://www.mr-foggs.com', '£14 NA cocktails',
  ARRAY['immersive', 'theatrical', 'victorian', 'cocktails', 'groups'], 'Draft',
  'Mr Fogg''s chain. 5 NA cocktails (3 venue-specific + 2 chain-standard: Spicy Rupee, Elskling), 2 AF sparkling (Wild Life Botanicals, French Bloom), 2 AF beers (Stella 0.0%, UNLTD IPA). NA integrated alongside alcoholic in themed room sections.',
  'Immersive Victorian explorer bar with themed rooms (Drawing Room, Dining Room, Study, Bedchamber, Library). NA cocktails listed alongside alcoholic counterparts in each room section at £14. Chain-standardised Spicy Rupee and Elskling at all Fogg''s locations. Also hosts Murder Mystery experiences.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 5b. MR FOGG'S APOTHECARY — Mayfair (Score 3)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Mr Fogg''s Apothecary', 'mr-foggs-apothecary-mayfair', 'London', 'United Kingdom', 'Bar', 'Mayfair',
  3, 'Chilli-infused elderflower cordial cocktail (Everleaf Marine, papaya, pumpkin spiced syrup)', 6,
  'Apothecary-themed cocktail bar with a dedicated NA section. Thoughtful assembly — chilli-infused cordials, pumpkin spiced syrup, botanical builds.',
  'https://www.mr-foggs.com', '£14 NA cocktails',
  ARRAY['immersive', 'theatrical', 'cocktails', 'apothecary', 'groups'], 'Draft',
  'Mr Fogg''s chain. Dedicated NA section with 6 cocktails (4 venue-specific + 2 chain-standard). Commercial bases: Seedlip, Everleaf, Caleño, Martini Vibrante, Botivo. Thoughtful assembly with chilli-infused elderflower, pumpkin spiced syrup.',
  'Apothecary-themed Mr Fogg''s bar. Dedicated "Non-Alcoholic Cocktails" section with 6 drinks at £14 each. Builds slightly more interesting than other Fogg''s locations — chilli-infused elderflower cordial, pumpkin spiced syrup. Uses Seedlip, Everleaf, Caleño, Martini Vibrante, Botivo.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 5c. MR FOGG'S GIN PARLOUR — Covent Garden (Score 3)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Mr Fogg''s Gin Parlour', 'mr-foggs-gin-parlour-covent-garden', 'London', 'United Kingdom', 'Bar', 'Covent Garden',
  3, 'Bombay NA (Caleño White Coconut Tropical, caramelised pineapple & ginger shrub, almond, coconut milk)', 4,
  'Gin parlour-themed cocktail bar with integrated NA cocktails. Fewer options than other Fogg''s locations but same quality level.',
  'https://www.mr-foggs.com', '£11.50-12 NA cocktails',
  ARRAY['immersive', 'theatrical', 'gin', 'cocktails', 'covent-garden'], 'Draft',
  'Mr Fogg''s chain. 4 NA cocktails (2 venue-specific + 2 chain-standard). Commercial bases: Caleño, Everleaf, Martini Vibrante. Gin Parlour theme. Fewer NA options than other Fogg''s venues.',
  'Gin parlour-themed Mr Fogg''s bar in Covent Garden. 4 NA cocktails integrated alongside alcoholic versions at £11.50-12. Uses Caleño, Everleaf Mountain, Martini Vibrante. Nonsuch caramelised pineapple & ginger shrub.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 5d. MR FOGG'S BOTANICAL TAVERN — Fitzrovia (Score 3)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Mr Fogg''s Botanical Tavern', 'mr-foggs-botanical-tavern-fitzrovia', 'London', 'United Kingdom', 'Bar', 'Fitzrovia',
  3, 'NA Punch (Caleño, Everleaf Forest, passion fruit, apple, vanilla & caramel, Wild Life Botanicals)', 4,
  'Botanical-themed tavern with NA punch bowls available in sharing sizes. Integrated NA options alongside alcoholic versions.',
  'https://www.mr-foggs.com', '£10-38 NA (sharing sizes)',
  ARRAY['immersive', 'theatrical', 'botanical', 'sharing', 'groups'], 'Draft',
  'Mr Fogg''s chain. 4 NA options (2 punches in 3 sizes + 2 chain-standard). Commercial bases: Caleño, Everleaf, Martini Vibrante. Punch bowl sharing format.',
  'Botanical-themed Mr Fogg''s tavern in Fitzrovia. NA punches available in 3 sizes (solo/duo/group: £10/£19/£38). Uses Caleño, Everleaf Forest, Martini Vibrante, Wild Life Botanicals Nude Sparkling. Sharing punch bowl option is nice social touch.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 5e. MR FOGG'S SOCIETY OF EXPLORATION — Covent Garden (Score 3)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Mr Fogg''s Society of Exploration', 'mr-foggs-society-of-exploration-covent-garden', 'London', 'United Kingdom', 'Bar', 'Covent Garden',
  3, 'Yuzu Sparkle (Seedlip Grove 42, jasmine syrup, yuzu sherbet, Wild Life Botanicals)', 7,
  'Exploration-themed cocktail bar with a dedicated NA section and AF sparkling wine. Named cocktails with an adventure theme.',
  'https://www.mr-foggs.com', '£12 NA cocktails',
  ARRAY['immersive', 'theatrical', 'exploration', 'cocktails', 'covent-garden'], 'Draft',
  'Mr Fogg''s chain. Dedicated NA section: 6 cocktails (4 venue-specific + 2 chain-standard) + Wild Life Botanicals Nude Sparkling (£48 bottle). Commercial bases: Seedlip, Caleño, Everleaf, Martini Vibrante.',
  'Exploration Society-themed Mr Fogg''s bar in Covent Garden. Dedicated NA section with 6 cocktails at £12 each plus Wild Life Botanicals AF sparkling at £48/bottle. Named cocktails: Forty-Niner, The Cart, Santa Fe Railroad. Uses Seedlip, Caleño, Everleaf, Martini Vibrante.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 5f. MR FOGG'S TAVERN — Covent Garden (Score 3)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Mr Fogg''s Tavern', 'mr-foggs-tavern-covent-garden', 'London', 'United Kingdom', 'Bar', 'Covent Garden',
  3, 'NA Punch (Caleño, Everleaf Forest, passion fruit, apple, vanilla & caramel, Wild Life Botanicals)', 6,
  'Victorian tavern-themed bar with NA punch bowls in sharing sizes and AF beers. Slight pricing discount on NA options.',
  'https://www.mr-foggs.com', '£11.50-44 NA (sharing sizes)',
  ARRAY['immersive', 'theatrical', 'tavern', 'sharing', 'covent-garden'], 'Draft',
  'Mr Fogg''s chain. 4 NA cocktails (2 punches in 3 sizes + 2 chain-standard) + 2 AF beers (Stella 0.0%, UNLTD IPA). Slight pricing discount vs alcoholic (£11-11.50 vs £12-15).',
  'Victorian tavern-themed Mr Fogg''s bar in Covent Garden. NA punches in 3 sizes (solo/duo/group). 2 AF beers: Stella Artois 0.0%, UNLTD IPA 0.5%. NA pricing at slight discount (£11-11.50 vs £12-15 alcoholic).',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 5g. MR FOGG'S PAWNBROKERS — Soho (Score 3)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Mr Fogg''s Pawnbrokers', 'mr-foggs-pawnbrokers-soho', 'London', 'United Kingdom', 'Bar', 'Soho',
  3, 'NA Teapot Serve (Everleaf Forest, bergamot, peach, Earl Grey tea syrup, orange marmalade)', 4,
  'Pawnbroker-themed cocktail bar with NA teapot sharing serves and fair pricing. Earl Grey tea syrup and shrubs show thoughtful assembly.',
  'https://www.mr-foggs.com', '£11.50-22 NA cocktails',
  ARRAY['immersive', 'theatrical', 'sharing', 'cocktails', 'soho'], 'Draft',
  'Mr Fogg''s chain. 4 NA options (1 cocktail + 1 teapot serve for 2 + 2 chain-standard). Fair pricing (£11.50 matching alcoholic). Commercial bases with thoughtful assembly: Earl Grey tea syrup, mango & strawberry shrub.',
  'Pawnbroker-themed Mr Fogg''s bar in Soho. NA teapot serve format (£22, serves two) adds social/sharing dimension. Uses Caleño, Everleaf Forest, Martini Vibrante. Earl Grey tea syrup and orange marmalade in builds. Fair pricing at £11.50.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 5h. MR FOGG'S HAT TAVERN — Soho (Score 3)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Mr Fogg''s Hat Tavern', 'mr-foggs-hat-tavern-soho', 'London', 'United Kingdom', 'Bar', 'Soho',
  3, 'Perfect Timing NA (Smiling Wolf AF Agave, Everleaf Forest, chipotle chilli & hibiscus)', 7,
  'Hat tavern-themed bar with NA punches in sharing sizes, AF sparkling wine, and AF beers. Integrated alongside alcoholic versions.',
  'https://www.mr-foggs.com', '£11-48 NA options',
  ARRAY['immersive', 'theatrical', 'tavern', 'sharing', 'soho'], 'Draft',
  'Mr Fogg''s chain. 4 NA cocktails/punches + Wild Life Botanicals Nude Sparkling (£48) + 2 AF beers (Stella 0.0% £6.80, UNLTD IPA £6.50). Integrated alongside alcoholic. Same menu as City Tavern.',
  'Hat tavern-themed Mr Fogg''s bar in Soho. NA punches in 3 sizes (£11/£21/£42). Wild Life Botanicals Nude Sparkling at £48/bottle. Stella Artois 0.0% and UNLTD IPA 0.5% on AF beer list. Uses Caleño, Everleaf, Smiling Wolf, Martini Vibrante.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 5i. MR FOGG'S CITY TAVERN — Liverpool Street (Score 3)
-- Note from audit: 9th Mr Fogg's, NOT the original Covent Garden
-- The original "Mr Fogg's — Covent Garden" entry was updated in
-- audit-batch-update.sql. This is an additional City location.
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Mr Fogg''s City Tavern', 'mr-foggs-city-tavern-liverpool-street', 'London', 'United Kingdom', 'Bar', 'Liverpool Street',
  3, 'Perfect Timing NA (Smiling Wolf AF Agave, Everleaf Forest, chipotle chilli & hibiscus)', 7,
  'City of London outpost near Liverpool Street. Same NA programme as Hat Tavern — punches, AF sparkling, and AF beers. Business and after-work crowd.',
  'https://www.mr-foggs.com', '£11-48 NA options',
  ARRAY['immersive', 'theatrical', 'tavern', 'after-work', 'city'], 'Draft',
  'Mr Fogg''s chain. Identical NA menu to Hat Tavern: 4 cocktails/punches + Wild Life Botanicals + 2 AF beers. Near Liverpool Street Station, business/finance crowd.',
  'City of London Mr Fogg''s near Liverpool Street Station. Identical NA menu to Hat Tavern and Soho locations. NA punches in 3 sizes, Wild Life Botanicals Nude Sparkling, Stella Artois 0.0% and UNLTD IPA 0.5%. Business/finance after-work crowd.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 6a. BAR LINA — Shoreditch (Score 1)
-- New entry (Soho entry already exists, renamed in audit-batch-update.sql)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Bar Lina — Shoreditch', 'bar-lina-shoreditch', 'London', 'United Kingdom', 'Bar', 'Shoreditch',
  1, 'Conformista 0% (Adriatico Amaretto 0%, grapefruit, rooibos)', 2,
  'Italian cocktail bar. One NA cocktail and one AF beer — minimal effort on the non-alcoholic side.',
  'https://www.barlina.co.uk', '£4-9.50 NA options',
  ARRAY['italian', 'aperitivo', 'neighbourhood'], 'Draft',
  'Split from Bar Lina. Single NA cocktail (Conformista 0%) + Menabrea 0%. "Non-Alcoholic Cocktails" section header generous for one drink. No craft, no breadth.',
  'Italian cocktail bar in Shoreditch. Only 1 NA cocktail: Conformista 0% (Adriatico Amaretto 0%, grapefruit, rooibos) at £9.50. Plus Menabrea 0% beer at £4. Negroni, Spritz, natural wines on alcoholic side. Same brand as Soho and Canary Wharf locations.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 6b. BAR LINA — Canary Wharf (Score 1)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Bar Lina — Canary Wharf', 'bar-lina-canary-wharf', 'London', 'United Kingdom', 'Bar', 'Canary Wharf',
  1, 'Conformista 0% (Adriatico Amaretto 0%, grapefruit, rooibos)', 2,
  'Italian cocktail bar in Canary Wharf. Identical to Shoreditch — one NA cocktail and one AF beer.',
  'https://www.barlina.co.uk', '£4-7 NA options',
  ARRAY['italian', 'aperitivo', 'canary-wharf', 'after-work'], 'Draft',
  'Split from Bar Lina. Identical NA menu to Shoreditch: Conformista 0% (£7) + Menabrea 0% (£4). Lower pricing than Shoreditch (£7 vs £9.50).',
  'Italian cocktail bar in Canary Wharf financial district. Same minimal NA offering as Shoreditch: Conformista 0% at £7 (cheaper than Shoreditch £9.50) plus Menabrea 0% at £4.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 7. THREE SHEETS — Soho (Score 4)
-- Split from Three Sheets (Dalston already exists)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Three Sheets — Soho', 'three-sheets-soho', 'London', 'United Kingdom', 'Bar', 'Soho',
  4, 'Negroni 0.0% (Midi Ruby, Opius Albedo & Amaro, juniper, cubeb pepper)', 4,
  'Minimalist, technique-forward cocktail bar. Dedicated 0% section with equal pricing, own names, and serious ingredients — verjus, cubeb pepper, miso.',
  'https://www.threesheetsbar.com', '£11 NA cocktails (same as alcoholic)',
  ARRAY['minimalist', 'technique-forward', 'cocktails', 'neighbourhood', 'soho'], 'Draft',
  'Split from Three Sheets. Same NA menu as Dalston: 4 named 0% cocktails (Americano, Whisky Sour, Negroni, Espresso Martini), all £11 — equal pricing. Serious ingredients: verjus, cubeb pepper, miso, apple vinegar. Printed on menu.',
  'Minimalist cocktail bar in Soho. Same owners and menu as Dalston location. Dedicated 0% section: Americano 0.0% (Midi Ruby, Opius Rubedo & Amaro, cherry, apple vinegar), Whisky Sour 0.0% (Opius Nigredo, Waikato Tea, maple, verjus, oak), Negroni 0.0% (Midi Ruby, Opius Albedo & Amaro, juniper, cubeb pepper), Espresso Martini 0.0% (Opius Nigredo, cacao nib, Dead Good Coffee, miso). All £11.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 8a. DISHOOM — King's Cross (Score 5)
-- Split from "Dishoom — Multiple locations"
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Dishoom — King''s Cross', 'dishoom-kings-cross', 'London', 'United Kingdom', 'Restaurant', 'King''s Cross',
  5, 'Sober Summer Negroni (house-made no-alcohol gin, vermouth, bitter syrup)', 20,
  'Bombay cafe culture where NA is central to the identity. House-made no-alcohol gin, 8 named NA cocktails, functional wellness shots, full chai and coffee programme.',
  'https://www.dishoom.com', '£7.90-10.70 NA cocktails',
  ARRAY['indian', 'cafe-culture', 'brunch', 'groups', 'buzzy', 'design-heavy'], 'Draft',
  'Split from Dishoom multi-location entry. Score 5 (Identity-defining). 8 Teetotal Tipples + sharbats + wellness shots (ashwagandha, lion''s mane, CBD) + chai/coffee programme. House-made no-alcohol gin. Standardised across all locations.',
  'Bombay cafe culture in King''s Cross. NA is central to Dishoom''s identity — "Teetotal Tipples" with 8 named 0% cocktails including Sober Summer Negroni with house-made no-alcohol gin. Functional wellness programme (lion''s mane, CBD, ashwagandha). Sharbats, fresh juices, Baba''s single-estate coffee, house chai. On Beer 0% IPA. Dry January social content promotes NA prominently.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 8b. DISHOOM — Covent Garden (Score 5)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Dishoom — Covent Garden', 'dishoom-covent-garden', 'London', 'United Kingdom', 'Restaurant', 'Covent Garden',
  5, 'Sober Summer Negroni (house-made no-alcohol gin, vermouth, bitter syrup)', 20,
  'Bombay cafe culture where NA is central to the identity. Same full Teetotal Tipples programme as all Dishoom locations.',
  'https://www.dishoom.com', '£7.90-10.70 NA cocktails',
  ARRAY['indian', 'cafe-culture', 'brunch', 'groups', 'buzzy'], 'Draft',
  'Split from Dishoom multi-location entry. Identical NA programme to King''s Cross. Covent Garden flagship.',
  'Dishoom''s Covent Garden location. Same full NA programme: 8 Teetotal Tipples, sharbats, wellness shots, chai, Baba''s coffee. House-made no-alcohol gin for Sober Summer Negroni. Standardised menu across all Dishoom locations.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 8c. DISHOOM — Shoreditch (Score 5)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Dishoom — Shoreditch', 'dishoom-shoreditch', 'London', 'United Kingdom', 'Restaurant', 'Shoreditch',
  5, 'Sober Summer Negroni (house-made no-alcohol gin, vermouth, bitter syrup)', 20,
  'Bombay cafe culture where NA is central to the identity. Same full Teetotal Tipples programme as all Dishoom locations.',
  'https://www.dishoom.com', '£7.90-10.70 NA cocktails',
  ARRAY['indian', 'cafe-culture', 'brunch', 'groups', 'east-london'], 'Draft',
  'Split from Dishoom multi-location entry. Identical NA programme. Shoreditch location.',
  'Dishoom''s Shoreditch location. Same full NA programme: 8 Teetotal Tipples, sharbats, wellness shots, chai, Baba''s coffee. House-made no-alcohol gin. East London crowd.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 9a. COCKTAIL CLUB — Oxford Circus (Score 3)
-- Split from "Cocktail Club — Multiple locations"
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Cocktail Club — Oxford Circus', 'cocktail-club-oxford-circus', 'London', 'United Kingdom', 'Bar', 'Oxford Circus',
  3, 'High & Dry Pornstar Puff (Smiling Wolf AF spirit, optional alcohol shot on the side)', 8,
  'Party-first basement bar with two dedicated NA menu sections: The Mocktail Club (4 drinks) and High & Dry (4 NA cocktails with optional alcohol shot). Smart dual-format approach.',
  'https://www.cocktailclub.com', '£8-12 NA cocktails',
  ARRAY['party', 'basement', 'late-night', 'groups', 'birthdays'], 'Draft',
  'Split from Cocktail Club multi-location. Downgraded from 4 to 3. Two NA sections: "The Mocktail Club" (Crodino Spritz, Strawberry Spritz, Pina Con-Nada, Alojito) + "High & Dry" (4 Smiling Wolf-based NA with optional alcohol shot). Commercial bases, no house craft.',
  'Self-described "Bars That Party" basement bar near Oxford Circus. Two dedicated NA menu sections: The Mocktail Club (4 classic-style NA cocktails) and High & Dry (4 Smiling Wolf AF spirit cocktails, each with optional alcohol shot on the side). Uses Smiling Wolf AF spirits, Crodino, Real Drinks Co sparkling tea.',
  'manual', CURRENT_DATE, 'kat'
);

-- ------------------------------------------------------------
-- 9b. COCKTAIL CLUB — Shoreditch (Score 3)
-- ------------------------------------------------------------
INSERT INTO venues (
  name, slug, city, country, category, neighborhood,
  dry_score, top_na_drink, na_drink_count, short_description,
  website_url, price_range,
  vibe_tags, status, notes,
  ai_context, source, last_verified, verified_by
) VALUES (
  'Cocktail Club — Shoreditch', 'cocktail-club-shoreditch', 'London', 'United Kingdom', 'Bar', 'Shoreditch',
  3, 'High & Dry Pornstar Puff (Smiling Wolf AF spirit, optional alcohol shot on the side)', 8,
  'Party-first basement bar with the same two dedicated NA menu sections as all Cocktail Club locations.',
  'https://www.cocktailclub.com', '£8-12 NA cocktails',
  ARRAY['party', 'basement', 'late-night', 'groups', 'east-london'], 'Draft',
  'Split from Cocktail Club multi-location. Same NA menu as Oxford Circus. Shoreditch location.',
  'Cocktail Club Shoreditch. Same NA menu across all locations: The Mocktail Club (4 drinks) + High & Dry (4 Smiling Wolf AF cocktails with optional alcohol shot). East London party crowd.',
  'manual', CURRENT_DATE, 'kat'
);

-- ============================================================
-- SUMMARY: 22 new venue entries
-- - Seabird (3), Albie (3), Nickel Bar (3)
-- - Claridge's Bar (3), The Fumoir (3), Claridge's Restaurant (3)
-- - Mr Fogg's x9: Residence, Apothecary, Gin Parlour, Botanical
--   Tavern, Society of Exploration, Tavern, Pawnbrokers, Hat
--   Tavern, City Tavern (all 3)
-- - Bar Lina Shoreditch (1), Bar Lina Canary Wharf (1)
-- - Three Sheets Soho (4)
-- - Dishoom x3: King's Cross, Covent Garden, Shoreditch (all 5)
-- - Cocktail Club x2: Oxford Circus, Shoreditch (both 3)
--
-- All inserted as Draft. Review and publish via /admin/review.
-- ============================================================
