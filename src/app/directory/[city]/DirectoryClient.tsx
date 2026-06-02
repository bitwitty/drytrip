"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import posthog from "posthog-js";
import Image from "next/image";
import { Droplets, Wine, MapPin, Search, Sparkles, ArrowUpDown, Map, X } from "lucide-react";
import WaitlistForm from "@/components/WaitlistForm";
import type { Venue } from "@/lib/types";

const VenueMap = dynamic(() => import("@/components/VenueMap"), { ssr: false });

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CityConfig {
  display: string;
  dbValue: string;
  center: [number, number];
}

interface DirectoryClientProps {
  venues: Venue[];
  citySlug: string;
  cityConfig: CityConfig;
  cities: Record<string, CityConfig>;
  neighborhoods: string[];
}

const categories = ["All", "Hotel", "Restaurant", "Bar"] as const;

/* ------------------------------------------------------------------ */
/*  Client Page                                                        */
/* ------------------------------------------------------------------ */

export default function DirectoryClient({
  venues,
  citySlug,
  cityConfig,
  cities,
  neighborhoods,
}: DirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>("All");
  const [sortByScore, setSortByScore] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  function handleCategoryFilter(value: string) {
    setCategoryFilter(value);
    setNeighborhoodFilter("All");
    posthog?.capture("directory_filter_changed", { category: value, city: citySlug });
  }

  function handleNeighborhoodFilter(value: string) {
    setNeighborhoodFilter(value);
    posthog?.capture("directory_filter_changed", { neighbourhood: value, city: citySlug });
  }

  function handleMapToggle() {
    setMapOpen((o) => {
      const next = !o;
      if (next) posthog?.capture("directory_map_opened", { city: citySlug });
      return next;
    });
  }

  const q = searchQuery.trim().toLowerCase();

  let filtered = venues.filter((v) => {
    if (categoryFilter !== "All" && v.category !== categoryFilter) return false;
    if (neighborhoodFilter !== "All" && v.neighborhood !== neighborhoodFilter) return false;
    if (q) {
      const haystack = [
        v.name,
        v.neighborhood,
        v.short_description,
        ...(v.vibe_tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  if (sortByScore) {
    filtered = [...filtered].sort((a, b) => b.dry_score - a.dry_score);
  }

  return (
    <>
      {/* Header */}
      <header className="mx-auto max-w-5xl px-6 pb-4 pt-10 md:px-12 md:pt-16">
        <div className="flex items-baseline gap-2">
          {/* City title — single city for now, dropdown re-enabled when more cities launch */}
          <div>
            <span
              className="font-serif text-3xl font-semibold leading-tight tracking-tight text-forest sm:text-4xl md:text-5xl"
            >
              {cityConfig.display}
            </span>
          </div>

          <span className="font-serif text-3xl font-semibold leading-tight tracking-tight text-forest sm:text-4xl md:text-5xl">
            Venues
          </span>
        </div>

        <p className="mt-3 max-w-lg text-base leading-relaxed text-forest/60">
          Rated for the quality of their alcohol-free experience.
        </p>
      </header>

      {/* Search */}
      <section className="mx-auto max-w-5xl px-6 pb-4 md:px-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-forest/30" />
          <input
            type="text"
            aria-label="Search venues"
            placeholder="Search venues, neighbourhoods, vibes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={(e) => {
              const q = e.target.value.trim();
              if (q) posthog?.capture("directory_search_used", { query: q, city: citySlug });
            }}
            className="w-full rounded-xl border border-sandstone/40 bg-white py-3 pl-11 pr-10 text-sm text-forest placeholder:text-forest/30 focus:outline-none focus:ring-2 focus:ring-forest/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-forest/30 hover:text-forest/60"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-5xl px-6 pb-6 md:px-12">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Category */}
            <FilterGroup
              label="Category"
              options={categories}
              value={categoryFilter}
              onChange={handleCategoryFilter}
            />

            <div className="flex items-center gap-2">
            {/* Map toggle (mobile) */}
            <button
              onClick={handleMapToggle}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all md:hidden ${
                mapOpen
                  ? "bg-forest text-linen shadow-sm"
                  : "bg-sandstone/20 text-forest/60 hover:bg-sandstone/40"
              }`}
            >
              <Map className="size-3.5" />
              Map
            </button>

            {/* Sort toggle */}
            <button
              onClick={() => setSortByScore((s) => !s)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                sortByScore
                  ? "bg-forest text-linen shadow-sm"
                  : "bg-sandstone/20 text-forest/60 hover:bg-sandstone/40"
              }`}
            >
              <ArrowUpDown className="size-3.5" />
              Sort by Dry Score
            </button>
          </div>
        </div>

          {/* Neighbourhood */}
          {neighborhoods.length > 1 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-widest text-forest/60">
                Neighbourhood
              </span>
              <select
                value={neighborhoodFilter}
                onChange={(e) => handleNeighborhoodFilter(e.target.value)}
                className="rounded-lg border border-sandstone/40 bg-white px-3 py-1.5 text-sm font-medium text-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="All">All</option>
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              {neighborhoodFilter !== "All" && (
                <button
                  onClick={() => setNeighborhoodFilter("All")}
                  className="text-xs text-forest/60 underline underline-offset-2 hover:text-forest/60"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Map — desktop always visible, mobile toggleable */}
      <section className="mx-auto max-w-5xl px-6 pb-8 md:px-12">
        {/* Desktop map */}
        <div className="hidden md:block">
          <VenueMap
            venues={filtered}
            center={cityConfig.center}
            className="h-[350px] w-full"
          />
        </div>

        {/* Mobile map overlay */}
        {mapOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-linen md:hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="font-serif text-lg text-forest">Map</span>
              <button
                onClick={() => { setMapOpen(false); }}
                className="rounded-lg p-2 text-forest/60 hover:bg-sandstone/20"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 px-4 pb-4">
              <VenueMap
                venues={filtered}
                center={cityConfig.center}
                className="h-full w-full"
              />
            </div>
          </div>
        )}
      </section>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 pb-24 md:px-12">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((venue) => (
              <DirectoryVenueCard key={venue.id} venue={venue} onClickVenue={() => {
                posthog?.capture("directory_venue_clicked", {
                  slug: venue.slug,
                  name: venue.name,
                  category: venue.category,
                });
              }} />
            ))}

            {/* CTA card */}
            <Link
              href="/plan"
              className="group flex flex-col items-center justify-center rounded-2xl border border-dashed border-sandstone/60 bg-white/50 p-8 text-center transition-all hover:border-forest/30 hover:bg-white/80"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-forest/5">
                <Sparkles className="size-5 text-forest/60" />
              </div>
              <p className="mt-4 font-serif text-lg text-forest">
                Not finding what you need?
              </p>
              <p className="mt-1 text-sm text-forest/50">
                Plan a custom trip with our AI.
              </p>
            </Link>
          </div>
        )}
      </main>

      {/* Newsletter signup */}
      <section className="border-t border-sandstone/50 bg-white/40">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center md:px-12">
          <h2 className="font-serif text-2xl tracking-tight text-forest">
            New venues, weekly.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-forest/70">
            Get notified when new venues clear the editor. No spam.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <WaitlistForm
              buttonText="Subscribe"
              successMessage="You're on the list. First dispatch when there's something worth sending."
            />
          </div>
        </div>
      </section>
    </>
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
      <span className="mr-1 text-xs font-medium uppercase tracking-widest text-forest/60">
        {label}
      </span>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            aria-pressed={active}
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

