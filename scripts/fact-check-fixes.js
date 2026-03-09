const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findVenue(name, city) {
  const { data } = await sb.from("venues").select("id, name, city, dry_score, status")
    .eq("city", city).ilike("name", `%${name}%`).eq("status", "Published").limit(1);
  return data?.[0];
}

async function main() {
  let updated = 0, removed = 0, errors = 0;

  // === REMOVALS (unpublish) ===
  const removals = [
    { name: "SipGeek", city: "London", reason: "Mobile catering, not a venue" },
    { name: "Alcotraz", city: "Melbourne", reason: "BYO alcohol concept" },
    { name: "Bombay Borough", city: "Dubai", reason: "Full alcohol, generic mocktails" },
    { name: "Rose Bar", city: "Dubai", reason: "Full alcohol, generic mocktails" },
    { name: "Aces Bar", city: "Melbourne", reason: "Duplicate of Brunswick Aces" },
  ];

  for (const r of removals) {
    const v = await findVenue(r.name, r.city);
    if (v) {
      await sb.from("venues").update({ status: "Draft" }).eq("id", v.id);
      console.log(`REMOVED: ${v.name} (${r.city}) — ${r.reason}`);
      removed++;
    } else {
      console.log(`NOT FOUND: ${r.name} (${r.city})`);
      errors++;
    }
  }

  // === LUCKY SAINT DUPLICATE FIX ===
  // Remove "The Lucky Saint Pubs" (Camden - wrong location), keep "The Lucky Saint" (Marylebone)
  const { data: luckyPubs } = await sb.from("venues").select("id, name, neighborhood")
    .eq("city", "London").ilike("name", "%Lucky Saint Pub%").eq("status", "Published");
  if (luckyPubs?.length) {
    for (const lp of luckyPubs) {
      await sb.from("venues").update({ status: "Draft" }).eq("id", lp.id);
      console.log(`REMOVED DUPLICATE: ${lp.name} (${lp.neighborhood})`);
      removed++;
    }
  }
  // Fix the remaining Lucky Saint entry
  const luckySaint = await findVenue("Lucky Saint", "London");
  if (luckySaint) {
    await sb.from("venues").update({
      dry_score: 3,
      neighborhood: "Marylebone",
      short_description: "Lucky Saint's Marylebone pub pairs proper pub atmosphere with a strong alcohol-free beer range — but also serves alcoholic drinks.",
      ai_context: "At 58 Devonshire Street, Marylebone. Note: this is NOT a fully alcohol-free pub — they serve both alcoholic and non-alcoholic drinks. Strong Lucky Saint beer range plus guest NA options. Good pub food.",
    }).eq("id", luckySaint.id);
    console.log(`FIXED: The Lucky Saint — score 5→3, location to Marylebone, noted serves alcohol`);
    updated++;
  }

  // === SCORE UPGRADES ===
  const upgrades = [
    { name: "CODA", city: "Berlin", score: 5 },
    { name: "BRIKZ", city: "Berlin", score: 4 },
    { name: "Aoc", city: "Copenhagen", score: 4 },
    { name: "11 Woodfire", city: "Dubai", score: 5 },
  ];

  for (const u of upgrades) {
    const v = await findVenue(u.name, u.city);
    if (v) {
      await sb.from("venues").update({ dry_score: u.score }).eq("id", v.id);
      console.log(`UPGRADED: ${v.name} (${v.city}) — ${v.dry_score}→${u.score}`);
      updated++;
    } else {
      console.log(`NOT FOUND: ${u.name} (${u.city})`);
      errors++;
    }
  }

  // === SCORE DOWNGRADES ===
  const downgrades = [
    { name: "Connaught Bar", city: "London", score: 4 },
    { name: "Akoko", city: "London", score: 4 },
    { name: "Elementary", city: "London", score: 3 }, // Tayēr + Elementary
    { name: "Death & Co", city: "New York", score: 4 },
    { name: "Brunswick Aces", city: "Melbourne", score: 4 },
    { name: "Masiosare", city: "Los Angeles", score: 3 },
    { name: "Bacari", city: "Los Angeles", score: 3 },
    { name: "Sip & Enjoy", city: "Melbourne", score: 3 },
    { name: "Coco Grill", city: "London", score: 3 },
  ];

  for (const d of downgrades) {
    const v = await findVenue(d.name, d.city);
    if (v) {
      await sb.from("venues").update({ dry_score: d.score }).eq("id", v.id);
      console.log(`DOWNGRADED: ${v.name} (${v.city}) — ${v.dry_score}→${d.score}`);
      updated++;
    } else {
      console.log(`NOT FOUND: ${d.name} (${d.city})`);
      errors++;
    }
  }

  // === BOTTLE SHOP RECATEGORISATIONS (score + description updates) ===
  const shops = [
    { name: "Mindful Drinking", city: "Berlin", score: 4,
      desc: "Germany's first specialty shop for premium alcohol-free spirits, wines, and aperitifs — with in-store tastings. Note: this is a retail bottle shop, not a bar." },
    { name: "Spirited Away", city: "New York", score: 4,
      desc: "America's first non-alcoholic bottle shop in Chelsea, curating zero-proof spirits, wines, and craft cocktails. Note: retail shop with tastings, not a bar." },
    { name: "Minus Moonshine", city: "New York", score: 4,
      desc: "Prospect Heights bottle shop specialising in non-alcoholic spirits with regular tastings. Note: retail shop, not a bar." },
  ];

  for (const s of shops) {
    const v = await findVenue(s.name, s.city);
    if (v) {
      await sb.from("venues").update({ dry_score: s.score, short_description: s.desc }).eq("id", v.id);
      console.log(`RECATEGORISED: ${v.name} — ${v.dry_score}→${s.score}, flagged as bottle shop`);
      updated++;
    } else {
      console.log(`NOT FOUND: ${s.name} (${s.city})`);
      errors++;
    }
  }

  // === FACTUAL FIXES ===

  // Lorenz Adlon: 2 stars → 1 star
  const lorenz = await findVenue("Lorenz Adlon", "Berlin");
  if (lorenz) {
    await sb.from("venues").update({
      short_description: "One-Michelin-star dining room inside Hotel Adlon with Brandenburg Gate views and a sommelier who champions non-alcoholic pairings.",
      ai_context: "Inside Hotel Adlon Kempinski overlooking Brandenburg Gate. Chef Hendrik Otto. ONE Michelin star (downgraded from two in 2025). The sommelier actively recommends and champions the non-alcoholic pairing. Plan for ~4 hours from 7pm.",
    }).eq("id", lorenz.id);
    console.log("FIXED: Lorenz Adlon — corrected to 1 Michelin star");
    updated++;
  }

  // Oriole: fix category, location, remove Michelin claim
  const oriole = await findVenue("Oriole", "London");
  if (oriole) {
    await sb.from("venues").update({
      category: "Bar",
      neighborhood: "Covent Garden",
      dry_score: 3,
      short_description: "Relocated cocktail bar in Covent Garden with creative drinks and some non-alcoholic options on the menu.",
      ai_context: "Now at Slingsby Place, Covent Garden (relocated from Spitalfields). A cocktail bar, not a restaurant. No Michelin stars. Has some NA options but is primarily an alcohol bar.",
    }).eq("id", oriole.id);
    console.log("FIXED: Oriole — category to Bar, location to Covent Garden, removed Michelin claim, 4→3");
    updated++;
  }

  // Raven Records: fix location
  const raven = await findVenue("Raven Records", "London");
  if (raven) {
    await sb.from("venues").update({ neighborhood: "Camden" }).eq("id", raven.id);
    console.log("FIXED: Raven Records — location Homerton→Camden");
    updated++;
  }

  // Cookies Cream: add 1 Michelin star
  const cookies = await findVenue("Cookies Cream", "Berlin");
  if (cookies) {
    await sb.from("venues").update({
      short_description: "One-Michelin-star vegetarian fine dining hidden behind the Westin Grand, with an inventive NA pairing featuring house-made ferments and miso-cashew hybrids.",
    }).eq("id", cookies.id);
    console.log("FIXED: Cookies Cream — added 1 Michelin star");
    updated++;
  }

  // Aoc: add 2 Michelin stars, fix branding
  const aoc = await findVenue("Aoc", "Copenhagen");
  if (aoc) {
    await sb.from("venues").update({
      short_description: "Two-Michelin-star tasting menu in vaulted underground dining rooms, with creative juice pairings (650-850 DKK) to match the artistry.",
      ai_context: "Two Michelin stars. Correctly styled as a|o|c. Juice pairing is 650-850 DKK and independently praised. Located in Indre By (city centre). A strong NA dining destination.",
    }).eq("id", aoc.id);
    console.log("FIXED: Aoc — added 2 Michelin stars, updated description");
    updated++;
  }

  // Coco Grill: note shisha aspect
  const coco = await findVenue("Coco Grill", "London");
  if (coco) {
    await sb.from("venues").update({
      short_description: "Alcohol-free restaurant near London Bridge with theatrical NA cocktails and Thames views. Note: also operates as a shisha lounge with DJ.",
      ai_context: "Genuinely alcohol-free restaurant, but primarily known as a shisha lounge with loud music and DJ. Location is near London Bridge/Tower Bridge. The AF credential is real but the vibe is shisha lounge, not luxury dining.",
    }).eq("id", coco.id);
    console.log("FIXED: Coco Grill — noted shisha lounge aspect, 4→3");
    updated++;
  }

  // Masiosare: note pop-up/night market
  const masio = await findVenue("Masiosare", "Los Angeles");
  if (masio) {
    await sb.from("venues").update({
      short_description: "Alcohol-free cocktail maker that operates primarily at LA night markets (Los Feliz, 101 Night Market). Has a listed address but not a reliable fixed venue.",
      ai_context: "Primarily a night market/pop-up operation, not a fixed bar. Listed at 941 S Union Ave but mainly found at Los Feliz Night Market and 101 Night Market. Also offers bartending services. Check their Instagram for current schedule before visiting.",
    }).eq("id", masio.id);
    console.log("FIXED: Masiosare — noted as pop-up/night market, 5→3");
    updated++;
  }

  // The Clove Club: add 2 Michelin stars
  const clove = await findVenue("Clove Club", "London");
  if (clove) {
    await sb.from("venues").update({
      short_description: "Two-Michelin-star Modern British dining in Shoreditch Town Hall with non-alcoholic pairings available.",
    }).eq("id", clove.id);
    console.log("FIXED: The Clove Club — added 2 Michelin stars");
    updated++;
  }

  // Kadeau: add 2 Michelin stars + Green Star
  const kadeau = await findVenue("Kadeau", "Copenhagen");
  if (kadeau) {
    await sb.from("venues").update({
      short_description: 'Two-Michelin-star (+ Green Star) Bornholm-inspired tasting menu with juice pairings described as "out of this world" — rhubarb, gooseberry, and Austrian grape juice.',
    }).eq("id", kadeau.id);
    console.log("FIXED: Kadeau — added 2 Michelin stars + Green Star");
    updated++;
  }

  console.log(`\n=== DONE: ${updated} updated, ${removed} removed, ${errors} not found ===`);

  // Final count
  const { data: pub } = await sb.from("venues").select("city").eq("status", "Published");
  const counts = {};
  pub.forEach(v => { counts[v.city] = (counts[v.city] || 0) + 1; });
  console.log("\nFinal published venues:");
  Object.entries(counts).sort().forEach(([k,v]) => console.log(`  ${k}: ${v}`));
  console.log(`  Total: ${pub.length}`);
}

main().catch(console.error);
