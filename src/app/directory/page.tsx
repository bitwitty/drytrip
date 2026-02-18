"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { Droplets, Wine, MapPin, Instagram, Search } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Venue {
  id: string;
  name: string;
  city: string;
  category: string;
  image_url: string;
  dry_score: number;
  top_na_drink: string;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Filter options                                                     */
/* ------------------------------------------------------------------ */

const cities = ["All", "London", "NYC"] as const;
const categories = ["All", "Hotel", "Restaurant", "Bar"] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DirectoryPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  useEffect(() => {
    async function fetchVenues() {
      try {
        const { data, error } = await supabase
          .from("venues")
          .select("*")
          .eq("status", "Published");

        if (!error && data) {
          setVenues(data as Venue[]);
        }
      } catch {
        // Supabase client unavailable (missing env vars) — show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, []);

  const filtered = venues.filter((v) => {
    if (cityFilter !== "All" && v.city !== cityFilter) return false;
    if (categoryFilter !== "All" && v.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-linen">
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-6 md:px-12">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
        <Link
          href="/#waitlist"
          className="text-sm font-medium text-forest/70 transition-colors hover:text-forest"
        >
          Join Waitlist
        </Link>
      </nav>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="mx-auto max-w-5xl px-6 pb-8 pt-10 md:px-12 md:pt-16">
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-forest md:text-5xl">
          Venue Directory
        </h1>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-forest/60">
          Curated spaces rated for the clear-headed traveller.
        </p>
      </header>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-10 md:px-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
          {/* City */}
          <FilterGroup
            label="City"
            options={cities}
            value={cityFilter}
            onChange={setCityFilter}
          />

          {/* Category */}
          <FilterGroup
            label="Category"
            options={categories}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>
      </section>

      {/* ── Content ─────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-6 pb-24 md:px-12">
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((venue) => (
              <DirectoryVenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-sandstone/50 px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-serif text-sm text-forest/50">
            &copy; {new Date().getFullYear()} Dry Trip
          </span>
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
    </div>
  );
}

/* ================================================================== */
/*  Filter Group                                                       */
/* ================================================================== */

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-xs font-medium uppercase tracking-widest text-forest/40">
        {label}
      </span>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              active
                ? "bg-forest text-linen shadow-sm"
                : "bg-sandstone/20 text-forest/60 hover:bg-sandstone/40"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  Venue Card                                                         */
/* ================================================================== */

function DirectoryVenueCard({ venue }: { venue: Venue }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-sandstone/40 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-sandstone/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venue.image_url}
          alt={venue.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dry Score badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-sandstone px-3 py-1.5 shadow-sm">
          <Droplets className="size-3.5 text-forest" />
          <span className="text-sm font-semibold text-forest">
            {venue.dry_score.toFixed(1)}
          </span>
          <span className="text-xs text-forest/50">/5</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Name */}
        <h3 className="font-serif text-xl font-bold leading-snug text-forest">
          {venue.name}
        </h3>

        {/* City & Category — small caps */}
        <div className="mt-2 flex items-center gap-2 text-xs tracking-widest text-forest/50">
          <MapPin className="size-3" />
          <span className="uppercase">{venue.city}</span>
          <span className="text-sandstone">|</span>
          <span className="uppercase">{venue.category}</span>
        </div>

        {/* Top NA Drink */}
        {venue.top_na_drink && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-linen px-3 py-2">
            <Wine className="size-4 shrink-0 text-forest/60" />
            <div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-forest/40">
                Top NA Drink
              </span>
              <p className="text-sm font-medium text-forest">
                {venue.top_na_drink}
              </p>
            </div>
          </div>
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
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-sandstone/20">
        <Search className="size-7 text-forest/30" />
      </div>
      <h3 className="mt-6 font-serif text-2xl text-forest">
        No venues yet
      </h3>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-forest/50">
        Our scouts are currently rating this city. Join the waitlist for
        updates.
      </p>
      <Link
        href="/#waitlist"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-linen transition-opacity hover:opacity-90"
      >
        Join the Waitlist
      </Link>
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
          className="animate-pulse overflow-hidden rounded-2xl border border-sandstone/30 bg-white"
        >
          <div className="aspect-[4/3] bg-sandstone/15" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 rounded bg-sandstone/15" />
            <div className="h-3 w-1/2 rounded bg-sandstone/10" />
            <div className="h-10 w-full rounded-lg bg-sandstone/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
