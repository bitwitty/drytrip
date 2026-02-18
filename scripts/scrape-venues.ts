/**
 * Google Places Venue Scraper with Dry Score Analysis
 *
 * Accepts a city name and category (Hotel/Restaurant/Bar),
 * finds the top 20 venues via Google Places API, scrapes each
 * venue's menu page, and uses an LLM to assign a Dry Score (1-5)
 * based on non-alcoholic drink sophistication.
 *
 * Usage:
 *   npx tsx scripts/scrape-venues.ts --city "New York" --category Restaurant --country "USA"
 *
 * Required env vars (see .env.example):
 *   GOOGLE_PLACES_API_KEY
 *   ANTHROPIC_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL      (optional — skips DB upsert if missing)
 *   SUPABASE_SERVICE_ROLE_KEY     (optional — needed for DB upsert, bypasses RLS)
 */

import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { parseArgs } from "node:util";
import pdfParse from "pdf-parse";

// ---------------------------------------------------------------------------
// Config & types
// ---------------------------------------------------------------------------

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  website?: string;
  photo_uri?: string;
}

interface VenueResult {
  name: string;
  city: string;
  country: string;
  category: string;
  dry_score: number;
  top_na_drink: string;
  description: string;
  menu_url: string | null;
  website_url: string;
  image_url: string | null;
  af_minibar: boolean;
  zero_proof_pairing: boolean;
}

interface DryScoreAnalysis {
  dry_score: number;
  top_na_drink: string;
  reasoning: string;
  af_minibar: boolean;
  zero_proof_pairing: boolean;
  status?: string;
}

const DRINK_KEYWORDS =
  /cocktail|mocktail|beverage|drink|spirits?|seedlip|lyre|zero.?proof|non.?alcoholic|NA\b|juice|kombucha|shrub|infusion|tonic|soda|elixir|cordial|aperitif|wine|beer|menu/i;

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  /booklet/i,
  /list/i,
  /cellar/i,
  /pairing/i,
  /temperance/i,
];

// ---------------------------------------------------------------------------
// Known venues — override menu URL for sites where auto-discovery fails
// Key: domain (matched against venue website URL)
// Value: direct menu URL (can be PDF or HTML)
// ---------------------------------------------------------------------------

const KNOWN_VENUES: Record<string, string> = {
  "lyaness.com": "https://www.seacontainerslondon.com/manage/wp-content/uploads/Lyaness-menu-current.pdf",
};

const MAX_VENUES = 20;
const SCRAPE_TIMEOUT_MS = 10_000;
const API_TIMEOUT_MS = 30_000;
const CONCURRENT_LIMIT = 3;

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseCliArgs(): { city: string; category: string; country: string } {
  const { values } = parseArgs({
    options: {
      city: { type: "string", short: "c" },
      category: { type: "string", short: "t" },
      country: { type: "string", short: "n" },
    },
    strict: true,
  });

  if (!values.city || !values.category) {
    console.error(
      "Usage: npx tsx scripts/scrape-venues.ts --city <city> --category <Hotel|Restaurant|Bar> [--country <country>]"
    );
    process.exit(1);
  }

  const categoryKey = values.category.toLowerCase();
  if (!CATEGORY_KEYWORDS[categoryKey]) {
    console.error(
      `Invalid category "${values.category}". Must be one of: Hotel, Restaurant, Bar`
    );
    process.exit(1);
  }

  // Capitalize for Supabase check constraint (Hotel, Restaurant, Bar)
  const category = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);

  return { city: values.city, category, country: values.country ?? "" };
}

// ---------------------------------------------------------------------------
// Google Places API
// ---------------------------------------------------------------------------

