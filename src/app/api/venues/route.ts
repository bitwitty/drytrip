import { NextResponse } from "next/server";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Venue } from "@/lib/types";

/**
 * GET /api/venues
 *
 * Reads all scraped venue JSON files from scripts/output/ and returns
 * venues with dry_score > 0, sorted by score descending.
 * Falls back to Supabase if no local files exist.
 */
export async function GET() {
  const outputDir = path.resolve(process.cwd(), "scripts/output");

  if (!fs.existsSync(outputDir)) {
    return NextResponse.json([]);
  }

  const files = fs.readdirSync(outputDir).filter((f) => f.endsWith(".json"));

  const allVenues: Venue[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(outputDir, file), "utf-8");
      const venues: Venue[] = JSON.parse(raw);
      allVenues.push(...venues);
    } catch {
      // skip malformed files
    }
  }

  // Sort by dry_score descending (show all venues)
  allVenues.sort((a, b) => b.dry_score - a.dry_score);

  return NextResponse.json(allVenues);
}
