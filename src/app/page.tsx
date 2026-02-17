import { Compass, Sparkles, Shield } from "lucide-react";
import VenueCard from "@/components/VenueCard";
import WaitlistForm from "@/components/WaitlistForm";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 md:px-12">
        <span className="font-serif text-2xl tracking-tight text-forest">
          Dry Trip
        </span>
        <a
          href="#waitlist"
          className="text-sm font-medium text-forest/70 transition-colors hover:text-forest"
        >
          Join Waitlist
        </a>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 md:px-12 md:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="font-serif text-4xl leading-tight tracking-tight text-forest md:text-5xl lg:text-6xl">
              Luxury travel, hold the hangover.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-forest/70">
              The first travel directory and AI planner built for clear-headed
              luxury.
            </p>
            <div className="mt-8" id="waitlist">
              <WaitlistForm />
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <VenueCard />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-sandstone/50 bg-white/40">
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-12">
          <h2 className="text-center font-serif text-3xl tracking-tight text-forest">
            What makes Dry Trip different
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: Compass,
                title: "Curated Directory",
                description:
                  "Every hotel, restaurant, and experience rated on its alcohol-free offerings.",
              },
              {
                icon: Sparkles,
                title: "AI Trip Planner",
                description:
                  "Build a full itinerary tailored to clear-headed luxury — in seconds.",
              },
              {
                icon: Shield,
                title: "Dry Score",
                description:
                  "Our proprietary rating so you know exactly what to expect before you book.",
              },
            ].map((feature) => (
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

      {/* Footer */}
      <footer className="border-t border-sandstone/50 px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-serif text-sm text-forest/50">
            &copy; {new Date().getFullYear()} Dry Trip
          </span>
          <span className="text-xs text-forest/40">
            Travel clearly.
          </span>
        </div>
      </footer>
    </div>
  );
}
