/**
 * Pipeline Enrichment Pass: Curated List Cross-Reference + Deep Research
 *
 * Usage:
 *   npm run enrich                 # enrich all Draft venues
 *   npm run enrich -- --published  # include Published venues too
 *
 * Steps:
 *   1. Scrape curated "best NA" lists (hardcoded URLs)
 *   2. Build "list mentions" map — count how many lists each venue appears on
 *   3. Fuzzy-match extracted names against Supabase venues
 *   4. Deep research matched venues (menu pages, Reddit, review sites)
 *   5. Re-score with Claude Sonnet — scores only go UP, never down
 *   6. Add missing venues (on lists but not in DB) as Draft
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
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
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;

const REQUIRED = { SUPABASE_URL, SUPABASE_KEY, ANTHROPIC_KEY };
for (const [name, val] of Object.entries(REQUIRED)) {
  if (!val) {
    console.error(`Missing env var: ${name}`);
    process.exit(1);
  }
}

const INCLUDE_PUBLISHED = process.argv.includes("--published");

// ── Curated list URLs ───────────────────────────────────────────────

const CURATED_LIST_URLS: { name: string; url: string }[] = [
  { name: "Time Out", url: "https://www.timeout.com/london/bars-and-pubs/places-in-london-to-drink-when-youre-not-drinking" },
  { name: "DesignMyNight", url: "https://www.designmynight.com/london/bars/alcohol-free-bars-in-london" },
  { name: "Luxury London", url: "https://luxurylondon.co.uk/taste/drink/best-london-bars-alcohol-free-drinking/" },
  { name: "Squaremeal", url: "https://www.squaremeal.co.uk/restaurants/best-for/best-bars-for-non-alcoholic-cocktails-mocktails-london_10129" },
  { name: "Country & Town House", url: "https://www.countryandtownhouse.com/food-and-drink/best-bars-london-dry-january/" },
  { name: "Secret London", url: "https://secretldn.com/sober-bars-in-london/" },
  { name: "London Drinks Guide", url: "https://londondrinksguide.com/en/blog/where-to-drink-93/in-and-around-london-99/where-to-drink-non-alcoholic-cocktails-in-london-297.htm" },
  { name: "Wander Sober", url: "https://wandersober.co.uk/alcohol-free-bars-in-london/" },
  { name: "Thats Up", url: "https://thatsup.co.uk/london/guide/the-best-mocktails-in-london/" },
  { name: "Dry Drinker", url: "https://drydrinker.com/blogs/blog/alcohol-free-bars" },
  { name: "Suitcase", url: "https://suitcasemag.com/non-alcoholic-bars-london/" },
  { name: "Tempus", url: "https://tempusmagazine.co.uk/news/dry-january-2026-6-bars-london-no-low-alcohol-drinks/" },
];

// Menu subpage patterns to try
const MENU_PATHS = ["/menu", "/drinks", "/cocktails", "/food-drink", "/bar", "/drink-menu"];

// NA keywords for content extraction
const NA_KEYWORDS = [
  "mocktail", "non-alcoholic", "non alcoholic", "alcohol-free", "alcohol free",
  "zero proof", "zero-proof", "af cocktail", "na cocktail", "na drinks",
  "sober", "seedlip", "lyre", "monday gin", "spirit-free",
  "mindful drinking", "low abv", "no abv", "virgin cocktail",
];

// ── Types ───────────────────────────────────────────────────────────

interface DBVenue {
  id: number;
  name: string;
  slug: string;
  city: string;
  category: string;
  dry_score: number;
  top_na_drink: string | null;
  na_drink_count: number | null;
  description: string | null;
  short_description: string | null;
  website_url: string | null;
  status: string;
}

interface EnrichmentEvidence {
  listMentionCount: number;
  listNames: string[];
  menuContent: string;
  redditSnippets: string;
  reviewSnippets: string;
}

// ── Helpers ─────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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

async function fetchPage(url: string, timeoutMs = 10000): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) return "";

    const html = await res.text();
    return stripHtml(html);
  } catch {
    return "";
  }
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
  if (method === "PATCH") {
    headers.Prefer = "return=minimal";
  }
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

// ── Claude API calls ────────────────────────────────────────────────

async function claudeHaiku(prompt: string, maxTokens = 2000): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude Haiku API error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { content: { text: string }[] };
  return data.content[0]?.text || "";
}

async function claudeSonnet(prompt: string, maxTokens = 1000): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude Sonnet API error: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { content: { text: string }[] };
  return data.content[0]?.text || "";
}

function parseJSON(raw: string): unknown {
  const cleaned = raw.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
  return JSON.parse(cleaned);
}

// ── Step 1: Scrape curated lists ────────────────────────────────────

async function scrapeAndExtractNames(listUrl: string, listName: string): Promise<string[]> {
  console.log(`  Fetching: ${listName} (${listUrl})`);

  const pageText = await fetchPage(listUrl, 15000);
  if (!pageText) {
    console.log(`    ⚠ Could not fetch page`);
    return [];
  }

  // Truncate to first ~8000 chars to keep Haiku prompt reasonable
  const truncated = pageText.slice(0, 8000);

  const prompt = `Extract all venue/bar/restaurant/hotel names from this article about non-alcoholic drinks and bars in London.

Return ONLY a JSON array of venue name strings. For example: ["Lyaness", "Swift", "Cub"]

If there are no venue names, return an empty array: []

Article text:
${truncated}`;

  try {
    const raw = await claudeHaiku(prompt);
    const names = parseJSON(raw) as string[];
    if (!Array.isArray(names)) return [];
    console.log(`    Found ${names.length} venue names`);
    return names.filter((n) => typeof n === "string" && n.length > 1);
  } catch (e) {
    console.log(`    ⚠ Failed to extract names: ${e instanceof Error ? e.message : e}`);
    return [];
  }
}

// ── Step 2: Build list mentions map ─────────────────────────────────

function buildMentionsMap(listResults: { listName: string; names: string[] }[]): Map<string, string[]> {
  // Map from normalized venue name → list names it appeared on
  const mentions = new Map<string, { original: string; lists: string[] }>();

  for (const { listName, names } of listResults) {
    for (const name of names) {
      const normalized = name.toLowerCase().trim();
      const existing = mentions.get(normalized);
      if (existing) {
        existing.lists.push(listName);
      } else {
        mentions.set(normalized, { original: name, lists: [listName] });
      }
    }
  }

  // Convert to simpler map: original name → list names
  const result = new Map<string, string[]>();
  for (const { original, lists } of mentions.values()) {
    result.set(original, lists);
  }
  return result;
}

// ── Step 3: Fuzzy match against DB ──────────────────────────────────

interface MatchResult {
  listName: string;
  dbName: string;
  dbId: number;
}

async function fuzzyMatchVenues(
  listNames: string[],
  dbVenues: DBVenue[],
): Promise<{ matched: MatchResult[]; unmatched: string[] }> {
  const dbNameList = dbVenues.map((v) => `${v.id}: ${v.name}`).join("\n");
  const listNameList = listNames.join("\n");

  const prompt = `You are matching venue names from curated London NA bar/restaurant lists against our database of venues.

DATABASE VENUES (id: name):
${dbNameList}

VENUES FROM CURATED LISTS:
${listNameList}

Match each list venue to the most likely database venue. Handle variations like:
- "Lyaness" → "Lyaness at Sea Containers"
- "The Savoy" → "Savoy Hotel"
- "Claridge's Bar" → "Claridge's"
- Slight spelling differences

Return a JSON object with two fields:
1. "matched" — array of objects: { "listName": "...", "dbName": "...", "dbId": <number> }
2. "unmatched" — array of list venue name strings that have NO match in the database

Be conservative: only match if you're fairly confident it's the same venue. Return ONLY the JSON.`;

  try {
    const raw = await claudeHaiku(prompt, 4000);
    const result = parseJSON(raw) as { matched: MatchResult[]; unmatched: string[] };
    return {
      matched: Array.isArray(result.matched) ? result.matched : [],
      unmatched: Array.isArray(result.unmatched) ? result.unmatched : [],
    };
  } catch (e) {
    console.log(`  ⚠ Fuzzy match failed: ${e instanceof Error ? e.message : e}`);
    return { matched: [], unmatched: listNames };
  }
}

// ── Step 4: Deep research ───────────────────────────────────────────

async function scrapeMenuPages(websiteUrl: string): Promise<string> {
  if (!websiteUrl) return "";

  // Normalize base URL
  const base = websiteUrl.replace(/\/$/, "");
  const results: string[] = [];

  for (const path of MENU_PATHS) {
    const url = `${base}${path}`;
    const pageText = await fetchPage(url, 8000);
    if (pageText) {
      const naContent = extractNAContent(pageText);
      if (naContent) {
        results.push(`[${path}]:\n${naContent}`);
      }
    }
    await sleep(300);
  }

  return results.join("\n\n").slice(0, 4000);
}

async function searchWeb(query: string): Promise<string> {
  // Use a simple web search via scraping Google results
  // We'll search and extract snippets using Haiku
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=5`;
  const pageText = await fetchPage(searchUrl, 10000);

  if (!pageText) return "";

  // Extract NA-relevant snippets from search results
  const naContent = extractNAContent(pageText);
  if (naContent) return naContent;

  // Even if no NA keywords found, return a truncated version for context
  return pageText.slice(0, 2000);
}

async function deepResearch(venue: DBVenue, listMentions: string[]): Promise<EnrichmentEvidence> {
  console.log(`    Deep research: ${venue.name}`);

  // 4a. Menu page scraping
  let menuContent = "";
  if (venue.website_url) {
    console.log(`      Scraping menu pages...`);
    menuContent = await scrapeMenuPages(venue.website_url);
    if (menuContent) {
      console.log(`      ✓ Found menu NA content`);
    }
  }

  // 4b. Reddit mining
  console.log(`      Searching Reddit...`);
  const redditQuery = `"${venue.name}" mocktail OR "non-alcoholic" OR "alcohol-free" site:reddit.com`;
  const redditSnippets = await searchWeb(redditQuery);
  if (redditSnippets) {
    console.log(`      ✓ Found Reddit mentions`);
  }
  await sleep(500);

  // 4c. Review site mining
  console.log(`      Searching review sites...`);
  const reviewQuery = `"${venue.name}" London mocktail OR "non-alcoholic" review`;
  const reviewSnippets = await searchWeb(reviewQuery);
  if (reviewSnippets) {
    console.log(`      ✓ Found review mentions`);
  }
  await sleep(500);

  return {
    listMentionCount: listMentions.length,
    listNames: listMentions,
    menuContent,
    redditSnippets,
    reviewSnippets,
  };
}

// ── Step 4d: Re-score with Sonnet ───────────────────────────────────

async function rescoreVenue(
  venue: DBVenue,
  evidence: EnrichmentEvidence,
): Promise<{ newScore: number; topNaDrink: string | null; naDrinkCount: number | null; description: string | null; shortDescription: string | null } | null> {
  const listBlock = evidence.listMentionCount > 0
    ? `\nCURATED LIST MENTIONS: ${evidence.listMentionCount} lists (${evidence.listNames.join(", ")})\nThis is a strong signal — being on multiple curated "best NA" lists indicates a genuine NA focus.`
    : "\nNot found on any curated NA lists.";

  const menuBlock = evidence.menuContent
    ? `\nMENU PAGE CONTENT (from venue website):\n${evidence.menuContent}`
    : "\nNo NA content found on menu pages.";

  const redditBlock = evidence.redditSnippets
    ? `\nREDDIT MENTIONS:\n${evidence.redditSnippets.slice(0, 2000)}`
    : "\nNo relevant Reddit mentions found.";

  const reviewBlock = evidence.reviewSnippets
    ? `\nREVIEW SITE MENTIONS:\n${evidence.reviewSnippets.slice(0, 2000)}`
    : "\nNo relevant review site mentions found.";

  const prompt = `You are re-scoring a London venue for Dry Trip, a luxury travel directory for alcohol-free experiences.

VENUE: ${venue.name}
CATEGORY: ${venue.category}
CURRENT DRY SCORE: ${venue.dry_score}/5
CURRENT DESCRIPTION: ${venue.description || "None"}
CURRENT TOP NA DRINK: ${venue.top_na_drink || "None"}
${listBlock}
${menuBlock}
${redditBlock}
${reviewBlock}

Dry Score scale:
  1 = Basic soft drinks only, NA is an afterthought
  2 = A few NA cocktails worth trying
  3 = Dedicated NA section with 5+ options, someone cares about NA guests
  4 = Excellent NA programme with craft cocktails, named NA spirits, real creativity
  5 = World-class, NA-forward with pairings or built-in programmes (rare — reserve for clear evidence)

Based on ALL the evidence, provide an updated assessment. Return a JSON object with:
1. "new_score" — integer 1-5. Consider list mentions as meaningful signal. A venue on 3+ curated NA lists likely deserves 3+.
2. "reasoning" — 1-2 sentences explaining what new evidence changed (or didn't change) the score
3. "top_na_drink" — their best/signature NA drink if found in evidence, otherwise null
4. "na_drink_count" — estimated number of distinct NA options based on all evidence, or null if unknown
5. "description" — updated 2-3 sentence internal analysis incorporating new evidence
6. "short_description" — updated compelling 1-sentence pitch (max 120 chars) for the directory. Luxury travel magazine tone.

IMPORTANT: Be accurate. If you found strong new evidence, score higher. If evidence is weak, keep close to original.

Return ONLY the JSON object.`;

  try {
    const raw = await claudeSonnet(prompt, 800);
    const result = parseJSON(raw) as {
      new_score: number;
      reasoning: string;
      top_na_drink: string | null;
      na_drink_count: number | null;
      description: string | null;
      short_description: string | null;
    };

    const newScore = Math.max(1, Math.min(5, Math.round(result.new_score)));

    console.log(`      Score: ${venue.dry_score} → ${newScore} (${result.reasoning})`);

    // Only return if score goes up (or stays same with better data)
    if (newScore > venue.dry_score) {
      return {
        newScore,
        topNaDrink: result.top_na_drink,
        naDrinkCount: result.na_drink_count,
        description: result.description,
        shortDescription: result.short_description,
      };
    }

    // Even if score didn't change, update drink data if we found new info
    if (result.top_na_drink && !venue.top_na_drink) {
      return {
        newScore: venue.dry_score, // keep original score
        topNaDrink: result.top_na_drink,
        naDrinkCount: result.na_drink_count,
        description: result.description || venue.description,
        shortDescription: result.short_description || venue.short_description,
      };
    }

    console.log(`      → No score increase, keeping original`);
    return null;
  } catch (e) {
    console.log(`      ⚠ Re-score failed: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

// ── Step 5: Add missing venues ──────────────────────────────────────

async function addMissingVenue(name: string, listMentions: string[]): Promise<boolean> {
  console.log(`  Adding: ${name} (from ${listMentions.length} lists: ${listMentions.join(", ")})`);

  const prompt = `You are helping build a sober-friendly travel directory. Research this venue and provide detailed data.

Venue: ${name}
City: London
Note: This venue appeared on ${listMentions.length} curated "best non-alcoholic" lists (${listMentions.join(", ")}), which is a strong signal of NA focus.

Return a JSON object with these fields:
1. "category" — one of "Bar", "Restaurant", or "Hotel"
2. "country" — country code (e.g. "UK")
3. "neighborhood" — specific London neighborhood (e.g. "Soho", "Shoreditch")
4. "dry_score" — integer 1-5. Being on ${listMentions.length} curated NA lists is strong evidence. Score accordingly:
   1 = Basic soft drinks only
   2 = A few NA cocktails worth trying
   3 = Dedicated NA section with 5+ options
   4 = Excellent NA programme with craft cocktails, named NA spirits
   5 = World-class, NA-forward with pairings or built-in programmes
5. "top_na_drink" — their best/signature NA drink if known, otherwise null
6. "na_drink_count" — estimated number of distinct NA drink options
7. "description" — 2-3 sentence analysis of their NA offerings
8. "short_description" — compelling 1-sentence pitch (max 120 chars). Luxury travel magazine tone.
9. "vibe_tags" — array of 2-4 from: ["rooftop","date-night","cozy","upscale","casual","lively","intimate","group-friendly","late-night","brunch","garden","historic","modern","speakeasy","waterfront","business","wellness"]
10. "website_url" — venue website URL if known
11. "menu_url" — menu page URL if known
12. "booking_url" — reservation/booking URL if known
13. "af_minibar" — boolean, true if hotel with AF minibar options
14. "zero_proof_pairing" — boolean, true if they offer zero-proof food pairings
15. "price_range" — one of "$", "$$", "$$$", "$$$$"
16. "hours_note" — brief note about hours
17. "ai_context" — 1-2 sentences of insider tips for our AI trip planner

If you don't have enough information about a field, use null. Be honest — don't invent details. Return ONLY the JSON object.`;

  try {
    const raw = await claudeSonnet(prompt, 800);
    const data = parseJSON(raw) as Record<string, unknown>;

    const slug = await deduplicateSlug(toSlug(name, "london"));
    const category = (data.category as string) || "Bar";

    const row = {
      name,
      slug,
      city: "London",
      country: (data.country as string) || "UK",
      category,
      neighborhood: data.neighborhood,
      dry_score: data.dry_score,
      top_na_drink: data.top_na_drink || null,
      na_drink_count: data.na_drink_count || 0,
      description: data.description,
      short_description: data.short_description,
      website_url: data.website_url || null,
      menu_url: data.menu_url || null,
      booking_url: data.booking_url || null,
      image_url: null,
      af_minibar: data.af_minibar || false,
      zero_proof_pairing: data.zero_proof_pairing || false,
      vibe_tags: data.vibe_tags || [],
      price_range: data.price_range || null,
      hours_note: data.hours_note || null,
      ai_context: data.ai_context || null,
      status: "Draft",
    };

    await supabaseRequest("POST", "venues", row, "on_conflict=slug");
    console.log(`    ✓ Added as "${slug}" (Score: ${data.dry_score}/5, Draft)`);
    return true;
  } catch (e) {
    console.error(`    ✗ Failed: ${e instanceof Error ? e.message : e}`);
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  DRY TRIP — ENRICHMENT PASS`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Including Published venues: ${INCLUDE_PUBLISHED ? "yes" : "no"}`);
  console.log();

  // ── Step 1: Scrape curated lists ──────────────────────────────────

  console.log("Step 1: Scraping curated NA venue lists...\n");

  const listResults: { listName: string; names: string[] }[] = [];

  for (const { name, url } of CURATED_LIST_URLS) {
    const names = await scrapeAndExtractNames(url, name);
    listResults.push({ listName: name, names });
    await sleep(500); // Be polite between fetches
  }

  const totalExtracted = listResults.reduce((sum, r) => sum + r.names.length, 0);
  console.log(`\n  Extracted ${totalExtracted} venue mentions across ${CURATED_LIST_URLS.length} lists.\n`);

  // ── Step 2: Build list mentions map ───────────────────────────────

  console.log("Step 2: Building list mentions map...\n");

  const mentionsMap = buildMentionsMap(listResults);
  const allListNames = [...mentionsMap.keys()];

  console.log(`  ${mentionsMap.size} unique venues found across lists.`);

  // Show top mentioned venues
  const sorted = [...mentionsMap.entries()].sort((a, b) => b[1].length - a[1].length);
  console.log(`\n  Top mentioned venues:`);
  for (const [name, lists] of sorted.slice(0, 10)) {
    console.log(`    ${lists.length}x — ${name} (${lists.join(", ")})`);
  }
  console.log();

  // ── Step 3: Fuzzy match against Supabase ──────────────────────────

  console.log("Step 3: Matching against database venues...\n");

  const statusFilter = INCLUDE_PUBLISHED
    ? `status=in.(Draft,Published)`
    : `status=eq.Draft`;
  const dbVenues = (await supabaseRequest(
    "GET",
    "venues",
    undefined,
    `select=id,name,slug,city,category,dry_score,top_na_drink,na_drink_count,description,short_description,website_url,status&city=eq.London&${statusFilter}&order=name.asc`,
  )) as DBVenue[];

  console.log(`  Database has ${dbVenues.length} London venues (${INCLUDE_PUBLISHED ? "Draft + Published" : "Draft only"}).`);

  // Break into small chunks — 239 DB names + list names makes a big prompt for Haiku
  const CHUNK_SIZE = 20;
  const allMatched: MatchResult[] = [];
  const allUnmatched: string[] = [];

  const totalChunks = Math.ceil(allListNames.length / CHUNK_SIZE);
  for (let i = 0; i < allListNames.length; i += CHUNK_SIZE) {
    const chunkNum = Math.floor(i / CHUNK_SIZE) + 1;
    const chunk = allListNames.slice(i, i + CHUNK_SIZE);
    console.log(`  Matching batch ${chunkNum}/${totalChunks} (${chunk.length} names)...`);
    const { matched, unmatched } = await fuzzyMatchVenues(chunk, dbVenues);
    console.log(`    → ${matched.length} matched, ${unmatched.length} unmatched`);
    allMatched.push(...matched);
    allUnmatched.push(...unmatched);
    await sleep(500);
  }

  console.log(`\n  Matched: ${allMatched.length} venues`);
  console.log(`  Unmatched: ${allUnmatched.length} venues (will be added as new)\n`);

  // ── Step 4: Deep research + re-score matched venues ───────────────

  console.log("Step 4: Deep research and re-scoring matched venues...\n");

  let updatedCount = 0;
  let unchangedCount = 0;

  // Deduplicate matches by dbId (a venue may match multiple list names)
  const matchedByDbId = new Map<number, { venue: DBVenue; listMentions: string[] }>();
  for (const match of allMatched) {
    const venue = dbVenues.find((v) => v.id === match.dbId);
    if (!venue) continue;

    const existing = matchedByDbId.get(match.dbId);
    if (existing) {
      // Merge list mentions from the mentionsMap
      const mentions = mentionsMap.get(match.listName) || [];
      for (const m of mentions) {
        if (!existing.listMentions.includes(m)) existing.listMentions.push(m);
      }
    } else {
      matchedByDbId.set(match.dbId, {
        venue,
        listMentions: mentionsMap.get(match.listName) || [match.listName],
      });
    }
  }

  for (const [, { venue, listMentions }] of matchedByDbId) {
    console.log(`\n  ${venue.name} (current score: ${venue.dry_score}, on ${listMentions.length} lists)`);

    const evidence = await deepResearch(venue, listMentions);
    const update = await rescoreVenue(venue, evidence);

    if (update) {
      // Apply update to Supabase
      const patchBody: Record<string, unknown> = {};

      if (update.newScore > venue.dry_score) {
        patchBody.dry_score = update.newScore;
      }
      if (update.topNaDrink) {
        patchBody.top_na_drink = update.topNaDrink;
      }
      if (update.naDrinkCount != null) {
        patchBody.na_drink_count = update.naDrinkCount;
      }
      if (update.description) {
        patchBody.description = update.description;
      }
      if (update.shortDescription) {
        patchBody.short_description = update.shortDescription;
      }

      if (Object.keys(patchBody).length > 0) {
        await supabaseRequest(
          "PATCH",
          "venues",
          patchBody,
          `id=eq.${venue.id}`,
        );
        console.log(`    ✓ Updated: ${Object.keys(patchBody).join(", ")}`);
        updatedCount++;
      } else {
        unchangedCount++;
      }
    } else {
      unchangedCount++;
    }

    await sleep(500);
  }

  console.log(`\n  Updated: ${updatedCount} venues`);
  console.log(`  Unchanged: ${unchangedCount} venues\n`);

  // ── Step 5: Add missing venues ────────────────────────────────────

  console.log("Step 5: Adding new venues from curated lists...\n");

  // Filter unmatched to only venues with 2+ list mentions (quality threshold)
  const worthAdding = allUnmatched.filter((name) => {
    const mentions = mentionsMap.get(name);
    return mentions && mentions.length >= 2;
  });

  // Also add venues with 1 mention but from particularly trustworthy sources
  const trustedSources = ["Time Out", "Squaremeal", "Luxury London"];
  const singleMentionFromTrusted = allUnmatched.filter((name) => {
    const mentions = mentionsMap.get(name);
    if (!mentions || mentions.length !== 1) return false;
    return trustedSources.some((s) => mentions.includes(s));
  });

  const toAdd = [...new Set([...worthAdding, ...singleMentionFromTrusted])];

  console.log(`  ${allUnmatched.length} unmatched venues total`);
  console.log(`  ${toAdd.length} meet threshold for auto-add (2+ lists or 1 trusted source)\n`);

  let addedCount = 0;
  let failedCount = 0;

  for (const name of toAdd) {
    const mentions = mentionsMap.get(name) || [];
    const success = await addMissingVenue(name, mentions);
    if (success) addedCount++;
    else failedCount++;
    await sleep(700); // Longer pause for Sonnet calls
  }

  // ── Step 6: Summary ───────────────────────────────────────────────

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ENRICHMENT COMPLETE`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Lists scraped:      ${CURATED_LIST_URLS.length}`);
  console.log(`  Venue mentions:     ${totalExtracted}`);
  console.log(`  Unique venues:      ${mentionsMap.size}`);
  console.log(`  Matched to DB:      ${matchedByDbId.size}`);
  console.log(`  Scores updated:     ${updatedCount}`);
  console.log(`  Scores unchanged:   ${unchangedCount}`);
  console.log(`  New venues added:   ${addedCount}`);
  console.log(`  Failed to add:      ${failedCount}`);
  console.log();
  console.log("Next steps:");
  console.log("  1. Review updated scores in Supabase or /admin/review");
  console.log("  2. Review new Draft venues and publish approved ones");
  console.log("  3. Run 'npm run backfill:coords' for new venues missing coordinates");
}

main().catch(console.error);
