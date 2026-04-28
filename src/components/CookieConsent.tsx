"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";

const CONSENT_KEY = "dry-trip-cookie-consent";

export type ConsentState = "accepted" | "declined" | null;

export function getStoredConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_KEY) as ConsentState;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    posthog.opt_in_capturing();
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    posthog.opt_out_capturing();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-mist bg-linen px-6 py-5 shadow-[0_-4px_24px_rgba(27,48,34,0.06)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-forest/80">
          We use analytics cookies to understand how people use Dry Trip — which venues get attention,
          which AI suggestions land, and where we can improve.{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-forest">
            Privacy policy
          </a>
          .
        </p>
        <div className="flex shrink-0 items-center gap-4">
          <button
            onClick={decline}
            className="text-sm text-forest/50 underline underline-offset-2 hover:text-forest transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="rounded-lg bg-forest px-5 py-2 text-sm font-medium text-linen transition-colors hover:bg-forest/85"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
