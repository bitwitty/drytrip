import Link from "next/link";
import { Instagram } from "lucide-react";
import { Logo } from "@/components/Logo";
import { NewsletterButton } from "@/components/NewsletterSignup";

export default function Footer() {
  return (
    <footer className="border-t border-sandstone/50 px-6 py-12 md:px-12">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
        {/* Left — Brand */}
        <div>
          <Logo />
          <p className="mt-3 font-serif text-sm text-forest/50">
            &copy; {new Date().getFullYear()} Dry Trip
          </p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <Link href="/privacy" className="text-xs text-forest/60 transition-colors hover:text-forest">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-forest/60 transition-colors hover:text-forest">
              Terms
            </Link>
          </div>
        </div>

        {/* Middle — Navigation */}
        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-forest/60">
            Explore
          </h3>
          <nav className="mt-3 flex flex-col gap-2">
            <Link href="/directory/london" className="text-sm text-forest/70 transition-colors hover:text-forest">
              Directory
            </Link>
<Link href="/plan" className="text-sm text-forest/70 transition-colors hover:text-forest">
              Plan a Trip
            </Link>
            <Link href="/edit" className="text-sm text-forest/70 transition-colors hover:text-forest">
              The Edit
            </Link>
            <Link href="/methodology" className="text-sm text-forest/70 transition-colors hover:text-forest">
              Methodology
            </Link>
            <Link href="/about" className="text-sm text-forest/70 transition-colors hover:text-forest">
              About
            </Link>
            <Link href="/contact" className="text-sm text-forest/70 transition-colors hover:text-forest">
              Contact
            </Link>
          </nav>
        </div>

        {/* Right — Newsletter + Social */}
        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-forest/60">
            Stay in the loop
          </h3>
          <div className="mt-3">
            <NewsletterButton label="Subscribe" />
          </div>
          <a
            href="https://www.instagram.com/drytrip.co"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-forest/50 transition-colors hover:text-forest"
          >
            <Instagram className="size-4" />
            <span>Follow us on Instagram</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