async function searchPlaces(
  city: string,
  category: string
): Promise<PlaceResult[]> {
  const baseQuery = CATEGORY_KEYWORDS[category.toLowerCase()];
  const qualityKeywords =
    category.toLowerCase() === "restaurant" || category.toLowerCase() === "hotel"
      ? " Michelin star fine dining zero proof"
      : "";
  const query = `${baseQuery}${qualityKeywords} in ${city}`;
  console.log(`[places] Searching: "${query}"`);

  let data: any;
  try {
    const response = await axios.post(
      PLACES_TEXT_SEARCH_URL,
      {
        textQuery: query,
        maxResultCount: MAX_VENUES,
      },
      {
        timeout: API_TIMEOUT_MS,
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY!,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.rating,places.websiteUri,places.photos",
        },
      }
    );
    data = response.data;
  } catch (err: unknown) {
    const axErr = err as any;
    if (axErr.response) {
      console.error(`[places] API error ${axErr.response.status}: ${JSON.stringify(axErr.response.data)}`);
      console.error(`[places] Make sure the "Places API (New)" is enabled in your Google Cloud Console.`);
    } else if (axErr.code === "ECONNABORTED") {
      console.error(`[places] Request timed out after ${API_TIMEOUT_MS / 1000}s`);
    } else {
      console.error(`[places] Network error: ${axErr.code ?? axErr.message}`);
    }
    throw err;
  }

  const allResults: PlaceResult[] = [];
  for (const r of data.places ?? []) {
    // Build a photo URL from the first photo reference if available
    const photoRef = r.photos?.[0]?.name;
    const photoUri = photoRef
      ? `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=800&key=${GOOGLE_PLACES_API_KEY}`
      : undefined;

    allResults.push({
      place_id: r.id,
      name: r.displayName?.text ?? r.id,
      formatted_address: r.formattedAddress,
      rating: r.rating,
      website: r.websiteUri,
      photo_uri: photoUri,
    });
  }

  console.log(`[places] Found ${allResults.length} venues`);
  return allResults;
}

