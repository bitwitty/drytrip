/**
 * Backfill latitude/longitude for Published venues that are missing coords.
 *
 * Usage: npm run backfill:coords
 *
 * For each venue without lat/lng, this script:
 * 1. Tries the Google Places Details API using google_place_id (fastest, most accurate)
 * 2. Falls back to Places Text Search using venue name + city
 * 3. Updates the venue record with the found coordinates
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_KEY) {
  console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_PLACES_API_KEY");
  process.exit(1);
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function getCoordsFromPlaceId(placeId: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_KEY}`;
  const data = await fetchJson(url);
  const loc = data?.result?.geometry?.location;
  return loc ? { lat: loc.lat, lng: loc.lng } : null;
}

async function getCoordsFromTextSearch(name: string, city: string): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(`${name} ${city}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_KEY}`;
  const data = await fetchJson(url);
  const loc = data?.results?.[0]?.geometry?.location;
  return loc ? { lat: loc.lat, lng: loc.lng } : null;
}

async function main() {
  // Fetch all Published venues missing coords
  const listRes = await fetch(
    `${SUPABASE_URL}/rest/v1/venues?select=id,name,city,google_place_id&status=eq.Published&or=(latitude.is.null,longitude.is.null)`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const venues = await listRes.json();

  if (!Array.isArray(venues) || venues.length === 0) {
    console.log("✓ All Published venues already have coordinates.");
    return;
  }

  console.log(`Found ${venues.length} venue(s) missing coordinates. Backfilling...`);

  let success = 0;
  let failed = 0;

  for (const venue of venues) {
    try {
      let coords: { lat: number; lng: number } | null = null;

      if (venue.google_place_id) {
        coords = await getCoordsFromPlaceId(venue.google_place_id);
      }

      if (!coords) {
        coords = await getCoordsFromTextSearch(venue.name, venue.city);
      }

      if (!coords) {
        console.warn(`  ✗ Could not find coords for: ${venue.name}`);
        failed++;
        continue;
      }

      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/venues?id=eq.${venue.id}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ latitude: coords.lat, longitude: coords.lng }),
        }
      );

      if (!updateRes.ok) {
        console.warn(`  ✗ Failed to update ${venue.name}: HTTP ${updateRes.status}`);
        failed++;
      } else {
        console.log(`  ✓ ${venue.name}: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
        success++;
      }

      // Respect Google API rate limits
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.warn(`  ✗ Error for ${venue.name}:`, err);
      failed++;
    }
  }

  console.log(`\nDone. ${success} updated, ${failed} failed.`);
  if (failed > 0) {
    console.log("Re-run the script to retry failed venues, or add coords manually in Supabase.");
  }
}

main().catch(console.error);
