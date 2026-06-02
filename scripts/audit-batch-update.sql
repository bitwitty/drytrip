-- =============================================================
-- London Venue Audit — Batch Database Update
-- Generated: 2026-05-28
-- Source: plans/venue-audit-london-notes.md
-- =============================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Review each section before executing
-- =============================================================

BEGIN;

-- =============================================================
-- SECTION 1: Score Changes (Published venues)
-- =============================================================

-- Eve Bar: 4 → 1, move to Draft
UPDATE venues SET dry_score = 1, status = 'Draft' WHERE id = '5ceaecb4-94f9-4f75-9a98-ab724cd2e724';

-- Dishoom: 3 → 5
UPDATE venues SET dry_score = 5 WHERE id = '56ea1fb1-27ce-4ddc-a598-72abd86fbafd';

-- Coco Grill & Lounge: 3 → 5
UPDATE venues SET dry_score = 5 WHERE id = '9cad03c5-6f88-449f-a4f2-8d1972c63b61';

-- COCO Canary Wharf: 3 → 5
UPDATE venues SET dry_score = 5 WHERE id = '4c3fd298-424a-43f8-bff7-ba252eaa375e';

-- The Cocktail Club: 4 → 3
UPDATE venues SET dry_score = 3 WHERE id = '2867d327-ea86-4755-9618-c3ae4c9b5069';

-- Bar Crispin: 4 → 3, fix neighborhood to Soho
UPDATE venues SET dry_score = 3, neighborhood = 'Soho' WHERE id = '6ae19bbf-5e6a-47b2-a0c4-3096ebe441d4';

-- The Goring Bar: 4 → 3
UPDATE venues SET dry_score = 3 WHERE id = 'd7dd4e8f-2bef-4b9b-8de4-dbb40eea3653';

-- Ham Yard Hotel: 4 → 3
UPDATE venues SET dry_score = 3 WHERE id = '9b4e813c-2df2-474f-8785-666b8ea156ec';

-- The May Fair Bar: 4 → 3
UPDATE venues SET dry_score = 3 WHERE id = '108e7086-eae1-4b60-a1d2-8414ab0115f3';

-- Cellar at Kindred: 4 → 3, fix neighborhood to Hammersmith
UPDATE venues SET dry_score = 3, neighborhood = 'Hammersmith' WHERE id = '51bd6ce4-a371-4561-8967-ff9546ffc65c';

-- Purgatory Bar: 4 → 3, fix neighborhood to Pimlico
UPDATE venues SET dry_score = 3, neighborhood = 'Pimlico' WHERE id = '0751dd6b-2a59-446d-9a62-cdb40ad578a5';

-- The Library Bar: 4 → 3, fix neighborhood to Belgravia
UPDATE venues SET dry_score = 3, neighborhood = 'Belgravia' WHERE id = '9635e181-fca7-44c5-9efe-e80610e0296d';

-- 34 Mayfair: 4 → 3
UPDATE venues SET dry_score = 3 WHERE id = '4e7bf8ad-d00b-46e9-bd25-490c2dbbb527';

-- Nightjar: 4 → 3
UPDATE venues SET dry_score = 3 WHERE id = '53e53e9e-5e22-4d22-9f80-820b0337b26c';

-- Earl of Essex: 3 → 2
UPDATE venues SET dry_score = 2 WHERE id = 'b6050dc0-52cb-4e09-8dd7-41cb7dc967c9';

-- Jazu: 4 → 2
UPDATE venues SET dry_score = 2 WHERE id = '6d0f5ed9-51a2-459f-bd2a-8a69a7aff16a';

-- Bar Lina (existing): 4 → 2, fix neighborhood to Soho, rename
UPDATE venues SET dry_score = 2, neighborhood = 'Soho', name = 'Bar Lina — Soho' WHERE id = '42c9acb1-6b99-4948-85fe-7ea86dd10e37';

-- Chutney Mary: 3 → 4
UPDATE venues SET dry_score = 4 WHERE id = '1b6649d4-96d1-4269-b388-467ca0480404';

-- Florattica: 3 → 2, fix neighborhood to Aldgate
UPDATE venues SET dry_score = 2, neighborhood = 'Aldgate' WHERE id = 'e500815c-b3ae-41a4-84c7-891844121767';

-- Spring: 3 → 4
UPDATE venues SET dry_score = 4 WHERE id = '2c76d07d-105d-4356-9429-fc3cef5389da';

-- Stables Bar: 3 → 4
UPDATE venues SET dry_score = 4 WHERE id = 'a7403246-ac2d-484c-a03a-b43af4998b52';

-- The Wolseley: 3 → 4
UPDATE venues SET dry_score = 4 WHERE id = '06e47bf6-3401-447a-8a26-6d13b7d1e3a8';

-- The River Café: 3 → 2
UPDATE venues SET dry_score = 2 WHERE id = '0853c5d9-7fcd-4768-ad4a-4a3f93cd0146';

-- The Zetter Townhouse: 3 → 2
UPDATE venues SET dry_score = 2 WHERE id = 'c9e6324d-b8ff-4486-9682-31fd46f40c7d';

