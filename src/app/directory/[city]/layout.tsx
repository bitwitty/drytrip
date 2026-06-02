import type { Metadata } from "next";

const CITY_SEO: Record<string, { display: string; description: string }> = {
  london: {
    display: "London",
    description: "50 London hotels, restaurants, and bars individually audited for non-alcoholic drinks. Every venue scored on one rubric. From Michelin-starred NA pairings to dedicated zero-proof cocktail bars.",
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
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(`${seo.display} Alcohol-Free Venues`)}&subtitle=${encodeURIComponent(seo.description)}`,
          width: 1200,
          height: 630,
          alt: `${seo.display} alcohol-free venues on Dry Trip`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
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
