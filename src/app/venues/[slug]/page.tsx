import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Droplets, Wine, MapPin, Globe, Clock, DollarSign, ExternalLink, CheckCircle } from "lucide-react";
import { Sparkles } from "lucide-react";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";
import VenueMapClient from "@/components/VenueMapClient";
import VenueDetailTracker from "@/components/VenueDetailTracker";
import type { Venue } from "@/lib/types";

export const revalidate = 86400; // revalidate venue pages once per day

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenue(slug).catch(() => null);

  if (!venue) return { title: "Venue Not Found" };

  const description =
    venue.short_description ??
    `${venue.name} is a ${venue.category.toLowerCase()} in ${venue.neighborhood ?? "London"} with a Dry Score of ${venue.dry_score}/5.`;

  return {
    title: venue.name,
    description,
    openGraph: {
      title: `${venue.name} | Dry Trip`,
      description,
      ...(venue.image_url ? { images: [{ url: venue.image_url }] } : {}),
    },
    twitter: {
      card: venue.image_url ? "summary_large_image" : "summary",
      title: `${venue.name} | Dry Trip`,
      description,
    },
  };
}

export async function generateStaticParams() {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 5000)
    );
    const query = supabaseAdmin
      .from("venues")
      .select("slug")
      .eq("status", "Published");

    const { data } = await Promise.race([query, timeout]);
    return (data ?? []).map((v) => ({ slug: v.slug as string }));
  } catch {
    // If Supabase is unreachable at build time, skip pre-rendering.
    // Pages will be generated on-demand on first request via ISR.
    return [];
  }
}

async function getVenue(slug: string): Promise<Venue | null> {
  try {
    const { data } = await supabase
      .from("venues")
      .select("*")
      .eq("slug", slug)
      .eq("status", "Published")
      .single();

    return data as Venue | null;
  } catch {
    return null;
  }
}

