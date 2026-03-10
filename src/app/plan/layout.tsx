import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan a Trip",
  description:
    "AI-powered trip planning backed by verified alcohol-free venue data. Tell us where you're going.",
  openGraph: {
    title: "Plan a Trip | Dry Trip",
    description:
      "AI-powered trip planning backed by verified alcohol-free venue data. Tell us where you're going.",
    images: [
      {
        url: "/api/og?title=Plan%20an%20Alcohol-Free%20Trip&subtitle=AI-powered%20planning%20backed%20by%20verified%20venue%20data",
        width: 1200,
        height: 630,
        alt: "Plan an alcohol-free trip with Dry Trip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plan a Trip | Dry Trip",
    description:
      "AI-powered trip planning backed by verified alcohol-free venue data.",
  },
};

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
