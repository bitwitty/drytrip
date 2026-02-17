/**
 * Google Places Venue Scraper with Dry Score Analysis
 *
 * Accepts a city name and category (Hotel/Restaurant/Bar),
 * finds the top 20 venues via Google Places API, scrapes each
 * venue's menu page, and uses an LLM to assign a Dry Score (1-5)
 * based on non-alcoholic drink sophistication.
 *
 * Usage:
 *   npx tsx scripts/scrape-venues.ts --city "New York" --category Restaurant
 *
 * Required env vars (see .env.example):
 *   GOOGLE_PLACES_API_KEY
 *   ANTHROPIC_API_KEY
 */

import axios from "axios";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";
import { parseArgs } from "node:util";

// ---------------------------------------------------------------------------
// Config & types
// ---------------------------------------------------------------------------

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  website?: string;
}

interface VenueResult {
  venue_name: string;
  city: string;
  dry_score: number;
  top_na_drink: string;
  website_url: string;
}

interface DryScoreAnalysis {
  dry_score: number;
  top_na_drink: string;
  reasoning: string;
}

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const PLACES_TEXT_SEARCH_URL =
  "https://places.googleapis.com/v1/places:searchText";
const PLACES_DETAILS_URL =
  "https://places.googleapis.com/v1/places";

const CATEGORY_KEYWORDS: Record<string, string> = {
  hotel: "best hotels",
  restaurant: "best restaurants",
  bar: "best bars",
};

const MENU_PATH_PATTERNS = [
  /menu/i,
  /drinks/i,
  /cocktails/i,
  /beverage/i,
  /food-and-drink/i,
  /food-drink/i,
  /dining/i,
];

const MAX_VENUES = 20;
const SCRAPE_TIMEOUT_MS = 10_000;
const CONCURRENT_LIMIT = 5;

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseCliArgs(): { city: string; category: string } {
  const { values } = parseArgs({
    options: {
      city: { type: "string", short: "c" },
      category: { type: "string", short: "t" },
    },
    strict: true,
  });

  if (!values.city || !values.category) {
    console.error(
      "Usage: npx tsx scripts/scrape-venues.ts --city <city> --category <Hotel|Restaurant|Bar>"
    );
    process.exit(1);
  }

  const category = values.category.toLowerCase();
  if (!CATEGORY_KEYWORDS[category]) {
    console.error(
      `Invalid category "${values.category}". Must be one of: Hotel, Restaurant, Bar`
    );
    process.exit(1);
  }

  return { city: values.city, category };
}

// ---------------------------------------------------------------------------
// Google Places API
// ---------------------------------------------------------------------------

async function searchPlaces(
  city: string,
  category: string
): Promise<PlaceResult[]> {
  const query = `${CATEGORY_KEYWORDS[category]} in ${city}`;
  console.log(`[places] Searching: "${query}"`);

  const { data } = await axios.post(
    PLACES_TEXT_SEARCH_URL,
    {
      textQuery: query,
      maxResultCount: MAX_VENUES,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY!,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.websiteUri",
      },
    }
  );

  const allResults: PlaceResult[] = [];
  for (const r of data.places ?? []) {
    allResults.push({
      place_id: r.id,
      name: r.displayName?.text ?? r.id,
      formatted_address: r.formattedAddress,
      rating: r.rating,
      website: r.websiteUri,
    });
  }

  console.log(`[places] Found ${allResults.length} venues`);
  return allResults;
}

