/**
 * Hybrid venue discovery pipeline.
 *
 * Usage:
 *   npx tsx scripts/pipeline.ts london Bar
 *   npx tsx scripts/pipeline.ts london Hotel
 *   npx tsx scripts/pipeline.ts london Restaurant
 *   npx tsx scripts/pipeline.ts london --all
 *
 * Steps:
 *   1. Google Places API — discover top venues for city + category
 *   2. Website scraping — fetch venue sites, extract NA/drink-related content
 *   3. Review mining — pull Google reviews, filter for NA/mocktail mentions
 *   4. Claude scoring — generate dry_score, descriptions, tags from all signals
 *   5. Supabase upsert — save as Draft for manual review
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   GOOGLE_PLACES_API_KEY, ANTHROPIC_API_KEY
 */

// ── Load .env ───────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

function loadEnv() {
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const envPath = resolve(__dirname, "..", ".env");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env not found — rely on existing env vars
  }
}
loadEnv();

// ── Config ──────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;

const REQUIRED = { SUPABASE_URL, SUPABASE_KEY, GOOGLE_KEY, ANTHROPIC_KEY };
for (const [name, val] of Object.entries(REQUIRED)) {
  if (!val) {
    console.error(`Missing env var: ${name}`);
    process.exit(1);
  }
}

// ── Types ───────────────────────────────────────────────────────────

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  price_level?: number;
}

interface PlaceDetails {
  name: string;
  place_id: string;
  website?: string;
  formatted_address: string;
  geometry: { location: { lat: number; lng: number } };
  reviews?: { text: string; rating: number }[];
  price_level?: number;
  opening_hours?: { weekday_text?: string[] };
}

interface VenueSignals {
  name: string;
  placeId: string;
  address: string;
  lat: number;
  lng: number;
  website: string | null;
  priceLevel: number | null;
  hoursText: string | null;
  reviews: string[];         // all reviews
  naReviews: string[];       // reviews mentioning NA drinks
  websiteNAContent: string;  // extracted NA-related content from website
}

// ── Search queries by category ──────────────────────────────────────

const SEARCH_QUERIES: Record<string, string[]> = {
  Bar: [
    "best cocktail bars {city}",
    "mocktail bars {city}",
    "alcohol free bars {city}",
    "non-alcoholic cocktail bars {city}",
    "best bars {city}",
  ],
  Restaurant: [
    "fine dining {city}",
    "best restaurants {city}",
    "luxury restaurants {city}",
    "restaurants with mocktails {city}",
    "non-alcoholic drinks restaurants {city}",
  ],
  Hotel: [
    "luxury hotels {city}",
    "best boutique hotels {city}",
    "five star hotels {city}",
    "wellness hotels {city}",
    "hotels with cocktail bars {city}",
  ],
};

// Keywords for mining reviews and websites
const NA_KEYWORDS = [
  "mocktail", "non-alcoholic", "non alcoholic", "alcohol-free", "alcohol free",
  "zero proof", "zero-proof", "af cocktail", "na cocktail", "na drinks",
  "sober", "dry january", "seedlip", "lyre", "monday gin",
  "soft cocktail", "virgin cocktail", "temperance", "spirit-free",
  "mindful drinking", "low abv", "no abv",
];

// ── Helpers ──────────────────────────────────────────────────────────

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function googleTextSearch(query: string): Promise<PlaceResult[]> {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_KEY}`;
  const data = (await fetchJson(url)) as { results: PlaceResult[] };
  return data.results ?? [];
}

async function googlePlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const fields = "name,place_id,website,formatted_address,geometry,reviews,price_level,opening_hours";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_KEY}`;
  const data = (await fetchJson(url)) as { result?: PlaceDetails };
  return data.result ?? null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractNAContent(pageText: string): string {
  const lower = pageText.toLowerCase();
  const snippets: string[] = [];

  for (const keyword of NA_KEYWORDS) {
    let idx = lower.indexOf(keyword);
    while (idx !== -1 && snippets.length < 10) {
      const start = Math.max(0, idx - 150);
      const end = Math.min(pageText.length, idx + keyword.length + 150);
      snippets.push(pageText.slice(start, end).trim());
      idx = lower.indexOf(keyword, idx + 1);
    }
  }

  return snippets.length > 0
    ? snippets.join("\n---\n").slice(0, 3000)
    : "";
}

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DryTrip/1.0; +https://drytrip.co)",
        Accept: "text/html",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return "";

    const html = await res.text();
    const text = stripHtml(html);
    return extractNAContent(text);
  } catch {
    return "";
  }
}

