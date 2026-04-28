"use client";

import { useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = `https://drytrip.co${url}`;

    // Use native share API on mobile if available
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-lg border border-sandstone/40 bg-white px-4 py-2.5 text-sm font-medium text-forest/70 transition-colors hover:bg-linen hover:text-forest"
      aria-label="Share this venue"
    >
      {copied ? (
        <>
          <Check className="size-4 text-sage" />
          Link copied
        </>
      ) : (
        <>
          <Share2 className="size-4" />
          Share
        </>
      )}
    </button>
  );
}
