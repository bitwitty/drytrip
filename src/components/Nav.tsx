"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/directory/london", label: "Directory" },
  { href: "/edit", label: "The Edit" },
  { href: "/plan", label: "Plan a Trip" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav className="flex items-center justify-between px-6 py-6 md:px-12">
      <Link href="/" aria-label="Home">
        <Logo />
      </Link>

      {/* Desktop links */}
      <div className="hidden items-center gap-6 sm:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-forest/70 transition-colors hover:text-forest"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(true)}
        className="rounded-lg p-2 text-forest/70 transition-colors hover:text-forest sm:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-forest/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div className="absolute right-0 top-0 h-full w-72 bg-linen shadow-xl">
            <div className="flex items-center justify-between px-6 py-6">
              <span className="font-serif text-lg text-forest">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-forest/60 transition-colors hover:text-forest"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-col px-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-sandstone/30 py-4 text-base font-medium text-forest transition-colors hover:text-forest/70"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 px-6">
              <Link
                href="/#newsletter"
                onClick={() => setMenuOpen(false)}
                className="block w-full rounded-lg bg-forest px-5 py-3 text-center text-sm font-medium text-linen transition-opacity hover:opacity-90"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
