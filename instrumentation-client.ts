// Next.js 15.3+ client-side instrumentation hook.
// This file runs in the browser before the app renders, so it's the
// recommended place to initialize PostHog for App Router projects.
//
// IMPORTANT: Never combine this with a <PostHogProvider> useEffect-based
// init — that would double-initialize the singleton.

import posthog from "posthog-js";

const CONSENT_KEY = "dry-trip-cookie-consent";

// Read the GDPR consent state set by the CookieConsent banner.
// Defaults to opt-out so we never capture before the user accepts.
const consent =
  typeof window !== "undefined" ? localStorage.getItem(CONSENT_KEY) : null;
const accepted = consent === "accepted";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://eu.posthog.com",
  defaults: "2026-01-30",
  person_profiles: "identified_only",
  capture_pageview: false, // handled by PostHogPageView component for SPA navigation
  capture_exceptions: true,
  enable_heatmaps: true, // enables scroll depth tracking
  // Opt out by default — CookieConsent calls opt_in_capturing() on accept
  opt_out_capturing_by_default: !accepted,
  debug: process.env.NODE_ENV === "development",
});

// If the user previously accepted, ensure capturing is on.
if (accepted) {
  posthog.opt_in_capturing();
}
