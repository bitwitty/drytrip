import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan a Trip",
  description:
    "Plan an alcohol-free trip using editorially curated venue data. Every venue individually audited.",
  openGraph: {
    title: "Plan a Trip | Dry Trip",
    description:
      "Plan an alcohol-free trip using editorially curated venue data. Every venue individually audited.",
    images: [
      {
        url: "/api/og?title=Plan%20an%20Alcohol-Free%20Trip&subtitle=Every%20venue%20individually%20audited",
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
      "Plan an alcohol-free trip using editorially curated venue data. Every venue individually audited.",
  },
};

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
