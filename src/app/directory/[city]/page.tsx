import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabaseAdmin } from "@/lib/supabase";
import type { Venue } from "@/lib/types";
import DirectoryClient from "./DirectoryClient";

export const revalidate = 86400; // revalidate once per day

/* ------------------------------------------------------------------ */
/*  City config                                                        */
/* ------------------------------------------------------------------ */

const CITIES: Record<string, { display: string; dbValue: string; center: [number, number] }> = {
  london: { display: "London", dbValue: "London", center: [-0.1276, 51.5074] },
  // Coming soon — re-enable as each city is audited
  // "new-york": { display: "New York", dbValue: "New York", center: [-73.9857, 40.7484] },
  // berlin: { display: "Berlin", dbValue: "Berlin", center: [13.405, 52.52] },
  // melbourne: { display: "Melbourne", dbValue: "Melbourne", center: [144.9631, -37.8136] },
  // "los-angeles": { display: "Los Angeles", dbValue: "Los Angeles", center: [-118.2437, 34.0522] },
  // copenhagen: { display: "Copenhagen", dbValue: "Copenhagen", center: [12.5683, 55.6761] },
  // dubai: { display: "Dubai", dbValue: "Dubai", center: [55.2708, 25.2048] },
};

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return Object.keys(CITIES).map((city) => ({ city }));
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function CityDirectoryPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const citySlug = city ?? "london";
  const cityConfig = CITIES[citySlug] ?? CITIES.london;

  // Server-side data fetch — crawlable by search engines
  const { data } = await supabaseAdmin
    .from("venues")
    .select("*")
    .eq("status", "Published")
    .eq("city", cityConfig.dbValue);

  const venues = (data ?? []) as Venue[];

  const neighborhoods = Array.from(
    new Set(venues.map((v) => v.neighborhood).filter(Boolean))
  ).sort() as string[];

  return (
    <div className="min-h-screen bg-linen">
      <Nav />
      <DirectoryClient
        venues={venues}
        citySlug={citySlug}
        cityConfig={cityConfig}
        cities={CITIES}
        neighborhoods={neighborhoods}
      />
      <Footer />
    </div>
  );
}