-- Cahoots Underground: fix neighborhood to Soho
UPDATE venues SET neighborhood = 'Soho' WHERE id = 'f318c5bc-1ffc-4eff-b402-b0795f2f6b1e';

-- Tattu London: 2 → 4, publish
UPDATE venues SET dry_score = 4, status = 'Published' WHERE id = 'd2945045-18d6-4678-b03f-ddf4d855c373';

-- Le Magritte Bar: 2 → 3, publish
UPDATE venues SET dry_score = 3, status = 'Published' WHERE id = '33141fc7-b0ee-48e9-9ae4-e18a017b9c6e';

-- The Coral Room: 2 → 3, publish
UPDATE venues SET dry_score = 3, status = 'Published' WHERE id = '36da2467-e74b-4ed5-ab6e-a2c0d4186265';

-- =============================================================
-- SECTION 2: Unpublish (closed/rebranded/not a venue)
-- =============================================================

-- Scout: permanently closed
UPDATE venues SET status = 'Draft' WHERE id = 'abada0d5-f4e5-42ef-b8d8-314246b91161';

-- Nobu Hotel Shoreditch: wound down
UPDATE venues SET status = 'Draft' WHERE id = 'eaa5cff7-3dc9-47e4-b273-5665225c8b7a';

-- The Book Club: permanently closed
UPDATE venues SET status = 'Draft' WHERE id = 'f80e1607-6195-4175-ad2f-3a0acf991340';

-- Mondrian London: rebranded to Virgin Hotels
UPDATE venues SET status = 'Draft' WHERE id = 'ddd3f33a-6b59-4a40-9c6f-97d17d70447e';

-- Mixology Events: not a venue
UPDATE venues SET status = 'Draft' WHERE id = 'b69c6a89-6a7d-430b-875d-8bb1ac16a64f';

-- Tayēr + Elementary: fire closure
UPDATE venues SET status = 'Draft' WHERE id = '03cccfb5-95e0-404c-a1ed-d4ff765b9941';

-- =============================================================
-- SECTION 3: Unpublish Hotel entries (replaced by named bars)
-- =============================================================

-- The Lanesborough (Library Bar covers it)
UPDATE venues SET status = 'Draft' WHERE id = '9191e602-dfab-49da-b9cd-5ddb00daafc5';

-- The Hoxton Southwark (split into Seabird + Albie)
UPDATE venues SET status = 'Draft' WHERE id = 'f38096e8-791c-446f-9f74-eda3ebde6c60';

-- The Ned (relist as Nickel Bar)
UPDATE venues SET status = 'Draft' WHERE id = 'cdf117ce-40de-4e84-8fbe-ed80a0ba162a';

-- The Langham (Artesian covers it)
UPDATE venues SET status = 'Draft' WHERE id = 'd71dcfc3-55ab-45a3-8b0c-cb3d91941e54';

-- The Savoy (American Bar covers it)
UPDATE venues SET status = 'Draft' WHERE id = 'd05509bd-cbcd-4fbc-98a6-05c90d6541dd';

-- Claridges single entry (split into 3)
UPDATE venues SET status = 'Draft' WHERE id = '590f110b-fc99-4a64-9cb9-e4d53d376eed';

-- The Connaught hotel entry (Connaught Bar covers it)
UPDATE venues SET status = 'Draft' WHERE id = '0f9c822a-b56a-4f59-9f36-2ef85a07cefa';

-- Mayfair Townhouse (Dandy Bar covers it)
UPDATE venues SET status = 'Draft' WHERE id = 'a8d9aa31-ee58-446e-b7f8-8a663ab54914';

-- The Mayfair Townhouse duplicate
UPDATE venues SET status = 'Draft' WHERE id = '27c6fd56-6582-4bf4-9cec-dde407f85b7d';

-- =============================================================
-- SECTION 4: Lucky Saint merge
-- =============================================================

-- Update the Published entry to score 5, fix name and neighborhood
UPDATE venues SET dry_score = 5, name = 'The Lucky Saint Pub', neighborhood = 'Marylebone' WHERE id = '0759bbe6-d916-4e66-8429-90b753adf560';

-- Keep the Draft Camden entry as-is (already Draft)
-- fd4ce7be-4b97-4e89-a1ae-2fc7c4e1108e stays Draft

-- =============================================================
-- SECTION 5: Artesian merge
-- =============================================================

-- Keep "Artesian at The Langham" as the main entry, already Published at 4
-- 483e442e-2611-4fa8-87de-ce6e7f636d4c — keep as-is

-- Draft the duplicate "Artesian" hotel entry (already Draft)
-- 852e67cb-19c8-4be0-a35d-961546af2fb4 — already Draft

-- Draft "The Langham" hotel entry (done in Section 3)
-- Draft "The Langham, London" (already Draft)
-- eb71264e-784f-4cbb-9013-cf3893125341 — already Draft

-- =============================================================
-- SECTION 6: Draft all non-London Published venues
-- =============================================================

UPDATE venues SET status = 'Draft' WHERE city != 'London' AND status = 'Published';

-- =============================================================
-- DONE — Verify with:
-- SELECT name, dry_score, status, neighborhood FROM venues
--   WHERE city = 'London' AND status = 'Published'
--   ORDER BY name;
-- =============================================================

COMMIT;
