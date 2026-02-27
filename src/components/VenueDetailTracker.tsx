"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export default function VenueDetailTracker({
  slug,
  name,
  category,
}: {
  slug: string;
  name: string;
  category: string;
}) {
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture("venue_detail_viewed", { slug, name, category });
  }, [posthog, slug, name, category]);

  return null;
}
