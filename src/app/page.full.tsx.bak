import Image from "next/image";
import Link from "next/link";
import { Compass, Sparkles, Shield, Droplets, MapPin, Wine, Globe } from "lucide-react";
import WaitlistForm from "@/components/WaitlistForm";
import CityVoteGrid from "@/components/CityVoteGrid";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabaseAdmin } from "@/lib/supabase";
import type { Venue } from "@/lib/types";

export const revalidate = 86400; // revalidate once per day

const features = [
  {
    title: "The Directory",
    description:
      "Every venue clears an editor before it goes live. Each one chosen on purpose — one at a time, one city at a time. The directory grows by decision, not by crawl.",
    icon: Compass,
  },
  {
    title: "The Dry Score",
    description:
      "Every venue rated one to five against the same rubric. The rubric is public. When more cities launch, every venue everywhere will be scored on the same scale.",
    icon: Sparkles,
  },
  {
    title: "The Trip",
    description:
      "The trip you paid for, kept. You book your own flights, pick your own hotel, and keep your own schedule. Dry Trip makes sure day three is still yours.",
    icon: Shield,
  },
];

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  const timer = new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms));
  return Promise.race([promise, timer]);
}

async function getFeaturedVenue(): Promise<Venue | null> {
  try {
    const query = (async () => {
      const { data } = await supabaseAdmin
        .from("venues")
        .select("*")
        .eq("status", "Published")
        .eq("featured", true)
        .order("dry_score", { ascending: false })
        .limit(1)
        .single();
      return data as Venue | null;
    })();
    return await withTimeout(query, 5000, null);
  } catch {
    return null;
  }
}

async function getLondonVenueCount(): Promise<number> {
  try {
    const query = (async () => {
      const { count } = await supabaseAdmin
        .from("venues")
        .select("*", { count: "exact", head: true })
        .eq("status", "Published")
        .eq("city", "London");
      return count ?? 0;
    })();
    return await withTimeout(query, 5000, 0);
  } catch {
    return 0;
  }
}

async function getWaitlistCount(): Promise<number> {
  try {
    const query = (async () => {
      const { count } = await supabaseAdmin
        .from("waitlist")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    })();
    return await withTimeout(query, 5000, 0);
  } catch {
    return 0;
  }
}

