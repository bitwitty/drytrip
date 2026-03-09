const Anthropic = require("@anthropic-ai/sdk").default;
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Run on ALL published venues, not just keyword-matched ones
const RUN_ALL = process.argv.includes("--all");

const PIPELINE_KEYWORDS = [
  "however", "no detailed", "no specific", "suggests a", "no customer reviews",
  "no visible", "limited information", "indicating", "no reviews mentioning",
  "this suggests", "worth noting", "it appears", "no evidence", "remains unclear",
  "no concrete", "no corroborating"
];

// AI slop patterns
const AI_SLOP_PATTERNS = [
  "this is where you come for", "come for", "perfect for",
  "whether you're", "what it lacks in", "best for those who",
  "alone justifies", "crafted", "curated", "elevated", "bespoke",
  "thoughtful", "considered", "intentional",
  "programme", "offering", "selection",
  "groundbreaking", "innovative", "cutting-edge",
  "delivers", "shines", "excels",
  "theatre", "theater",
  "settle in", "tuck into",
  "abstaining", "skipping alcohol",
  "centre stage", "takes a backseat",
  "commitment", "dedication",
  "carries the evening", "carry the evening",
  "the real draw", "the real star",
  "won't overwhelm", "won't wow",
  "nursing a", "nursing one",
  "not an afterthought", "seriously",
  "don't expect", "the whole thing", "the whole ",
  "sort you out", "save your energy",
  "the kind of", "haven", "tucked",
  "hold up against", "actually taste",
  "get the same treatment", "get proper attention",
];

async function rewriteOne(venue) {
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Write 2-3 short bullets about this venue. Imagine you've been there and you're telling a friend over coffee.

HOW TO WRITE THIS:
- Flat, plain language. No poetry. No drama.
- Short sentences. Fragments OK.
- Say what's good. Say what's not. Move on.
- No em dashes. Use periods.
- No semicolons.
- Don't start more than one bullet with "The".
- Never describe something as "feeling like" something else.
- Never use triplets like "precise, beautiful, stunning". Pick one word.
- Don't sound writerly. Sound normal.

BANNED WORDS (rejected if used):
craft, crafted, curated, elevated, bespoke, thoughtful, considered, intentional, programme, offering, selection, groundbreaking, innovative, delivers, shines, excels, theatre, theater, proper, commitment, dedication, stunning, secret, subterranean, sophisticated, meticulous, precise, beautiful, exquisite, exceptional, remarkable, extraordinary, nestled, tucked, boasts, bustling, vibrant, gem, hidden gem, haven, sanctuary, journey, atmosphere, ambiance, seriously, complex, genuinely

BANNED PHRASES (rejected if used):
"feels like a", "is why you're here", "come for", "perfect for", "whether you're", "what it lacks in", "best for those", "justifies a visit", "carries the evening", "the real draw", "the real star", "takes a backseat", "don't expect", "not an afterthought", "takes X seriously", "goes all in", "the kind of place", "sort you out", "save your energy", "won't change your life", "nobody cares what you're drinking", "the whole thing", "the whole", "does most of the work", "hold up against", "actually taste", "get the same treatment", "get proper attention"

EXAMPLES OF WHAT I WANT:
- "Three mocktails. Nothing fancy, but the kebabs are great."
- "They'll make you something non-alcoholic if you ask. No menu for it though."
- "Twelve seats, counter dining. Zero-proof pairing for every course. Genuinely good."
- "Loud, frescoes everywhere, very Instagram. The Virgin Mandarin Mojito is fine."
- "Good cocktail bar that happens to do a few solid mocktails too."
- "The food's the point here. Drinks are basic but they'll look after you."

Return ONLY bullets starting with "• ". Nothing else.

VENUE DATA:
Name: ${venue.name}
Type: ${venue.category} in ${venue.neighborhood}
Dry Score: ${venue.dry_score}/5
Top drink: ${venue.top_na_drink || "Nothing specific"}
Number of NA drinks: ${venue.na_drink_count || "Unknown"}
Vibe: ${(venue.vibe_tags || []).join(", ")}
One-liner: ${venue.short_description}
Current description (rewrite this): ${venue.description}`
    }]
  });

  return msg.content[0].text;
}

function needsRewrite(desc) {
  const d = (desc || "").toLowerCase();
  return PIPELINE_KEYWORDS.some(kw => d.includes(kw)) || AI_SLOP_PATTERNS.some(p => d.includes(p));
}

async function main() {
  const { data: allVenues } = await supabase
    .from("venues")
    .select("id, name, category, neighborhood, description, short_description, dry_score, top_na_drink, vibe_tags, na_drink_count")
    .eq("status", "Published");

  const toRewrite = RUN_ALL
    ? allVenues
    : allVenues.filter(v => needsRewrite(v.description));

  console.log(`Found ${toRewrite.length} venues to rewrite${RUN_ALL ? " (--all flag)" : ""}\n`);

  let updated = 0;
  let failed = 0;

  for (const v of toRewrite) {
    try {
      const newDesc = await rewriteOne(v);
      const { error } = await supabase.from("venues").update({ description: newDesc }).eq("id", v.id);
      if (error) {
        console.error(`  ✗ ${v.name}: ${error.message}`);
        failed++;
      } else {
        console.log(`  ✓ ${v.name}`);
        updated++;
      }
    } catch (e) {
      console.error(`  ✗ ${v.name}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${failed} failed`);
}

main();
