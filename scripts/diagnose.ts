/**
 * Quick diagnostic — run this to check your environment:
 *   npx tsx scripts/diagnose.ts
 */

console.log("=== Dry Trip Diagnostics ===\n");

// 1. Check dotenv loads
console.log("[1] Loading .env...");
try {
  await import("dotenv/config");
  console.log("    OK — dotenv loaded");
} catch (e: any) {
  console.error("    FAIL —", e.message);
}

// 2. Check env vars
console.log("\n[2] Checking environment variables...");
const vars = [
  "GOOGLE_PLACES_API_KEY",
  "ANTHROPIC_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];
for (const v of vars) {
  const val = process.env[v];
  if (val) {
    console.log(`    ${v} = ${val.slice(0, 12)}...  ✓`);
  } else {
    console.log(`    ${v} = (not set)  ✗`);
  }
}

// 3. Check Google Places API key works
console.log("\n[3] Testing Google Places API...");
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!GOOGLE_KEY) {
  console.log("    SKIP — no API key");
} else {
  const { default: axios } = await import("axios");
  try {
    const res = await axios.post(
      "https://places.googleapis.com/v1/places:searchText",
      { textQuery: "best bars in Vancouver", maxResultCount: 1 },
      {
        timeout: 15_000,
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName",
        },
      }
    );
    console.log(`    OK — status ${res.status}, found ${res.data.places?.length ?? 0} place(s)`);
    if (res.data.places?.[0]) {
      console.log(`    Sample: ${res.data.places[0].displayName?.text}`);
    }
  } catch (err: any) {
    if (err.response) {
      console.error(`    FAIL — HTTP ${err.response.status}`);
      console.error(`    Body:`, JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(`    FAIL — ${err.code ?? err.message}`);
    }
  }
}

// 4. Check Anthropic API key works
console.log("\n[4] Testing Anthropic API...");
const ANTH_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTH_KEY) {
  console.log("    SKIP — no API key");
} else {
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: ANTH_KEY });
    const msg = await client.messages.create(
      { model: "claude-haiku-4-5-20251001", max_tokens: 10, messages: [{ role: "user", content: "Say OK" }] },
      { timeout: 15_000 }
    );
    const text = msg.content[0]?.type === "text" ? msg.content[0].text : "(no text)";
    console.log(`    OK — response: "${text}"`);
  } catch (err: any) {
    console.error(`    FAIL — ${err.status ?? err.code ?? err.message}`);
    if (err.error) console.error(`    Detail:`, JSON.stringify(err.error, null, 2));
  }
}

// 5. Check Supabase connection
console.log("\n[5] Testing Supabase connection...");
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SB_URL || !SB_KEY) {
  console.log("    SKIP — Supabase env vars not set");
} else {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(SB_URL, SB_KEY);
    const { data, error } = await supabase.from("venues").select("name").limit(1);
    if (error) {
      console.error(`    FAIL — ${error.message}`);
    } else {
      console.log(`    OK — venues table accessible, ${data.length} row(s) returned`);
    }
  } catch (err: any) {
    console.error(`    FAIL — ${err.message}`);
  }
}

console.log("\n=== Done ===");