async function getPlaceWebsite(placeId: string): Promise<string | null> {
  const { data } = await axios.get(`${PLACES_DETAILS_URL}/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY!,
      "X-Goog-FieldMask": "websiteUri",
    },
  });

  return data.websiteUri ?? null;
}

// ---------------------------------------------------------------------------
// Menu page discovery & scraping
// ---------------------------------------------------------------------------

/**
 * Given a venue's homepage URL, attempt to find a menu/drinks page
 * by crawling the homepage for links matching known menu patterns.
 * Falls back to the homepage itself if no menu link is found.
 */
async function findMenuUrl(websiteUrl: string): Promise<string> {
  try {
    const { data: html } = await axios.get(websiteUrl, {
      timeout: SCRAPE_TIMEOUT_MS,
      headers: { "User-Agent": "DryTripBot/1.0 (menu-analysis)" },
      maxRedirects: 5,
    });

    const $ = cheerio.load(html);
    const base = new URL(websiteUrl);

    // Collect all anchor hrefs
    const links: { href: string; text: string }[] = [];
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim();
      if (href) links.push({ href, text });
    });

    // Score each link by how likely it points to a menu page
    for (const link of links) {
      const fullUrl = resolveUrl(link.href, base);
      if (!fullUrl) continue;

      const matchesPath = MENU_PATH_PATTERNS.some((p) => p.test(fullUrl));
      const matchesText = /menu|drinks|cocktail|beverage|zero.?proof|mocktail/i.test(
        link.text
      );

      if (matchesPath || matchesText) {
        console.log(`  [menu] Found menu link: ${fullUrl}`);
        return fullUrl;
      }
    }
  } catch {
    // If homepage fetch fails, we'll just use the homepage URL
  }

  return websiteUrl;
}

function resolveUrl(href: string, base: URL): string | null {
  try {
    const url = new URL(href, base);
    // Only follow http/https links on the same domain or subdomains
    if (!url.protocol.startsWith("http")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Scrape the text content from a URL, stripping HTML.
 */
async function scrapePageText(url: string): Promise<string | null> {
  try {
    const { data: html } = await axios.get(url, {
      timeout: SCRAPE_TIMEOUT_MS,
      headers: { "User-Agent": "DryTripBot/1.0 (menu-analysis)" },
      maxRedirects: 5,
      responseType: "text",
    });

    const $ = cheerio.load(html);

    // Remove scripts, styles, nav, footer to reduce noise
    $("script, style, nav, footer, header, noscript, iframe").remove();

    const text = $("body").text().replace(/\s+/g, " ").trim();

    // Truncate to ~12k chars to stay within LLM context limits
    return text.slice(0, 12_000) || null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  [scrape] Failed to fetch ${url}: ${message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// LLM analysis
// ---------------------------------------------------------------------------

function buildAnalysisPrompt(menuText: string, venueName: string): string {
  return `You are a beverage analyst specializing in non-alcoholic drink programs.

Analyze the following menu/page text from "${venueName}" for non-alcoholic sophistication.

Assign a Dry Score (1-5) based on these criteria — award +1 for each that applies:
• Presence of NA Spirits (Seedlip, Lyre's, Monday, Ritual Zero Proof, etc.) [+1]
• Dedicated "Zero Proof" or "Non-Alcoholic" section [+1]
• Use of adaptogens or functional ingredients (ashwagandha, reishi, CBD, lion's mane, etc.) [+1]
• More than 5 unique mocktails or NA cocktails [+1]
• Sophisticated descriptions (not just "juice mix" or "virgin mojito") [+1]

If the page content has no discernible drink/menu information, assign a score of 0.

Respond with ONLY valid JSON in this exact format:
{
  "dry_score": <number 0-5>,
  "top_na_drink": "<name of the single best/most interesting NA drink, or 'N/A' if none found>",
  "reasoning": "<brief 1-2 sentence explanation>"
}

--- PAGE TEXT ---
${menuText}`;
}

async function analyzeDryScore(
  anthropic: Anthropic,
  menuText: string,
  venueName: string
): Promise<DryScoreAnalysis> {
  const prompt = buildAnalysisPrompt(menuText, venueName);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const content =
    response.content[0]?.type === "text" ? response.content[0].text : null;
  if (!content) {
    return { dry_score: 0, top_na_drink: "N/A", reasoning: "No LLM response" };
  }

  try {
    // Extract JSON from the response (Claude may wrap it in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]) as DryScoreAnalysis;
    return {
      dry_score: Math.max(0, Math.min(5, Math.round(parsed.dry_score))),
      top_na_drink: parsed.top_na_drink || "N/A",
      reasoning: parsed.reasoning || "",
    };
  } catch {
    console.log(`  [llm] Failed to parse response: ${content.slice(0, 200)}`);
    return { dry_score: 0, top_na_drink: "N/A", reasoning: "Parse error" };
  }
}

// ---------------------------------------------------------------------------
// Concurrency helpers
// ---------------------------------------------------------------------------

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Process items with a concurrency limit.
 */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker()
  );
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

async function processVenue(
  anthropic: Anthropic,
  place: PlaceResult,
  city: string,
  index: number
): Promise<VenueResult | null> {
  const label = `[${index + 1}] ${place.name}`;
  console.log(`\n${label}`);

  // 1. Get website from Place Details
  let websiteUrl = place.website ?? null;
  if (!websiteUrl) {
    websiteUrl = await getPlaceWebsite(place.place_id);
  }

  if (!websiteUrl) {
    console.log(`  [skip] No website found`);
    return null;
  }
  console.log(`  [web] ${websiteUrl}`);

  // 2. Find menu page
  const menuUrl = await findMenuUrl(websiteUrl);
  console.log(`  [menu] Scraping: ${menuUrl}`);

  // 3. Scrape menu page text
  const pageText = await scrapePageText(menuUrl);
  if (!pageText || pageText.length < 50) {
    console.log(`  [skip] Insufficient page content (${pageText?.length ?? 0} chars)`);
    return {
      venue_name: place.name,
      city,
      dry_score: 0,
      top_na_drink: "N/A",
      website_url: websiteUrl,
    };
  }
  console.log(`  [scrape] Got ${pageText.length} chars of text`);

  // 4. LLM analysis
  const analysis = await analyzeDryScore(anthropic, pageText, place.name);
  console.log(
    `  [score] Dry Score: ${analysis.dry_score}/5 — Top drink: ${analysis.top_na_drink}`
  );
  if (analysis.reasoning) {
    console.log(`  [reason] ${analysis.reasoning}`);
  }

  return {
    venue_name: place.name,
    city,
    dry_score: analysis.dry_score,
    top_na_drink: analysis.top_na_drink,
    website_url: websiteUrl,
  };
}

async function main() {
  // Validate env
  if (!GOOGLE_PLACES_API_KEY) {
    console.error("Missing GOOGLE_PLACES_API_KEY environment variable");
    process.exit(1);
  }
  if (!ANTHROPIC_API_KEY) {
    console.error("Missing ANTHROPIC_API_KEY environment variable");
    process.exit(1);
  }

  const { city, category } = parseCliArgs();
  console.log(`\n🔍 Dry Trip Venue Scraper`);
  console.log(`   City: ${city}`);
  console.log(`   Category: ${category}\n`);

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  // Step 1: Search for venues
  const places = await searchPlaces(city, category);
  if (places.length === 0) {
    console.log("No venues found. Try a different city or category.");
    process.exit(0);
  }

  // Step 2: Process each venue (with concurrency limit)
  const results = await mapWithConcurrency(
    places,
    CONCURRENT_LIMIT,
    (place, i) => processVenue(anthropic, place, city, i)
  );

  // Step 3: Filter nulls and build output
  const venues: VenueResult[] = results.filter(
    (r): r is VenueResult => r !== null
  );

  // Sort by dry_score descending
  venues.sort((a, b) => b.dry_score - a.dry_score);

  // Step 4: Output JSON (Supabase-ready)
  console.log("\n" + "=".repeat(60));
  console.log("RESULTS — Supabase-ready JSON");
  console.log("=".repeat(60) + "\n");
  console.log(JSON.stringify(venues, null, 2));

  // Also write to file
  const outPath = `scripts/output/${city.toLowerCase().replace(/\s+/g, "-")}-${category}.json`;
  const fs = await import("node:fs");
  const path = await import("node:path");
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(outPath, JSON.stringify(venues, null, 2));
  console.log(`\nResults written to ${outPath}`);

  // Summary
  const scored = venues.filter((v) => v.dry_score > 0);
  console.log(`\nSummary: ${venues.length} venues processed, ${scored.length} with Dry Score > 0`);
  if (scored.length > 0) {
    const avg = scored.reduce((s, v) => s + v.dry_score, 0) / scored.length;
    console.log(`Average Dry Score (scored venues): ${avg.toFixed(1)}/5`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
