import { ArrowRight } from "lucide-react";

// Dry Dispatch (Substack) sign-up. Substack blocks sign-ups sent from other
// sites, so we use its own embed. Tight spots (hero, footer) get an on-brand
// button that jumps to the full embed in the home page newsletter band.

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

export function NewsletterButton({
  label = "Get Dry Dispatch",
  href = "/#newsletter",
}: {
  label?: string;
  href?: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-forest px-6 py-3 font-medium text-linen transition-opacity hover:opacity-90"
    >
      {label}
      <ArrowRight className="size-4" />
    </a>
  );
}
