"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: "2026-05-30",
      capture_pageview: false, // handled by PostHogPageView for SPA navigation
      capture_pageleave: true, // powers scroll depth tracking
    });

    // Reapply stored consent so returning visitors don't silently lose their preference
    const stored = localStorage.getItem("dry-trip-cookie-consent");
    if (stored === "declined") posthog.opt_out_capturing();
    else if (stored === "accepted") posthog.opt_in_capturing();
  }, []);

  return <>{children}</>;
}
