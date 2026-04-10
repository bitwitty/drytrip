import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Nav() {
  return (
    <nav className="flex items-center justify-between px-6 py-6 md:px-12">
      <Link href="/" aria-label="Home">
        <Logo />
      </Link>
      <div className="flex items-center gap-2 sm:gap-6">
        <Link
          href="/directory/london"
          className="rounded-lg px-3 py-2 text-sm font-medium text-forest/70 transition-colors hover:text-forest"
        >
          Directory
        </Link>
        <Link
          href="/edit"
          className="rounded-lg px-3 py-2 text-sm font-medium text-forest/70 transition-colors hover:text-forest"
        >
          The Edit
        </Link>
        <Link
          href="/plan"
          className="rounded-lg px-3 py-2 text-sm font-medium text-forest/70 transition-colors hover:text-forest"
        >
          Plan a Trip
        </Link>
      </div>
    </nav>
  );
}
