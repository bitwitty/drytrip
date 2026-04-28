"use client";

import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";

interface StickyBookingBarProps {
  venueName: string;
  ctaText: string;
  ctaUrl: string;
}

export default function StickyBookingBar({ venueName, ctaText, ctaUrl }: StickyBookingBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      // Show after scrolling past the hero (~400px)
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-sandstone/40 bg-linen/95 px-4 py-3 shadow-[0_-4px_24px_rgba(27,48,34,0.08)] backdrop-blur-sm lg:hidden">
      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-forest">
          {venueName}
        </p>
        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {ctaText}
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  );
}
