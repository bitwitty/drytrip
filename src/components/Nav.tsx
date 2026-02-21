import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Nav() {
  return (
    <nav className="flex items-center justify-between px-6 py-6 md:px-12">
      <Link href="/" aria-label="Home">
        <Logo />
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/directory/london"
          className="text-sm font-medium text-forest/70 transition-colors hover:text-forest"
        >
          Directory
        </Link>
        <Link
          href="/plan"
          className="text-sm font-medium text-forest/70 transition-colors hover:text-forest"
        >
          Plan a Trip
        </Link>
      </div>
    </nav>
  );
}
