import Link from "next/link";
import { Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-sandstone/50 px-6 py-8 md:px-12">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-serif text-sm text-forest/50">
            &copy; {new Date().getFullYear()} Dry Trip
          </span>
          <Link
            href="/privacy"
            className="text-xs text-forest/40 transition-colors hover:text-forest"
          >
            Privacy
          </Link>
        </div>
        <a
          href="https://www.instagram.com/drytrip.co"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-forest/50 transition-colors hover:text-forest"
        >
          <Instagram className="size-4" />
          <span>Follow us</span>
        </a>
      </div>
    </footer>
  );
}
