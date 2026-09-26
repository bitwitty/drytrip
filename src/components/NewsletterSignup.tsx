import { ArrowRight } from "lucide-react";

// Dry Dispatch (Substack) sign-up. Substack blocks sign-ups sent from other
// sites, so we use its own embed where there's room, and a link to its
// subscribe page in tight spots (hero, footer).

export const DRY_DISPATCH_URL = "https://drydispatch.substack.com";

export function NewsletterEmbed() {
  return (
    <iframe
      src={`${DRY_DISPATCH_URL}/embed`}
      title="Subscribe to Dry Dispatch"
      width="100%"
      height={320}
      loading="lazy"
      className="w-full rounded-lg border border-sandstone/60 bg-transparent"
      style={{ maxWidth: 480 }}
    />
  );
}

export function NewsletterButton({ label = "Subscribe to Dry Dispatch" }: { label?: string }) {
  return (
    <a
      href={`${DRY_DISPATCH_URL}/subscribe`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-forest px-6 py-3 font-medium text-linen transition-opacity hover:opacity-90"
    >
      {label}
      <ArrowRight className="size-4" />
    </a>
  );
}