async function getPlaceWebsite(placeId: string): Promise<string | null> {
  try {
    const { data } = await axios.get(`${PLACES_DETAILS_URL}/${placeId}`, {
      timeout: API_TIMEOUT_MS,
      headers: {
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY!,
        "X-Goog-FieldMask": "websiteUri",
      },
    });
    return data.websiteUri ?? null;
  } catch (err: unknown) {
    const axErr = err as any;
    console.log(`  [details] Failed to get website for ${placeId}: ${axErr.response?.status ?? axErr.code ?? axErr.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Browser-like headers to avoid 403s from CDN/WAF protections
// ---------------------------------------------------------------------------

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
};

// ---------------------------------------------------------------------------
// Menu page discovery & scraping
// ---------------------------------------------------------------------------

/**
 * Given a venue's homepage URL, attempt to find a menu/drinks page
 * by crawling the homepage for links matching known menu patterns.
 * Falls back to the homepage itself if no menu link is found.
 */
async function findMenuUrl(websiteUrl: string, logPrefix: string): Promise<{ url: string; subPageText: string | null }> {
  try {
    const { data: html } = await axios.get(websiteUrl, {
      timeout: SCRAPE_TIMEOUT_MS,
      headers: BROWSER_HEADERS,
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

      // Follow PDF links — they often contain the actual drinks menu
      if (/\.pdf(\?|$)/i.test(fullUrl)) {
        const matchesPath = MENU_PATH_PATTERNS.some((p) => p.test(fullUrl));
        const matchesText = /menu|drinks|cocktail|beverage|zero.?proof|mocktail/i.test(link.text);
        if (matchesPath || matchesText) {
          console.log(`${logPrefix}[menu] Found PDF menu link: ${fullUrl}`);
          return { url: fullUrl, subPageText: null };
        }
        continue;
      }

      const matchesPath = MENU_PATH_PATTERNS.some((p) => p.test(fullUrl));
      const matchesText = /menu|drinks|cocktail|beverage|zero.?proof|mocktail/i.test(
        link.text
      );

      if (matchesPath || matchesText) {
        console.log(`${logPrefix}[menu] Found menu link: ${fullUrl}`);

        // If link text contains 'Menu' or 'Drinks', fetch the sub-page eagerly
        if (/menu|drinks/i.test(link.text)) {
          console.log(`${logPrefix}[menu] Fetching sub-page for deeper content...`);
          const subText = await scrapePageText(fullUrl, logPrefix);
          return { url: fullUrl, subPageText: subText };
        }

        return { url: fullUrl, subPageText: null };
      }
    }
  } catch {
    // If homepage fetch fails, we'll just use the homepage URL
  }

  return { url: websiteUrl, subPageText: null };
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
 * Extract text from a PDF URL using pdf-parse.
 */
async function scrapePdfText(url: string, logPrefix: string): Promise<string | null> {
  try {
    console.log(`${logPrefix}[pdf] Downloading PDF: ${url}`);
    const { data } = await axios.get(url, {
      timeout: SCRAPE_TIMEOUT_MS * 2,
      headers: BROWSER_HEADERS,
      maxRedirects: 5,
      responseType: "arraybuffer",
    });
    const pdf = await pdfParse(Buffer.from(data));
    const text = pdf.text.replace(/\s+/g, " ").trim();
    console.log(`${logPrefix}[pdf] Extracted ${text.length} chars from PDF`);
    return text.slice(0, 12_000) || null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`${logPrefix}[pdf] Failed to parse PDF ${url}: ${message}`);
    return null;
  }
}

/**
 * Scrape the text content from a URL, stripping HTML.
 * Handles both HTML pages and PDF files.
 */
async function scrapePageText(url: string, logPrefix: string): Promise<string | null> {
  // Route PDF URLs to the PDF extractor
  if (/\.pdf(\?|$)/i.test(url)) {
    return scrapePdfText(url, logPrefix);
  }

  try {
    const { data: html, headers } = await axios.get(url, {
      timeout: SCRAPE_TIMEOUT_MS,
      headers: BROWSER_HEADERS,
      maxRedirects: 5,
      responseType: "arraybuffer",
    });

    // Detect binary/PDF content that slipped through
    const contentType = headers["content-type"] ?? "";
    if (
      contentType.includes("application/pdf") ||
      contentType.includes("application/octet-stream")
    ) {
      console.log(`${logPrefix}[scrape] Detected PDF content-type, routing to PDF parser`);
      const pdf = await pdfParse(Buffer.from(html));
      const text = pdf.text.replace(/\s+/g, " ").trim();
      return text.slice(0, 12_000) || null;
    }

    const htmlStr = Buffer.from(html).toString("utf-8");
    const $ = cheerio.load(htmlStr);

    // Remove scripts, styles, nav, footer to reduce noise
    $("script, style, nav, footer, header, noscript, iframe").remove();

    const text = $("body").text().replace(/\s+/g, " ").trim();

    // Truncate to ~12k chars to stay within LLM context limits
    return text.slice(0, 12_000) || null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`${logPrefix}[scrape] Failed to fetch ${url}: ${message}`);
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

IMPORTANT: "House-made infusions" and "Shrubs" (drinking vinegar preparations) count as sophisticated descriptions for the last criterion. Venues that make their own infusions, shrubs, or cordials are demonstrating real NA craft — do not penalize them.

If the page content has no discernible drink/menu information, respond with:
{"status": "INSUFFICIENT_DATA"}
Do NOT assign a low score when data is simply missing — only score what you can actually evaluate.

Also determine:
• af_minibar: Does the venue mention an alcohol-free minibar or in-room NA beverage selection? (true/false)
• zero_proof_pairing: Does the venue offer non-alcoholic drink pairings with food/tasting menus? (true/false)

Respond with ONLY valid JSON in this exact format:
{
  "dry_score": <number 0-5>,
  "top_na_drink": "<name of the single best/most interesting NA drink, or 'N/A' if none found>",
  "reasoning": "<brief 1-2 sentence explanation>",
  "af_minibar": <true or false>,
  "zero_proof_pairing": <true or false>
}

--- PAGE TEXT ---
${menuText}`;
}

async function analyzeDryScore(
  anthropic: Anthropic,
  menuText: string,
  venueName: string
): Promise<DryScoreAnalysis> {
  // Guardrail: if text is too thin or lacks drink keywords, skip the LLM entirely
  if (menuText.length < 500 || !DRINK_KEYWORDS.test(menuText)) {
    console.log(`  [llm] INSUFFICIENT_DATA — text too short (${menuText.length} chars) or no drink keywords found`);
    return {
      dry_score: 0,
      top_na_drink: "N/A",
      reasoning: "INSUFFICIENT_DATA",
      af_minibar: false,
      zero_proof_pairing: false,
      status: "INSUFFICIENT_DATA",
    };
  }

  const prompt = buildAnalysisPrompt(menuText, venueName);

  // Retry with exponential backoff on rate limit (429) errors
  let response: Anthropic.Message | undefined;
  const MAX_RETRIES = 5;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      response = await anthropic.messages.create(
        {
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }],
        },
        { timeout: API_TIMEOUT_MS },
      );
      break;
    } catch (err: unknown) {
      const apiErr = err as any;
      const isRateLimit =
        apiErr?.status === 429 ||
        apiErr?.error?.type === "rate_limit_error" ||
        apiErr?.message?.includes("rate_limit");
      if (isRateLimit && attempt < MAX_RETRIES) {
        const backoffMs = Math.min(2000 * Math.pow(2, attempt), 60_000);
        console.log(`  [llm] Rate limited (attempt ${attempt + 1}/${MAX_RETRIES + 1}), waiting ${backoffMs / 1000}s...`);
        await sleep(backoffMs);
        continue;
      }
      throw err;
    }
  }

  if (!response) {
    return { dry_score: 0, top_na_drink: "N/A", reasoning: "LLM request failed after retries", af_minibar: false, zero_proof_pairing: false };
  }

  const content =
    response.content[0]?.type === "text" ? response.content[0].text : null;
  if (!content) {
    return { dry_score: 0, top_na_drink: "N/A", reasoning: "No LLM response", af_minibar: false, zero_proof_pairing: false };
  }

  try {
    // Extract JSON from the response (Claude may wrap it in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]) as DryScoreAnalysis;

    // Handle LLM returning INSUFFICIENT_DATA
    if (parsed.status === "INSUFFICIENT_DATA") {
      console.log(`  [llm] LLM returned INSUFFICIENT_DATA for ${venueName}`);
      return {
        dry_score: 0,
        top_na_drink: "N/A",
        reasoning: "INSUFFICIENT_DATA",
        af_minibar: false,
        zero_proof_pairing: false,
        status: "INSUFFICIENT_DATA",
      };
    }

    return {
      dry_score: Math.max(0, Math.min(5, Math.round(parsed.dry_score))),
      top_na_drink: parsed.top_na_drink || "N/A",
      reasoning: parsed.reasoning || "",
      af_minibar: parsed.af_minibar === true,
      zero_proof_pairing: parsed.zero_proof_pairing === true,
    };
  } catch {
    console.log(`  [llm] Failed to parse response: ${content.slice(0, 200)}`);
    return { dry_score: 0, top_na_drink: "N/A", reasoning: "Parse error", af_minibar: false, zero_proof_pairing: false };
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
  country: string,
  category: string,
  index: number
): Promise<VenueResult | null> {
  const prefix = `  [${index + 1}/${MAX_VENUES}] ${place.name} | `;
  console.log(`\n[${index + 1}] ${place.name}`);

  // 1. Get website from Place Details
  let websiteUrl = place.website ?? null;
  if (!websiteUrl) {
    websiteUrl = await getPlaceWebsite(place.place_id);
  }

  if (!websiteUrl) {
    console.log(`${prefix}[skip] No website found`);
    return null;
  }
  console.log(`${prefix}[web] ${websiteUrl}`);

  // 2. Check known venues override before crawling
  let knownMenuUrl: string | null = null;
  try {
    const domain = new URL(websiteUrl).hostname.replace(/^www\./, "");
    if (KNOWN_VENUES[domain]) {
      knownMenuUrl = KNOWN_VENUES[domain];
      console.log(`${prefix}[known] Override menu URL: ${knownMenuUrl}`);
    }
  } catch { /* invalid URL, continue normally */ }

  // 3. Find menu page (skip crawl if we have a known override)
  const { url: menuUrl, subPageText } = knownMenuUrl
    ? { url: knownMenuUrl, subPageText: null }
    : await findMenuUrl(websiteUrl, prefix);
  const foundMenuPage = menuUrl !== websiteUrl;

  // 3. Scrape menu page text (use pre-fetched sub-page text if available)
  let pageText = subPageText;
  if (!pageText) {
    console.log(`${prefix}[menu] Scraping: ${menuUrl}`);
    pageText = await scrapePageText(menuUrl, prefix);
  }
  if (!pageText || pageText.length < 50) {
    console.log(`${prefix}[skip] Insufficient page content (${pageText?.length ?? 0} chars)`);
    return {
      name: place.name,
      city,
      country,
      category,
      dry_score: 0,
      top_na_drink: "N/A",
      description: "No menu content found",
      menu_url: foundMenuPage ? menuUrl : null,
      website_url: websiteUrl,
      image_url: place.photo_uri ?? null,
      af_minibar: false,
      zero_proof_pairing: false,
    };
  }
  console.log(`${prefix}[scrape] Got ${pageText.length} chars of text`);

  // 4. LLM analysis
  console.log(`${prefix}[debug] URL sent to LLM: ${menuUrl}`);
  const analysis = await analyzeDryScore(anthropic, pageText, place.name);
  console.log(
    `${prefix}[score] Dry Score: ${analysis.dry_score}/5 — Top drink: ${analysis.top_na_drink}`
  );
  if (analysis.reasoning) {
    console.log(`${prefix}[reason] ${analysis.reasoning}`);
  }

  return {
    name: place.name,
    city,
    country,
    category,
    dry_score: analysis.dry_score,
    top_na_drink: analysis.top_na_drink,
    description: analysis.reasoning,
    menu_url: foundMenuPage ? menuUrl : null,
    website_url: websiteUrl,
    image_url: place.photo_uri ?? null,
    af_minibar: analysis.af_minibar,
    zero_proof_pairing: analysis.zero_proof_pairing,
  };
}

