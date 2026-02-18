/**
 * Upload existing venue JSON files to Supabase.
 *
 * Reads all JSON files from scripts/output/ and upserts them
 * into the "venues" table — no scraping, no API calls needed.
 *
 * Usage:
 *   npx tsx scripts/upload-venues.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const OUTPUT_DIR = path.resolve(__dirname, "output");

async function main() {
  const files = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    console.log("No JSON files found in scripts/output/");
    process.exit(0);
  }

  console.log(`Found ${files.length} venue files to upload\n`);

  let totalUpserted = 0;
  let totalSkipped = 0;

  for (const file of files) {
    const filePath = path.join(OUTPUT_DIR, file);
    const venues = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (!Array.isArray(venues) || venues.length === 0) {
      console.log(`  ${file}: empty or invalid — skipped`);
      totalSkipped++;
      continue;
    }

    console.log(`  ${file}: ${venues.length} venues`);

    // Upsert in batches of 50 to avoid payload limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < venues.length; i += BATCH_SIZE) {
      const batch = venues.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase
        .from("venues")
        .upsert(batch, { onConflict: "name,city" })
        .select();

      if (error) {
        console.error(`    ✗ Batch failed: ${error.message}`);
        console.error(`      ${JSON.stringify(error, null, 2)}`);
      } else {
        totalUpserted += data?.length ?? 0;
      }
    }
  }

  console.log(`\nDone! Upserted ${totalUpserted} venues across ${files.length - totalSkipped} files.`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message ?? err);
  process.exit(1);
});
