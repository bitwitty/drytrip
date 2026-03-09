import Link from "next/link";
import { Compass, Sparkles, Shield, Droplets, MapPin, Wine } from "lucide-react";
import WaitlistForm from "@/components/WaitlistForm";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabaseAdmin } from "@/lib/supabase";
import type { Venue } from "@/lib/types";

export const revalidate = 86400; // revalidate once per day

const features = [
  {
    title: "Every venue, scored for clarity",
    description:
      "Our proprietary Dry Score rates hotels, restaurants, and bars — so you know exactly what to expect before you book.",
    icon: Compass,
  },
  {
    title: "Plan on your terms",
    description:
      "Use our AI-powered trip planner to build itineraries around how you want to feel, not what you need to avoid.",
    icon: Sparkles,
  },
  {
    title: "Travel without trade-offs",
    description:
      "Sharp mornings. Elevated nights. Full autonomy over every detail of your trip.",
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

async function getVenueCount(): Promise<number> {
  try {
    const query = (async () => {
      const { count } = await supabaseAdmin
        .from("venues")
        .select("*", { count: "exact", head: true })
        .eq("status", "Published");
      return count ?? 0;
    })();
    return await withTimeout(query, 5000, 0);
  } catch {
    return 0;
  }
}

export default async function Home() {
  const [featuredVenue, venueCount] = await Promise.all([
    getFeaturedVenue(),
    getVenueCount(),
  ]);

  const countLabel =
    venueCount > 0 ? `${venueCount}+ verified venues` : "40+ verified venues";

  return (
    <div className="min-h-screen">
      <Nav />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 md:px-12 md:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="font-serif text-4xl leading-tight tracking-tight text-forest md:text-5xl lg:text-6xl">
              Clear-headed luxury travel.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-forest/70">
              AI-powered trip planning backed by verified alcohol-free venue
              data. No guesswork. No judgment. No hangovers.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/plan"
                className="inline-flex items-center justify-center rounded-lg bg-forest px-6 py-3 text-sm font-semibold text-linen shadow-sm transition-opacity hover:opacity-90"
              >
                Start Planning
              </Link>
              <Link
                href="/directory/london"
                className="inline-flex items-center justify-center rounded-lg border border-sandstone/60 bg-white/60 px-6 py-3 text-sm font-semibold text-forest transition-colors hover:bg-white"
              >
                Browse the Directory
              </Link>
            </div>
            <p className="mt-4 text-xs text-forest/40">{countLabel} across 7 cities</p>
          </div>

          {/* Featured venue card */}
          <div className="flex flex-col items-center lg:items-end">
            {featuredVenue ? (
              <Link href={`/venues/${featuredVenue.slug}`} className="group w-full max-w-sm">
                <article className="overflow-hidden rounded-2xl border border-sandstone/40 bg-white shadow-sm transition-shadow group-hover:shadow-md">
                  <div className="relative h-44 overflow-hidden bg-forest">
                    {featuredVenue.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featuredVenue.image_url}
                        alt={featuredVenue.name}
                        className="absolute inset-0 h-full w-full object-cover"
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
                          <span className="text-[10px] font-medium uppercase tracking-widest text-forest/40">
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
                  Venues in 7 cities, rated.
                </p>
                <p className="mt-2 text-sm text-forest/50">
                  Browse {countLabel} with verified Dry Scores.
                </p>
                <Link
                  href="/directory/london"
                  className="mt-5 inline-block rounded-lg bg-forest px-5 py-2.5 text-sm font-medium text-linen transition-opacity hover:opacity-90"
                >
                  Explore the Directory
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
                What is a Dry Score?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-forest/70">
                Our 1–5 rating for the quality of a venue&rsquo;s
                alcohol-free experience — not just whether they have
                sparkling water. A Dry Score of 5 means a world-class
                zero-proof programme with craft cocktails, dedicated menus,
                and knowledgeable staff.
              </p>
              <Link
                href="/methodology"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-forest underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                How we rate venues &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { score: 5, label: "World-class", color: "bg-forest" },
                { score: 4, label: "Excellent", color: "bg-forest/80" },
                { score: 3, label: "Dedicated", color: "bg-forest/60" },
                { score: 2, label: "Some options", color: "bg-forest/40" },
                { score: 1, label: "Basic", color: "bg-forest/20" },
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
            How it works
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

      {/* Newsletter signup — below the fold */}
      <section className="border-t border-sandstone/50 bg-white/40">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center md:px-12">
          <h2 className="font-serif text-3xl tracking-tight text-forest">
            Weekly alcohol-free travel tips.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-forest/70">
            New venues, itineraries, and zero-proof finds — sent to you every
            week. No spam.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <WaitlistForm
              buttonText="Subscribe"
              successMessage="You're in. Expect smart, honest travel intel every week."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
