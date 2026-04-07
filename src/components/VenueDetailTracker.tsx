"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export default function VenueDetailTracker({
  slug,
  name,
  category,
}: {
  slug: string;
  name: string;
  category: string;
}) {
  useEffect(() => {
    posthog.capture("venue_detail_viewed", { slug, name, category });
  }, [slug, name, category]);

  return null;
}