function DirectoryVenueCard({ venue, onClickVenue }: { venue: Venue; onClickVenue?: () => void }) {
  return (
    <Link href={`/venues/${venue.slug}`} onClick={onClickVenue}>
      <article className="group overflow-hidden rounded-2xl border border-sandstone/40 bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* Card hero — image if available, typography fallback */}
        <div className="relative h-44 overflow-hidden bg-forest">
          {venue.image_url && (
            <Image
              src={venue.image_url}
              alt={venue.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-forest/10" />
          {/* Category accent line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-sandstone/40" />
          {/* Text */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-8">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-sandstone">
              {venue.category}
            </span>
            <h3 className="mt-1 font-serif text-2xl font-bold leading-snug text-linen">
              {venue.name}
            </h3>
          </div>
          {/* Dry Score badge */}
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 rounded-full bg-linen/15 px-3 py-1.5 backdrop-blur-sm">
            <Droplets className="size-3.5 text-sandstone" />
            <span className="text-sm font-semibold text-linen">
              {venue.dry_score}
            </span>
            <span className="text-xs text-linen/50">/5</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Neighborhood & City */}
          <div className="flex items-center gap-2 text-xs tracking-widest text-forest/50">
            <MapPin className="size-3" />
            <span className="uppercase">
              {venue.neighborhood ? `${venue.neighborhood}, ` : ""}{venue.city}
            </span>
          </div>

          {/* Short description */}
          {venue.short_description && (
            <p className="mt-3 text-sm leading-relaxed text-forest/70">
              {venue.short_description}
            </p>
          )}

          {/* Top NA Drink */}
          {venue.top_na_drink && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-linen px-3 py-2">
              <Wine className="size-4 shrink-0 text-forest/60" />
              <div>
                <span className="text-[10px] font-medium uppercase tracking-widest text-forest/60">
                  Top NA Drink
                </span>
                <p className="text-sm font-medium text-forest">
                  {venue.top_na_drink}
                </p>
              </div>
            </div>
          )}

          {/* CTA text link */}
          <p className="mt-4 text-xs font-medium text-forest/50 transition-colors group-hover:text-forest">
            View details &rarr;
          </p>
        </div>
      </article>
    </Link>
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
      <h3 className="mt-6 font-serif text-2xl text-forest">No venues yet</h3>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-forest/50">
        Our scouts are currently rating this city. Join the waitlist for updates.
      </p>
      <Link
        href="/#newsletter"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-linen transition-opacity hover:opacity-90"
      >
        Subscribe for Updates
      </Link>
    </div>
  );
}
