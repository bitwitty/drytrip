/**
 * Manually add a venue to the database.
 *
 * Usage: node --experimental-strip-types scripts/add-venue.ts "Venue Name" "London" "Bar"
 *
 * The script will:
 * 1. Generate a slug
 * 2. Ask Claude to research the venue and generate all fields
 * 3. Insert as Draft into Supabase
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY || !ANTHROPIC_KEY) {
  console.error("Missing required env vars. Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY");
  process.exit(1);
}

async function supabaseRequest(method: string, table: string, body?: unknown, params?: string) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params ? `?${params}` : ""}`;
  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: method === "POST" ? "resolution=merge-duplicates" : "",
  };
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
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
      max_tokens: 800,
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

const [, , name, city = "London", category = "Bar"] = process.argv;

if (!name) {
  console.error('Usage: node --experimental-strip-types scripts/add-venue.ts "Venue Name" [city] [category]');
  console.error("  city defaults to London");
  console.error("  category: Hotel | Restaurant | Bar (defaults to Bar)");
  process.exit(1);
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
    "GET", "venues", undefined,
    `select=slug&slug=like.${encodeURIComponent(baseSlug + "%")}`
  );
  if (!data || data.length === 0) return baseSlug;
  const existing = new Set(data.map((r: { slug: string }) => r.slug));
  if (!existing.has(baseSlug)) return baseSlug;
  let i = 2;
  while (existing.has(`${baseSlug}-${i}`)) i++;
  return `${baseSlug}-${i}`;
}

async function main() {
  console.log(`\nResearching: ${name} (${category} in ${city})...\n`);

  const prompt = `You are helping build a sober-friendly travel directory. Research this venue and provide detailed data.

Venue: ${name}
City: ${city}
Category: ${category}

Return a JSON object with these fields:
1. "country" — country code (e.g. "UK")
2. "neighborhood" — specific neighborhood (e.g. "Soho", "Shoreditch")
3. "dry_score" — integer 1-5 rating of their alcohol-free experience:
   1 = basic soft drinks only
   2 = a few NA cocktails/options
   3 = dedicated NA section with 5+ options
   4 = excellent NA program with craft cocktails, NA spirits
   5 = world-class, NA-forward with pairings, programs, or NA focus
4. "top_na_drink" — their best/signature NA drink if known, otherwise null
5. "na_drink_count" — estimated number of distinct NA drink options
6. "description" — 2-3 sentence analysis of their NA offerings for internal scoring reference
7. "short_description" — compelling 1-sentence pitch (max 120 chars) for the public directory. Write like a luxury travel magazine.
8. "vibe_tags" — array of 2-4 from: ["rooftop","date-night","cozy","upscale","casual","lively","intimate","group-friendly","late-night","brunch","garden","historic","modern","speakeasy","waterfront","business","wellness"]
9. "website_url" — venue website URL if known
10. "menu_url" — menu page URL if known
11. "booking_url" — reservation/booking URL if known
12. "af_minibar" — boolean, true if hotel with AF minibar options
13. "zero_proof_pairing" — boolean, true if they offer zero-proof food pairings
14. "price_range" — one of "$", "$$", "$$$", "$$$$"
15. "hours_note" — brief note about hours (e.g. "Open late weekends", "Lunch and dinner")
16. "ai_context" — 1-2 sentences of insider tips for our AI trip planner (e.g. "Book ahead for window seats", "Gets loud after 10pm")

If you don't have enough information about a field, use null. Be honest — don't invent NA drink details you're not confident about. Return ONLY the JSON object.`;

  const rawText = await claudeMessage(prompt);
  const text = rawText.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Failed to parse Claude response:");
    console.error(rawText);
    process.exit(1);
  }

  const slug = await deduplicateSlug(toSlug(name, city));

  const row = {
    name,
    slug,
    city,
    country: data.country || "UK",
    category,
    neighborhood: data.neighborhood,
    dry_score: data.dry_score,
    top_na_drink: data.top_na_drink,
    na_drink_count: data.na_drink_count,
    description: data.description,
    short_description: data.short_description,
    website_url: data.website_url,
    menu_url: data.menu_url,
    booking_url: data.booking_url,
    image_url: null,
    af_minibar: data.af_minibar || false,
    zero_proof_pairing: data.zero_proof_pairing || false,
    vibe_tags: data.vibe_tags || [],
    price_range: data.price_range,
    hours_note: data.hours_note,
    ai_context: data.ai_context,
    status: "Draft",
  };

  console.log("Generated venue data:");
  console.log(JSON.stringify(row, null, 2));
  console.log();

  await supabaseRequest("POST", "venues", row, "on_conflict=slug");

  console.log(`✓ Added "${name}" as "${slug}" (status: Draft)`);
  console.log(`  → Review in Supabase dashboard, then set status to Published.`);
}

main().catch(console.error);