async function upsertToSupabase(venues: VenueResult[]): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log("\n[supabase] Skipping — SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log(`\n[supabase] Upserting ${venues.length} venues...`);

  const { data, error } = await supabase
    .from("venues")
    .upsert(venues, { onConflict: "name,city" })
    .select();

  if (error) {
    console.error("[supabase] Upsert failed:", error.message);
    console.error("[supabase] Details:", JSON.stringify(error, null, 2));
  } else {
    console.log(`[supabase] Successfully upserted ${data?.length ?? 0} venues`);
  }
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

  const { city, category, country } = parseCliArgs();
  console.log(`\nDry Trip Venue Scraper`);
  console.log(`   City: ${city}`);
  console.log(`   Category: ${category}`);
  if (country) console.log(`   Country: ${country}`);
  console.log(`   Google API key: ${GOOGLE_PLACES_API_KEY!.slice(0, 10)}...`);
  console.log();

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  // Step 1: Search for venues
  console.log("[places] Calling Google Places API...");
  const places = await searchPlaces(city, category);
  if (places.length === 0) {
    console.log("No venues found. Check that the 'Places API (New)' is enabled in your Google Cloud Console,");
    console.log("and that billing is active on the project. Also try a different city or category.");
    process.exit(0);
  }

  // Step 2: Process each venue (with concurrency limit)
  const results = await mapWithConcurrency(
    places,
    CONCURRENT_LIMIT,
    (place, i) => processVenue(anthropic, place, city, country, category, i)
  );

  // Step 3: Filter nulls and build output
  const venues: VenueResult[] = results.filter(
    (r): r is VenueResult => r !== null
  );

  // Sort by dry_score descending
  venues.sort((a, b) => b.dry_score - a.dry_score);

  // Step 4: Output JSON
  console.log("\n" + "=".repeat(60));
  console.log("RESULTS");
  console.log("=".repeat(60) + "\n");
  console.log(JSON.stringify(venues, null, 2));

  // Write to local file
  const outPath = `scripts/output/${city.toLowerCase().replace(/\s+/g, "-")}-${category}.json`;
  const fs = await import("node:fs");
  const path = await import("node:path");
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  fs.writeFileSync(outPath, JSON.stringify(venues, null, 2));
  console.log(`\nResults written to ${outPath}`);

  // Step 5: Upsert to Supabase
  await upsertToSupabase(venues);

  // Summary
  const scored = venues.filter((v) => v.dry_score > 0);
  console.log(`\nSummary: ${venues.length} venues processed, ${scored.length} with Dry Score > 0`);
  if (scored.length > 0) {
    const avg = scored.reduce((s, v) => s + v.dry_score, 0) / scored.length;
    console.log(`Average Dry Score (scored venues): ${avg.toFixed(1)}/5`);
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err.message ?? err);
  if (err.code) console.error("Error code:", err.code);
  if (err.response?.status) console.error("HTTP status:", err.response.status);
  if (err.response?.data) console.error("Response:", JSON.stringify(err.response.data, null, 2));
  process.exit(1);
});
