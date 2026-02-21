/**
 * Seed London venues from existing scraped JSON files into Supabase.
 *
 * For each venue with dry_score >= 1:
 *   - Generates a URL slug
 *   - Calls Claude to enrich with: neighborhood, short_description, vibe_tags, na_drink_count
 *   - Upserts into Supabase as Draft
 *
 * Usage: npx tsx scripts/seed-london.ts
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- Config ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY || !ANTHROPIC_KEY) {
  console.error("Missing required env vars. Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY");
  process.exit(1);
}

// Use fetch-based clients to avoid SDK module resolution issues on Node 25
async function supabaseRequest(method: string, table: string, body?: unknown, params?: string) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params ? `?${params}` : ""}`;
  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: method === "POST" ? "resolution=merge-duplicates" : "",
  };
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${method} ${table}: ${res.status} ${text}`);
  }
  if (method === "GET") return res.json();
  return null;
}

async function claudeMessage(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.content[0]?.text || "";
}

// --- Types ---
interface ScrapedVenue {
  name: string;
  city: string;
  country: string;
  category: string;
  dry_score: number;
  top_na_drink: string;
  description: string;
  menu_url: string | null;
  website_url: string | null;
  image_url: string | null;
  af_minibar: boolean;
  zero_proof_pairing: boolean;
}

interface Enrichment {
  neighborhood: string;
  short_description: string;
  vibe_tags: string[];
  na_drink_count: number;
}

// --- Helpers ---
function toSlug(name: string, city: string): string {
  const slug = `${name}-${city}`
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug;
}

async function deduplicateSlug(baseSlug: string): Promise<string> {
  const data = await supabaseRequest(
    "GET",
    "venues",
    undefined,
    `select=slug&slug=like.${encodeURIComponent(baseSlug + "%")}`
  );

  if (!data || data.length === 0) return baseSlug;

  const existing = new Set(data.map((r: { slug: string }) => r.slug));
  if (!existing.has(baseSlug)) return baseSlug;

  let i = 2;
  while (existing.has(`${baseSlug}-${i}`)) i++;
  return `${baseSlug}-${i}`;
}

async function enrichWithClaude(venue: ScrapedVenue): Promise<Enrichment> {
  const prompt = `You are helping build a sober-friendly travel directory for London. Given this venue data, provide enrichment fields.

Venue: ${venue.name}
City: ${venue.city}
Category: ${venue.category}
Description: ${venue.description}
Top NA Drink: ${venue.top_na_drink}
Website: ${venue.website_url || "N/A"}

Return a JSON object with exactly these fields:
1. "neighborhood" — the London neighborhood this venue is in (e.g. "Soho", "Shoreditch", "Mayfair", "South Bank"). Use your knowledge of London. If unsure, use "Central London".
2. "short_description" — a compelling 1-sentence pitch (max 120 chars) that makes someone want to visit. Write like a luxury travel magazine. Focus on what makes this place special for someone who doesn't drink. No quotes.
3. "vibe_tags" — array of 2-4 tags from: ["rooftop", "date-night", "cozy", "upscale", "casual", "lively", "intimate", "group-friendly", "late-night", "brunch", "garden", "historic", "modern", "speakeasy", "waterfront", "business", "wellness"]. Pick the most fitting.
4. "na_drink_count" — estimated number of distinct non-alcoholic cocktail/drink options. Use the description to estimate. If unknown, use 0.

Return ONLY the JSON object, no other text.`;

  const rawText = await claudeMessage(prompt);
  // Strip markdown code fences if present
  const text = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    console.warn(`  ⚠ Failed to parse Claude response for ${venue.name}, using defaults`);
    return {
      neighborhood: "Central London",
      short_description: `${venue.category === "Hotel" ? "A London hotel" : venue.category === "Restaurant" ? "A London restaurant" : "A London bar"} with non-alcoholic options worth exploring.`,
      vibe_tags: ["upscale"],
      na_drink_count: 0,
    };
  }
}

// --- Main ---
async function main() {
  const files = ["london-Bar.json", "london-Hotel.json", "london-Restaurant.json"];
  const allVenues: ScrapedVenue[] = [];

  for (const file of files) {
    const path = join(__dirname, "output", file);
    const buf = readFileSync(path);
    // Strip BOM if present and decode
    const raw = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF
      ? buf.subarray(3).toString("utf-8")
      : buf.toString("utf-8");
    const trimmed = raw.trim();
    if (!trimmed) {
      console.warn(`⚠ Skipping empty file: ${file}`);
      continue;
    }
    const data = JSON.parse(trimmed) as ScrapedVenue[];
    allVenues.push(...data);
  }

  console.log(`\nLoaded ${allVenues.length} total London venues from JSON files.`);

  // Filter: only seed venues with dry_score >= 1 (skip 0s and INSUFFICIENT_DATA)
  const viable = allVenues.filter(
    (v) => v.dry_score >= 1 && v.description !== "INSUFFICIENT_DATA" && v.description !== "No menu content found"
  );

  console.log(`${viable.length} venues have dry_score >= 1 with data. Enriching and seeding...\n`);

  let seeded = 0;
  let skipped = 0;

  for (const venue of viable) {
    console.log(`Processing: ${venue.name} (${venue.category}, score: ${venue.dry_score})`);

    // Generate slug
    const baseSlug = toSlug(venue.name, venue.city);
    const slug = await deduplicateSlug(baseSlug);

    // Enrich with Claude
    const enrichment = await enrichWithClaude(venue);
    console.log(`  → ${enrichment.neighborhood} | "${enrichment.short_description.substring(0, 60)}..."`);

    // Upsert into Supabase
    const row = {
      name: venue.name,
      slug,
      city: venue.city,
      country: venue.country,
      category: venue.category,
      neighborhood: enrichment.neighborhood,
      dry_score: venue.dry_score,
      top_na_drink: venue.top_na_drink === "N/A" ? null : venue.top_na_drink,
      na_drink_count: enrichment.na_drink_count,
      description: venue.description,
      short_description: enrichment.short_description,
      website_url: venue.website_url,
      menu_url: venue.menu_url,
      image_url: null, // Decision: launch without photos
      af_minibar: venue.af_minibar,
      zero_proof_pairing: venue.zero_proof_pairing,
      vibe_tags: enrichment.vibe_tags,
      status: "Draft",
    };

    try {
      await supabaseRequest("POST", "venues", row, "on_conflict=slug");
      console.log(`  ✓ Seeded as "${slug}"`);
      seeded++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Error seeding ${venue.name}: ${message}`);
      skipped++;
    }

    // Brief pause to avoid rate limiting Claude
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n--- Done ---`);
  console.log(`Seeded: ${seeded}`);
  console.log(`Skipped/errored: ${skipped}`);
  console.log(`\nNext steps:`);
  console.log(`1. Run the migration SQL (scripts/migrate-venues.sql) in Supabase SQL Editor FIRST if you haven't`);
  console.log(`2. Review venues in Supabase dashboard`);
  console.log(`3. Add short_description + vibe_tags for quality venues, then set status to Published`);
  console.log(`4. For venues with dry_score 0, manually research and add with: npx tsx scripts/add-venue.ts`);
}

main().catch(console.error);
