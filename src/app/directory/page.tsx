"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Droplets,
  Sparkles,
  ArrowUpRight,
  Instagram,
  Search,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import type { Venue } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Filter options                                                     */
/* ------------------------------------------------------------------ */

const CATEGORIES = ["All", "Bar", "Restaurant", "Hotel"] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DirectoryPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState<string>("All Cities");
  const [category, setCategory] = useState<string>("All");

  /* Derive available cities from the loaded venue data */
  const cities = useMemo(() => {
    const unique = Array.from(new Set(venues.map((v) => v.city))).sort();
    return ["All Cities", ...unique];
  }, [venues]);

  /* Fetch published venues from Supabase */
  useEffect(() => {
    async function fetchVenues() {
      try {
        const { data, error } = await supabase
          .from("venues")
          .select("*")
          .order("dry_score", { ascending: false });

        if (!error && data) {
          setVenues(data as Venue[]);
        }
      } catch {
        // Supabase may not be configured yet — handled by empty state
      }
      setLoading(false);
    }
    fetchVenues();
  }, []);

  /* Client-side filtering */
  const filtered = useMemo(() => {
    return venues.filter((v) => {
      if (city !== "All Cities" && v.city !== city) return false;
      if (category !== "All" && v.category !== category) return false;
      return true;
    });
  }, [venues, city, category]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-6 md:px-12">
        <a href="/" className="transition-opacity hover:opacity-70">
          <Logo />
        </a>
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-forest">Directory</span>
          <a
            href="/#waitlist"
            className="text-sm font-medium text-forest/55 transition-colors hover:text-forest"
          >
            Waitlist
          </a>
        </div>
      </nav>

      {/* ── Page title ──────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-8 pb-6 md:px-12 md:pt-16">
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-forest md:text-5xl">
          Venue Directory
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-forest/55 md:text-lg">
          Curated spaces with exceptional non-alcoholic programs, rated by our
          scouts.
        </p>
      </section>

      {/* ── Sticky filter bar ───────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-sandstone/30 bg-linen/95 backdrop-blur-sm">
        <section className="mx-auto max-w-6xl px-6 py-4 md:px-12">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* City pills */}
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium tracking-wide transition-all ${
                  city === c
                    ? "bg-forest text-linen shadow-sm"
                    : "border border-forest/12 text-forest/55 hover:border-forest/25 hover:text-forest/80"
                }`}
              >
                {c}
              </button>
            ))}

            {/* Divider */}
            <div className="mx-1 hidden h-6 w-px bg-sandstone/40 sm:block" />

            {/* Category pills */}
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-[13px] font-medium tracking-wide transition-all ${
                  category === cat
                    ? "bg-forest text-linen shadow-sm"
                    : "border border-forest/12 text-forest/55 hover:border-forest/25 hover:text-forest/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ── Results grid ────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 pt-8 pb-16 md:px-12">
        {/* Result count */}
        {!loading && filtered.length > 0 && (
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/30">
            {filtered.length} venue{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((venue) => (
              <VenueCard key={`${venue.name}-${venue.city}`} venue={venue} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer
        className="border-t border-sandstone/40 px-6 py-8 md:px-12"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-serif text-sm text-forest/40">
            &copy; {new Date().getFullYear()} Dry Trip
          </span>
          <a
            href="https://www.instagram.com/drytrip.co"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-forest/40 transition-colors hover:text-forest"
          >
            <Instagram className="size-4" />
            <span>Follow us</span>
          </a>
        </div>
      </footer>
    </div>
  );
}

/* ================================================================== */
/*  Venue Card                                                         */
/* ================================================================== */

function VenueCard({ venue }: { venue: Venue }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <article className="group overflow-hidden rounded-2xl border border-sandstone/40 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-sandstone/15">
        {venue.image_url && !imgErr ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={venue.image_url}
            alt={venue.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Droplets className="size-10 text-sandstone/50" />
          </div>
        )}

        {/* Dry Score badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-sandstone px-3.5 py-1.5 shadow-sm">
          <Droplets className="size-3.5 text-forest" />
          <span className="text-sm font-bold tabular-nums text-forest">
            {venue.dry_score.toFixed(1)}
          </span>
          <span className="text-[11px] font-medium text-forest/50">/5</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Venue name → links to website */}
        <h3 className="font-serif text-xl font-semibold leading-snug text-forest">
          <a
            href={venue.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-forest/70"
          >
            {venue.name}
          </a>
        </h3>

        {/* City · Category in small caps */}
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest/40">
          {venue.city}
          <span className="mx-1.5 text-sandstone">·</span>
          {venue.category}
        </p>

        {/* Top NA drink highlight */}
        {venue.top_na_drink && venue.top_na_drink !== "N/A" && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-linen px-3.5 py-3">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-sandstone" />
            <p className="text-[13px] leading-relaxed text-forest/65">
              {venue.top_na_drink}
            </p>
          </div>
        )}

        {/* Menu link */}
        {venue.menu_url && (
          <a
            href={venue.menu_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-forest/45 transition-colors hover:text-forest"
          >
            View Menu
            <ArrowUpRight className="size-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

/* ================================================================== */
/*  Empty State                                                        */
/* ================================================================== */

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-20 text-center md:py-28">
      <div className="flex size-16 items-center justify-center rounded-full bg-sandstone/25">
        <Search className="size-7 text-forest/30" />
      </div>
      <h3 className="mt-6 font-serif text-2xl font-semibold text-forest">
        Coming Soon
      </h3>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-forest/50">
        Our scouts are currently rating this city.
        <br />
        Join the waitlist for updates.
      </p>
      <a
        href="/#waitlist"
        className="mt-8 rounded-full bg-forest px-7 py-3 text-sm font-medium text-linen transition-colors hover:bg-forest/90"
      >
        Join Waitlist
      </a>
    </div>
  );
}

/* ================================================================== */
/*  Loading Skeleton                                                   */
/* ================================================================== */

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-sandstone/25 bg-white"
        >
          <div className="aspect-[16/10] animate-pulse bg-sandstone/15" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 animate-pulse rounded bg-sandstone/15" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-sandstone/10" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-linen" />
          </div>
        </div>
      ))}
    </div>
  );
}
