"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { getStoredConsent } from "./CookieConsent";

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
    if (!key) return;

    const consent = getStoredConsent();

    posthog.init(key, {
      api_host: "/ingest",
      defaults: "2026-01-30",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_exceptions: true,
      // Opt out by default — CookieConsent calls opt_in_capturing() on accept
      opt_out_capturing_by_default: consent !== "accepted",
      debug: process.env.NODE_ENV === "development",
    });

    // If previously accepted, ensure capturing is on
    if (consent === "accepted") {
      posthog.opt_in_capturing();
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
