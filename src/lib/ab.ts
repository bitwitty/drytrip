export type Variant = "A" | "B";

export function getVariant(): Variant {
  if (typeof document === "undefined") return "A";

  const match = document.cookie.match(/(?:^|; )dt_variant=(A|B)/);
  if (match) return match[1] as Variant;

  const variant: Variant = Math.random() < 0.5 ? "A" : "B";
  document.cookie = `dt_variant=${variant}; path=/; max-age=${60 * 60 * 24 * 90}`;
  return variant;
}

export const copy = {
  A: {
    headline: "Travel at full resolution.",
    subheadline:
      "Browse destinations scored for clarity-first experiences, then build your own itinerary with our AI planner. No compromises, no fine print — just sharper travel, curated by you.",
    ctaButton: "Join the Waitlist",
    ctaMicro: "We\u2019ll notify you at launch. No spam, no fluff.",
    featuresHeading: "How it works",
    features: [
      {
        title: "Every destination, scored for clarity",
        description:
          "Our proprietary Dry Score rates hotels, restaurants, bars, and experiences worldwide — so you know exactly what to expect before you book.",
      },
      {
        title: "Plan on your terms",
        description:
          "Use our AI-powered trip planner to build itineraries around how you want to feel, not what you need to avoid.",
      },
      {
        title: "Travel without trade-offs",
        description:
          "Sharp mornings. Elevated nights. Full autonomy over every detail of your trip.",
      },
    ],
    closingHeadline: "The waitlist is open.",
    closingBody:
      "Dry Trip launches soon for a select group of travellers who\u2019ve already decided that clarity isn\u2019t a compromise — it\u2019s the standard.",
    closingCta: "Get Early Access",
    successMessage:
      "You just made the list. Sharp mornings, elevated everywhere — this is travel with full autonomy.",
  },
  B: {
    headline: "Elevated travel for the clear-headed.",
    subheadline:
      "Browse destinations scored for clarity-first experiences, then build your own itinerary with our AI planner. No compromises, no fine print — just sharper travel, curated by you.",
    ctaButton: "Join the Waitlist",
    ctaMicro: "Be the first to plan sharper trips.",
    featuresHeading: "Built for how you actually want to travel",
    features: [
      {
        title: "The Dry Score",
        description:
          "A curated rating system that indexes destinations by the quality of their wellness-forward dining, nightlife, and experiences. One number. Full picture.",
      },
      {
        title: "AI-powered trip planning",
        description:
          "Tell us where and when. Our planner builds clarity-first itineraries tailored to your preferences — no research rabbit holes required.",
      },
      {
        title: "Your trip, your rules",
        description:
          "Every recommendation is a starting point, not a prescription. Edit, swap, and refine until the itinerary is yours.",
      },
    ],
    closingHeadline: "Sharp travellers move first.",
    closingBody:
      "We\u2019re launching to a small group of early members. Get on the list and you\u2019ll be the first to access the Dry Score directory and AI planner.",
    closingCta: "Get Early Access",
    successMessage:
      "Consider this your invitation. The sharpest travellers don\u2019t leave their mornings to chance.",
  },
} as const;
