import type { Metadata } from "next";

const CITY_SEO: Record<string, { display: string; description: string }> = {
  london: {
    display: "London",
    description: "63 London hotels, restaurants, and bars rated for non-alcoholic drinks. From Michelin-starred NA pairings to dedicated zero-proof cocktail bars.",
  },
  "new-york": {
    display: "New York",
    description: "14 verified NYC venues for alcohol-free drinking. Dedicated sober bars, zero-proof bottle shops, and Michelin-starred NA pairings in Brooklyn and Manhattan.",
  },
  berlin: {
    display: "Berlin",
    description: "9 Berlin venues with standout non-alcoholic programmes. Michelin-starred NA pairings at CODA and Cookies Cream, plus craft AF beer and bottle shops.",
  },
  melbourne: {
    display: "Melbourne",
    description: "Melbourne's best alcohol-free venues. Australia's pioneering NA distillery Brunswick Aces, plus tasting menus and bottle shops.",
  },
  "los-angeles": {
    display: "Los Angeles",
    description: "7 LA venues for alcohol-free drinking. From Free Spirited (LA's first sober bar) to Michelin-starred Meteora and Death & Co's zero-proof menu.",
  },
  copenhagen: {
    display: "Copenhagen",
    description: "8 Copenhagen venues with world-class NA programmes. Geranium, Jordnaer, and Kadeau offer juice pairings rivalling their wine lists.",
  },
  dubai: {
    display: "Dubai",
    description: "Dubai's top alcohol-free venues. NoLo (the city's first NA bar), Michelin-starred 11 Woodfire, and speakeasy 1920.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const seo = CITY_SEO[city] ?? CITY_SEO.london;

  return {
    title: `${seo.display} Venues`,
    description: seo.description,
    openGraph: {
      title: `${seo.display} Alcohol-Free Venues | Dry Trip`,
      description: seo.description,
    },
  };
}

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
