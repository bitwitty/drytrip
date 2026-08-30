"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

// Init at module level so it's synchronous — posthog.capture() calls in child
// components fire in useEffect (after mount), by which point init is complete.
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2026-01-30",
    capture_pageview: false, // handled by PostHogPageView for SPA navigation
    capture_pageleave: true,
  });
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply stored consent preference on mount
    const stored = localStorage.getItem("dry-trip-cookie-consent");
    if (stored === "declined") posthog.opt_out_capturing();
    else if (stored === "accepted") posthog.opt_in_capturing();
  }, []);

  return <>{children}</>;
}
