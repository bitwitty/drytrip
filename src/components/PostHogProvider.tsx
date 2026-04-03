"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: "/ingest",
      defaults: "2026-01-30",
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