function filterNAReviews(reviews: { text: string; rating: number }[]): string[] {
  return reviews
    .filter((r) => {
      const lower = r.text.toLowerCase();
      return NA_KEYWORDS.some((kw) => lower.includes(kw));
    })
    .map((r) => r.text);
}

function formatPriceRange(level: number | null | undefined): string | null {
  if (level == null) return null;
  return ["$", "$$", "$$$", "$$$$"][level] ?? null;
}

function summarizeHours(hours: string[] | undefined): string | null {
  if (!hours || hours.length === 0) return null;
  // Just grab a representative sample
  const weekday = hours.find((h) => h.startsWith("Monday")) ?? hours[0];
  const weekend = hours.find((h) => h.startsWith("Saturday"));
  if (weekend && weekday) {
    return `${weekday}; ${weekend}`;
  }
  return weekday ?? null;
}

// ── Supabase ────────────────────────────────────────────────────────

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

function toSlug(name: string, city: string): string {
  return `${name}-${city}`
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function deduplicateSlug(baseSlug: string): Promise<string> {
  const data = await supabaseRequest(
    "GET",
    "venues",
    undefined,
    `select=slug&slug=like.${encodeURIComponent(baseSlug + "%")}`,
  );
  if (!data || data.length === 0) return baseSlug;
  const existing = new Set((data as { slug: string }[]).map((r) => r.slug));
  if (!existing.has(baseSlug)) return baseSlug;
  let i = 2;
  while (existing.has(`${baseSlug}-${i}`)) i++;
  return `${baseSlug}-${i}`;
}

// ── Claude scoring ──────────────────────────────────────────────────

async function scoreWithClaude(signals: VenueSignals, city: string, category: string): Promise<Record<string, unknown>> {
  const naReviewBlock = signals.naReviews.length > 0
    ? `\n\nReviews mentioning NA drinks (${signals.naReviews.length} found):\n${signals.naReviews.slice(0, 5).join("\n---\n")}`
    : "\n\nNo reviews mention non-alcoholic drinks.";

  const websiteBlock = signals.websiteNAContent
    ? `\n\nNA-related content from their website:\n${signals.websiteNAContent}`
    : "\n\nNo NA-related content found on their website.";

  const totalReviews = signals.reviews.length;
  const sampleReviews = signals.reviews.slice(0, 3).join("\n---\n");

  const prompt = `You are scoring a venue for Dry Trip, a luxury travel directory focused on the alcohol-free experience.

VENUE: ${signals.name}
CITY: ${city}
CATEGORY: ${category}
ADDRESS: ${signals.address}
WEBSITE: ${signals.website ?? "Unknown"}
TOTAL GOOGLE REVIEWS: ${totalReviews}
${naReviewBlock}

Sample general reviews:
${sampleReviews || "No reviews available."}
${websiteBlock}

Based on ALL the evidence above, return a JSON object with:

1. "dry_score" — integer 1-5:
   1 = Basic soft drinks only, NA is an afterthought
   2 = A few NA cocktails worth trying
   3 = Dedicated NA section with 5+ options, someone cares about NA guests
   4 = Excellent NA programme with craft cocktails, named NA spirits, real creativity
   5 = World-class, NA-forward with pairings or built-in programmes (these are rare — reserve for clear evidence)

   IMPORTANT: Be honest. If there's no evidence of NA drinks, score 1 or 2. Don't inflate scores. Most venues are 1-2.

2. "confidence" — "high", "medium", or "low" — how confident are you in this score?
3. "country" — country (e.g. "UK")
4. "neighborhood" — specific neighborhood (e.g. "Soho", "Shoreditch", "Mayfair")
5. "top_na_drink" — their best NA drink if you found evidence, otherwise null
6. "na_drink_count" — estimated number of distinct NA options. 0 if unknown.
7. "description" — 2-3 sentence internal analysis of their NA offerings and evidence found
8. "short_description" — compelling 1-sentence pitch (max 120 chars) for the public directory. Luxury travel magazine tone. Focus on what makes it special.
9. "vibe_tags" — array of 2-4 from: ["rooftop","date-night","cozy","upscale","casual","lively","intimate","group-friendly","late-night","brunch","garden","historic","modern","speakeasy","waterfront","business","wellness"]
10. "af_minibar" — boolean, true only if hotel with confirmed AF minibar
11. "zero_proof_pairing" — boolean, true only if they offer zero-proof food pairings
12. "ai_context" — 1-2 sentences of insider tips for our AI trip planner

Return ONLY the JSON object, no other text.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { content: { text: string }[] };
  const rawText = data.content[0]?.text || "";
  const text = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

  try {
    return JSON.parse(text);
  } catch {
    console.warn(`  ⚠ Failed to parse Claude response for ${signals.name}`);
    return {
      dry_score: 1,
      confidence: "low",
      country: "UK",
      neighborhood: "Central London",
      top_na_drink: null,
      na_drink_count: 0,
      description: "Insufficient data to score accurately.",
      short_description: `A ${city} ${category.toLowerCase()} — NA programme unverified.`,
      vibe_tags: ["upscale"],
      af_minibar: false,
      zero_proof_pairing: false,
      ai_context: null,
    };
  }
}

// ── Discovery ───────────────────────────────────────────────────────

async function discoverVenues(city: string, category: string): Promise<Map<string, PlaceResult>> {
  const queries = SEARCH_QUERIES[category];
  if (!queries) {
    console.error(`Unknown category: ${category}. Use Hotel, Restaurant, or Bar.`);
    process.exit(1);
  }

  const venues = new Map<string, PlaceResult>();

  for (const template of queries) {
    const query = template.replace("{city}", city);
    console.log(`  Searching: "${query}"`);

    const results = await googleTextSearch(query);
    for (const r of results) {
      if (!venues.has(r.place_id)) {
        venues.set(r.place_id, r);
      }
    }

    // Respect rate limits
    await new Promise((r) => setTimeout(r, 300));
  }

  return venues;
}

// ── Main pipeline ───────────────────────────────────────────────────

async function processCategory(city: string, category: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${city.toUpperCase()} — ${category.toUpperCase()}`);
  console.log(`${"=".repeat(60)}\n`);

  // Step 1: Discover venues
  console.log("Step 1: Discovering venues via Google Places...\n");
  const discovered = await discoverVenues(city, category);
  console.log(`\n  Found ${discovered.size} unique venues.\n`);

  // Step 2 & 3: Get details, scrape websites, mine reviews
  console.log("Step 2-3: Fetching details, scraping websites, mining reviews...\n");
  const allSignals: VenueSignals[] = [];

  for (const [placeId, place] of discovered) {
    console.log(`  ${place.name}`);

    // Get full details including reviews
    const details = await googlePlaceDetails(placeId);
    if (!details) {
      console.log(`    ⚠ Could not get details, skipping`);
      continue;
    }

    // Mine reviews for NA mentions
    const allReviews = details.reviews ?? [];
    const naReviews = filterNAReviews(allReviews);

    // Scrape website for NA content
    let websiteNAContent = "";
    if (details.website) {
      websiteNAContent = await scrapeWebsite(details.website);
    }

    const reviewTexts = allReviews.map((r) => r.text);

    console.log(`    Reviews: ${reviewTexts.length} total, ${naReviews.length} mention NA drinks`);
    if (websiteNAContent) {
      console.log(`    Website: found NA-related content`);
    }

    allSignals.push({
      name: details.name,
      placeId,
      address: details.formatted_address,
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng,
      website: details.website ?? null,
      priceLevel: details.price_level ?? null,
      hoursText: summarizeHours(details.opening_hours?.weekday_text),
      reviews: reviewTexts,
      naReviews,
      websiteNAContent,
    });

    await new Promise((r) => setTimeout(r, 300));
  }

  // Step 4 & 5: Score with Claude and upsert
  console.log(`\nStep 4-5: Scoring with Claude and saving to Supabase...\n`);
  let seeded = 0;
  let skipped = 0;

  for (const signals of allSignals) {
    console.log(`  Scoring: ${signals.name}`);

    try {
      const scored = await scoreWithClaude(signals, city, category);
      const confidence = scored.confidence as string;
      const dryScore = scored.dry_score as number;

      console.log(`    → Dry Score: ${dryScore}/5 (confidence: ${confidence})`);
      console.log(`    → ${(scored.short_description as string)?.slice(0, 70)}...`);

      const slug = await deduplicateSlug(toSlug(signals.name, city));

      const row = {
        name: signals.name,
        slug,
        city: city.charAt(0).toUpperCase() + city.slice(1),
        country: scored.country || "UK",
        category,
        neighborhood: scored.neighborhood,
        dry_score: dryScore,
        top_na_drink: scored.top_na_drink || null,
        na_drink_count: scored.na_drink_count || 0,
        description: scored.description,
        short_description: scored.short_description,
        website_url: signals.website,
        menu_url: null,
        booking_url: null,
        image_url: null,
        af_minibar: scored.af_minibar || false,
        zero_proof_pairing: scored.zero_proof_pairing || false,
        vibe_tags: scored.vibe_tags || [],
        price_range: formatPriceRange(signals.priceLevel),
        hours_note: signals.hoursText,
        ai_context: scored.ai_context || null,
        google_place_id: signals.placeId,
        latitude: signals.lat,
        longitude: signals.lng,
        status: "Draft",
      };

      await supabaseRequest("POST", "venues", row, "on_conflict=slug");
      console.log(`    ✓ Saved as "${slug}"`);
      seeded++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`    ✗ Error: ${msg}`);
      skipped++;
    }

    // Pause between Claude calls
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n  ${category}: ${seeded} seeded, ${skipped} skipped/errored`);
  return { seeded, skipped };
}

// ── Entry point ─────────────────────────────────────────────────────

const [, , city, categoryArg] = process.argv;

if (!city || !categoryArg) {
  console.error("Usage: npx tsx scripts/pipeline.ts <city> <category|--all>");
  console.error("  category: Hotel | Restaurant | Bar | --all");
  console.error("  example:  npx tsx scripts/pipeline.ts london Bar");
  process.exit(1);
}

async function main() {
  const categories =
    categoryArg === "--all"
      ? ["Bar", "Restaurant", "Hotel"]
      : [categoryArg];

  console.log(`\nDry Trip Pipeline`);
  console.log(`City: ${city}`);
  console.log(`Categories: ${categories.join(", ")}`);

  let totalSeeded = 0;
  let totalSkipped = 0;

  for (const cat of categories) {
    const result = await processCategory(city, cat);
    totalSeeded += result.seeded;
    totalSkipped += result.skipped;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  PIPELINE COMPLETE`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Total seeded:  ${totalSeeded}`);
  console.log(`  Total skipped: ${totalSkipped}`);
  console.log();
  console.log("Next steps:");
  console.log("  1. Review venues in Supabase dashboard or /admin/review");
  console.log("  2. Edit short_description and vibe_tags as needed");
  console.log("  3. Set status to 'Published' for approved venues");
  console.log("  4. Run 'npm run backfill:coords' if any coords are missing");
}

main().catch(console.error);
