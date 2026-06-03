import type { Metadata } from "next";
import { Droplets } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "How Dry Scores Work",
  description:
    "Our 1–5 rating system for the quality of a venue's alcohol-free experience.",
  openGraph: {
    title: "How Dry Scores Work | Dry Trip",
    description:
      "Our 1–5 rating system for the quality of a venue's alcohol-free experience.",
    images: [
      {
        url: "/api/og?title=How%20Dry%20Scores%20Work&subtitle=Our%201%E2%80%935%20rating%20for%20the%20alcohol-free%20experience",
        width: 1200,
        height: 630,
        alt: "How Dry Scores Work",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Dry Scores Work | Dry Trip",
    description:
      "Our 1–5 rating system for the quality of a venue's alcohol-free experience.",
  },
};

const scores = [
  {
    score: 1,
    label: "Basic",
    description:
      "Standard soft drinks only — a lime & soda or virgin mojito if you ask. The alcohol-free experience is an afterthought.",
  },
  {
    score: 2,
    label: "Some options",
    description:
      "A few NA options using commercial spirits (Seedlip, Lyre's) or simple mocktails. Better than most, but not a destination for it.",
  },
  {
    score: 3,
    label: "Dedicated section",
    description:
      "A dedicated NA section with 3+ thoughtful options. House-made elements — not just commercial mixers. Someone here actively cares about non-drinkers.",
  },
  {
    score: 4,
    label: "Excellent",
    description:
      "A creative NA programme with 5+ options, house-made ingredients, equal presentation and pricing to alcoholic drinks. You'd come here for the NA drinks.",
  },
  {
    score: 5,
    label: "World-class",
    description:
      "NA is core to the venue's identity — full parity with the alcoholic menu, house-built programmes, zero-proof pairings. These are rare.",
  },
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-linen">
      <Nav />

      <div className="mx-auto max-w-3xl px-6 pb-24 pt-16 md:px-12 md:pt-20">
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-forest md:text-5xl">
          How we rate venues
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-forest/70">
          The Dry Score is a one-to-five rating for the quality of a
          venue&rsquo;s alcohol-free experience. It&rsquo;s not about whether a
          place serves alcohol — it&rsquo;s about how well they serve people who
          don&rsquo;t drink. The rubric is published here in full.
        </p>

        {/* Dry Score scale */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-forest">
            The Dry Score scale
          </h2>
          <div className="mt-6 space-y-4">
            {scores.map((s) => (
              <div
                key={s.score}
                className="flex gap-5 rounded-2xl border border-sandstone/30 bg-white p-5"
              >
                <div className="flex shrink-0 items-center gap-1.5">
                  <Droplets className="size-4 text-forest/60" />
                  <span className="text-2xl font-bold text-forest">
                    {s.score}
                  </span>
                  <span className="text-sm text-forest/60">/5</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-forest">
                    {s.label}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-forest/60">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How we collect data */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-forest">
            How we collect data
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-forest/70">
            <p>
              Every venue in our directory goes through a multi-step verification
              process:
            </p>
            <ol className="ml-4 list-decimal space-y-2">
              <li>
                <strong className="text-forest">Discovery</strong> — We
                identify venues through curated research, local recommendations,
                and industry contacts.
              </li>
              <li>
                <strong className="text-forest">Menu analysis</strong> — We
                review current drink menus for NA cocktails, spirits, and
                creative non-alcoholic options.
              </li>
              <li>
                <strong className="text-forest">Review mining</strong> — We
                analyse guest reviews that mention non-alcoholic experiences for
                real-world signal.
              </li>
              <li>
                <strong className="text-forest">Scoring</strong> — Each venue is
                scored across criteria including: number of NA options, use of
                named NA spirits, house-made elements, dedicated menu sections,
                and zero-proof pairings.
              </li>
              <li>
                <strong className="text-forest">Human review</strong> — Every
                score is reviewed by our team before publication. We err on the
                side of caution.
              </li>
            </ol>
          </div>
        </section>

        {/* Corrections */}
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-forest">
            Something wrong?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-forest/70">
            Menus change, programmes evolve, and we might have missed something.
            If you think a venue&rsquo;s score is off — or if you know a place
            we should add — we want to hear from you.
          </p>
          <a
            href="mailto:hello@drytrip.co?subject=Venue correction"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-forest px-5 py-3 text-sm font-medium text-linen transition-opacity hover:opacity-90"
          >
            Submit a Correction
          </a>
        </section>
      </div>

      <Footer />
    </div>
  );
}