export default async function Home() {
  const [featuredVenue, londonVenueCount, waitlistCount] = await Promise.all([
    getFeaturedVenue(),
    getLondonVenueCount(),
    getWaitlistCount(),
  ]);

  const londonCountDisplay = londonVenueCount > 0 ? londonVenueCount : 107;
  // Only show social proof if we have a meaningful number; round down to nearest 50
  const waitlistDisplay = waitlistCount > 50 ? Math.floor(waitlistCount / 50) * 50 : 0;

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dry Trip",
    url: "https://drytrip.co",
    logo: "https://drytrip.co/logo-full.png",
    description: "Editorially curated alcohol-free travel directory. Every venue scored on one rubric, built one city at a time.",
    sameAs: ["https://www.instagram.com/drytrip.co"],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dry Trip",
    url: "https://drytrip.co",
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Nav />

      {/* Hero */}
      <section id="main-content" className="mx-auto max-w-5xl px-6 pb-20 pt-16 md:px-12 md:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="font-serif text-3xl leading-tight tracking-tight text-forest sm:text-4xl md:text-5xl lg:text-6xl">
              Travel is architecturally alcoholic.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-forest/70">
              An editorially curated alcohol-free travel directory. Every venue
              clears an editor before it goes live. Every venue is scored on one
              rubric. Built one city at a time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/plan"
                className="inline-flex items-center justify-center rounded-lg bg-forest px-6 py-3 text-sm font-semibold text-linen shadow-sm transition-opacity hover:opacity-90"
              >
                Plan a trip
              </Link>
              <Link
                href="/directory/london"
                className="inline-flex items-center justify-center rounded-lg border border-sandstone/60 bg-white/60 px-6 py-3 text-sm font-semibold text-forest transition-colors hover:bg-white"
              >
                Browse the directory
              </Link>
            </div>
            <div className="mt-6">
              <p className="text-xs text-forest/50">
                Get notified when new cities launch
                {waitlistDisplay > 0 && (
                  <span className="ml-1.5 text-forest/40">· Join {waitlistDisplay}+ others</span>
                )}
              </p>
              <div className="mt-2 max-w-sm">
                <WaitlistForm
                  buttonText="Notify me"
                  successMessage="You're on the list."
                />
              </div>
              <p className="mt-3 text-xs text-forest/60">
                {londonCountDisplay} London venues. Every one individually audited.
              </p>
            </div>
          </div>

          {/* Featured venue card */}
          <div className="flex flex-col items-center lg:items-end">
            {featuredVenue ? (
              <Link href={`/venues/${featuredVenue.slug}`} className="group w-full max-w-sm">
                <article className="overflow-hidden rounded-2xl border border-sandstone/40 bg-white shadow-sm transition-shadow group-hover:shadow-md">
                  <div className="relative h-44 overflow-hidden bg-forest">
                    {featuredVenue.image_url && (
                      <Image
                        src={featuredVenue.image_url}
                        alt={featuredVenue.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 384px"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-forest/10" />
                    <div className="absolute inset-x-0 top-0 h-1 bg-sandstone/40" />
                    <div className="absolute bottom-0 left-0 right-0 px-5 pb-8">
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-sandstone">
                        {featuredVenue.category}
                      </span>
                      <h3 className="mt-1 font-serif text-2xl font-bold leading-snug text-linen">
                        {featuredVenue.name}
                      </h3>
                    </div>
                    <div className="absolute bottom-3 right-4 flex items-center gap-1.5 rounded-full bg-linen/15 px-3 py-1.5 backdrop-blur-sm">
                      <Droplets className="size-3.5 text-sandstone" />
                      <span className="text-sm font-semibold text-linen">
                        {featuredVenue.dry_score}
                      </span>
                      <span className="text-xs text-linen/50">/5</span>
                    </div>
                  </div>
                  <div className="p-5">
                    {featuredVenue.neighborhood && (
                      <div className="flex items-center gap-2 text-xs tracking-widest text-forest/50">
                        <MapPin className="size-3" />
                        <span className="uppercase">
                          {featuredVenue.neighborhood}, {featuredVenue.city}
                        </span>
                      </div>
                    )}
                    {featuredVenue.short_description && (
                      <p className="mt-3 text-sm leading-relaxed text-forest/70">
                        {featuredVenue.short_description}
                      </p>
                    )}
                    {featuredVenue.top_na_drink && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg bg-linen px-3 py-2">
                        <Wine className="size-4 shrink-0 text-forest/60" />
                        <div>
                          <span className="text-[10px] font-medium uppercase tracking-widest text-forest/60">
                            Top NA Drink
                          </span>
                          <p className="text-sm font-medium text-forest">
                            {featuredVenue.top_na_drink}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ) : (
              /* Fallback if no featured venue yet */
              <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-sandstone/40 bg-white p-8 text-center shadow-sm">
                <Droplets className="mx-auto size-10 text-forest/30" />
                <p className="mt-4 font-serif text-lg text-forest">
                  The directory
                </p>
                <p className="mt-2 text-sm text-forest/50">
                  {londonCountDisplay} London venues, cleared by the editor. Every one individually audited.
                </p>
                <Link
                  href="/directory/london"
                  className="mt-5 inline-block rounded-lg bg-forest px-5 py-2.5 text-sm font-medium text-linen transition-opacity hover:opacity-90"
                >
                  Browse the directory
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What is a Dry Score */}
      <section className="border-t border-sandstone/50 bg-white/40">
        <div className="mx-auto max-w-5xl px-6 py-16 md:px-12">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-serif text-3xl tracking-tight text-forest">
                The Dry Score
              </h2>
              <p className="mt-4 text-base leading-relaxed text-forest/70">
                A one-to-five score for how a venue actually handles the
                non-alcoholic side of the menu. Not whether there&rsquo;s
                sparkling water — that&rsquo;s table stakes — but whether the
                zero-proof list is real, whether the staff know it, and whether
                the place was chosen on purpose. The rubric is published in
                full. Every venue scored against it has also cleared an
                editor&rsquo;s desk before going live.
              </p>
              <Link
                href="/methodology"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-forest underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                Read the methodology &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { score: 1, label: "Nominal", color: "bg-forest/20" },
                { score: 2, label: "Some options", color: "bg-forest/40" },
                { score: 3, label: "Dedicated", color: "bg-forest/60" },
                { score: 4, label: "Excellent", color: "bg-forest/80" },
                { score: 5, label: "World-class", color: "bg-forest" },
              ].map(({ score, label, color }) => (
                <div key={score} className="flex flex-col items-center gap-2">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full ${color}`}
                  >
                    <span
                      className={`text-sm font-bold ${score >= 3 ? "text-linen" : "text-forest"}`}
                    >
                      {score}
                    </span>
                  </div>
                  <span className="text-center text-[10px] leading-tight text-forest/50">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-sandstone/50">
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-12">
          <h2 className="text-center font-serif text-3xl tracking-tight text-forest">
            What the directory is built on
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-linen">
                  <feature.icon className="size-6 text-forest" />
                </div>
                <h3 className="mt-4 font-serif text-lg text-forest">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-forest/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vote for next city */}
      <section className="border-t border-sandstone/50">
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-12">
          <div className="text-center">
            <Globe className="mx-auto size-8 text-forest/30" />
            <h2 className="mt-4 font-serif text-3xl tracking-tight text-forest">
              Where next?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-forest/70">
              London is live. The next city gets the same treatment — every
              venue audited, every score earned. Tell us where to go next.
            </p>
          </div>
          <div className="mt-12">
            <CityVoteGrid />
          </div>
          <p className="mt-6 text-center text-xs text-forest/40">
            Sign up below and we&rsquo;ll count your vote.
          </p>
        </div>
      </section>

      {/* Newsletter signup — below the fold */}
      <section id="newsletter" className="border-t border-sandstone/50 bg-white/40">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center md:px-12">
          <h2 className="font-serif text-3xl tracking-tight text-forest">
            The newsletter.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-forest/70">
            Editorial notes from the directory. New venues as they clear the
            editor. Occasional city edits. Written when there&rsquo;s something
            worth saying.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <WaitlistForm
              buttonText="Subscribe"
              successMessage="You're on the list. First dispatch when there's something worth sending."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