async function getRelatedVenues(venue: Venue): Promise<Venue[]> {
  try {
    const { data } = await supabase
      .from("venues")
      .select("*")
      .eq("status", "Published")
      .neq("id", venue.id)
      .eq("city", venue.city)
      .order("dry_score", { ascending: false })
      .limit(12);

    if (!data) return [];

    const others = data as Venue[];

    // Use lat/lng proximity if coords are available, otherwise fall back to neighborhood match
    if (venue.latitude != null && venue.longitude != null) {
      const withDistance = others
        .filter((v) => v.latitude != null && v.longitude != null)
        .map((v) => ({
          venue: v,
          dist: Math.hypot(v.latitude! - venue.latitude!, v.longitude! - venue.longitude!),
        }));
      withDistance.sort((a, b) => a.dist - b.dist);
      return withDistance.slice(0, 3).map((d) => d.venue);
    }

    // Fallback: neighborhood + category scoring
    const scored = others.map((v) => ({
      venue: v,
      score:
        (v.neighborhood === venue.neighborhood ? 2 : 0) +
        (v.category === venue.category ? 1 : 0),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map((s) => s.venue);
  } catch {
    return [];
  }
}

function formatVerifiedDate(dateStr: string): string | null {
  const date = new Date(dateStr);
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  if (date < sixMonthsAgo) return null; // stale — hide it
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function getCTAText(category: string): string {
  switch (category) {
    case "Hotel":
      return "Check Availability";
    case "Restaurant":
      return "Reserve a Table";
    default:
      return "Visit Website";
  }
}

function getDryScoreLabel(score: number): string {
  if (score >= 5) return "World-class alcohol-free programme";
  if (score >= 4) return "Excellent NA options with craft cocktails";
  if (score >= 3) return "Dedicated NA section with solid variety";
  if (score >= 2) return "Some NA cocktails worth exploring";
  return "Basic non-alcoholic options available";
}

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) notFound();

  const related = await getRelatedVenues(venue);
  const outboundUrl = venue.booking_url || venue.website_url;
  const verifiedDate = venue.last_verified ? formatVerifiedDate(venue.last_verified) : null;
  // Build nearby venues for mini-map (current venue + related)
  const mapVenues = [venue, ...related];

  // Build recommendation bullets from description
  const bullets: string[] = [];
  if (venue.description && venue.description !== "INSUFFICIENT_DATA") {
    // Descriptions use "• " bullet format — split on that first
    if (venue.description.includes("•")) {
      bullets.push(
        ...venue.description
          .split("•")
          .map((s) => s.replace(/^[\s·]+|[\s]+$/g, ""))
          .filter((s) => s.length > 10)
          .slice(0, 3)
      );
    } else {
      const sentences = venue.description.split(/\.\s+/).filter((s) => s.length > 20);
      bullets.push(...sentences.slice(0, 3).map((s) => s.replace(/\.$/, "")));
    }
  }

  return (
    <div className="min-h-screen bg-linen">
      <VenueDetailTracker slug={venue.slug} name={venue.name} category={venue.category} />
      <Nav />

      {/* Dark typographic hero */}
      <section className="relative overflow-hidden bg-forest">
        {venue.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venue.image_url}
            alt={venue.name}
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        )}
        <div className="relative mx-auto max-w-5xl px-6 pb-12 pt-16 md:px-12 md:pt-20">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-linen/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-sandstone">
              {venue.category}
            </span>
            {venue.neighborhood && (
              <span className="flex items-center gap-1 text-xs text-linen/50">
                <MapPin className="size-3" />
                {venue.neighborhood}, London
              </span>
            )}
          </div>

          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-linen md:text-5xl lg:text-6xl">
            {venue.name}
          </h1>

          {/* Dry Score */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-linen/15 px-4 py-2 backdrop-blur-sm">
              <Droplets className="size-4 text-sandstone" />
              <span className="text-lg font-bold text-linen">
                {venue.dry_score}
              </span>
              <span className="text-sm text-linen/50">/5</span>
            </div>
            <p className="text-sm text-linen/60">
              {getDryScoreLabel(venue.dry_score)}
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-5xl px-6 py-12 md:px-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Left column — details */}
          <div className="lg:col-span-2">
            {/* Short description */}
            {venue.short_description && (
              <p className="text-lg leading-relaxed text-forest/80">
                {venue.short_description}
              </p>
            )}

            {/* Why we recommend it */}
            {bullets.length > 0 && (
              <div className="mt-8">
                <h2 className="font-serif text-2xl text-forest">
                  Why we recommend it
                </h2>
                <ul className="mt-4 space-y-3">
                  {bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm leading-relaxed text-forest/70"
                    >
                      <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-sandstone" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mini map */}
            {venue.latitude != null && venue.longitude != null && (
              <div className="mt-8">
                <VenueMapClient
                  venues={mapVenues}
                  center={[venue.longitude, venue.latitude]}
                  zoom={15}
                  highlightId={venue.id}
                  className="h-[250px] w-full"
                />
              </div>
            )}

            {/* Top NA drink spotlight */}
            {venue.top_na_drink && (
              <div className="mt-8 rounded-2xl border border-sandstone/30 bg-white p-6">
                <div className="flex items-center gap-2">
                  <Wine className="size-5 text-forest/60" />
                  <h3 className="text-xs font-medium uppercase tracking-widest text-forest/40">
                    Top NA Drink
                  </h3>
                </div>
                <p className="mt-2 font-serif text-xl font-semibold text-forest">
                  {venue.top_na_drink}
                </p>
                {venue.na_drink_count && venue.na_drink_count > 1 && (
                  <p className="mt-1 text-sm text-forest/50">
                    Plus {venue.na_drink_count - 1} more non-alcoholic options
                  </p>
                )}
              </div>
            )}

            {/* Vibe tags */}
            {venue.vibe_tags && venue.vibe_tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {venue.vibe_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-sandstone/20 px-3 py-1 text-xs font-medium text-forest/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right column — sidebar */}
          <div className="space-y-6">
            {/* Booking CTA */}
            {outboundUrl && (
              <a
                href={`/go/${venue.id}?source=detail_page`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber px-6 py-4 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                {getCTAText(venue.category)}
                <ExternalLink className="size-4" />
              </a>
            )}

            {/* Key details */}
            <div className="rounded-2xl border border-sandstone/30 bg-white p-6">
              <h3 className="text-xs font-medium uppercase tracking-widest text-forest/40">
                Details
              </h3>
              <dl className="mt-4 space-y-4">
                {venue.neighborhood && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-forest/40" />
                    <div>
                      <dt className="text-xs text-forest/40">Neighborhood</dt>
                      <dd className="text-sm font-medium text-forest">
                        {venue.neighborhood}
                      </dd>
                    </div>
                  </div>
                )}

                {venue.price_range && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="mt-0.5 size-4 shrink-0 text-forest/40" />
                    <div>
                      <dt className="text-xs text-forest/40">Price Range</dt>
                      <dd className="text-sm font-medium text-forest">
                        {venue.price_range}
                      </dd>
                    </div>
                  </div>
                )}

                {venue.hours_note && (
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-forest/40" />
                    <div>
                      <dt className="text-xs text-forest/40">Hours</dt>
                      <dd className="text-sm font-medium text-forest">
                        {venue.hours_note}
                      </dd>
                    </div>
                  </div>
                )}

                {venue.website_url && (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 size-4 shrink-0 text-forest/40" />
                    <div>
                      <dt className="text-xs text-forest/40">Website</dt>
                      <dd className="text-sm">
                        <a
                          href={venue.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-forest underline underline-offset-2 transition-colors hover:text-forest/70"
                        >
                          {(() => {
                            try {
                              return new URL(venue.website_url!).hostname.replace("www.", "");
                            } catch {
                              return "Website";
                            }
                          })()}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}

                {verifiedDate && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-sage" />
                    <div>
                      <dt className="text-xs text-forest/40">Last verified</dt>
                      <dd className="text-sm font-medium text-forest">{verifiedDate}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            {/* Features */}
            {(venue.af_minibar || venue.zero_proof_pairing) && (
              <div className="rounded-2xl border border-sandstone/30 bg-white p-6">
                <h3 className="text-xs font-medium uppercase tracking-widest text-forest/40">
                  Features
                </h3>
                <ul className="mt-3 space-y-2">
                  {venue.af_minibar && (
                    <li className="flex items-center gap-2 text-sm text-forest">
                      <span className="size-1.5 rounded-full bg-sage" />
                      Alcohol-free minibar
                    </li>
                  )}
                  {venue.zero_proof_pairing && (
                    <li className="flex items-center gap-2 text-sm text-forest">
                      <span className="size-1.5 rounded-full bg-sage" />
                      Zero-proof food pairings
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related venues */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-sandstone/30 pt-12">
            <h2 className="font-serif text-2xl text-forest">
              {venue.neighborhood
                ? `More in ${venue.neighborhood}`
                : `More ${venue.category.toLowerCase()}s in ${venue.city}`}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((v) => (
                <Link
                  key={v.id}
                  href={`/venues/${v.slug}`}
                  className="group rounded-2xl border border-sandstone/30 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-forest/40">
                    {v.category}
                  </span>
                  <h3 className="mt-1 font-serif text-lg font-bold text-forest">
                    {v.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <Droplets className="size-3 text-forest/40" />
                    <span className="text-sm font-medium text-forest">
                      {v.dry_score}/5
                    </span>
                    {v.neighborhood && (
                      <>
                        <span className="text-forest/20">·</span>
                        <span className="text-xs text-forest/50">
                          {v.neighborhood}
                        </span>
                      </>
                    )}
                  </div>
                  {v.short_description && (
                    <p className="mt-2 text-sm text-forest/60 line-clamp-2">
                      {v.short_description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* AI planner CTA */}
        <section className="mt-12 rounded-2xl border border-sandstone/30 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linen">
              <Sparkles className="size-5 text-forest" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-forest">
                Planning a trip around {venue.neighborhood ?? venue.city}?
              </h3>
              <p className="mt-1 text-sm text-forest/60">
                Our AI concierge builds itineraries using venues like {venue.name} —
                grounded in verified data, never hallucinated.
              </p>
              <Link
                href="/plan"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-sm font-medium text-linen transition-opacity hover:opacity-90"
              >
                Plan Your Trip
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter signup */}
        <section className="mt-8 mb-4">
          <p className="text-sm font-medium text-forest/60">
            Get weekly finds like these. No spam.
          </p>
          <div className="mt-3 max-w-md">
            <WaitlistForm
              buttonText="Subscribe"
              successMessage="You're in. Weekly intel, starting soon."
            />
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
