"use client";

import { useState, useEffect } from "react";
import { Compass, Sparkles, Shield, Instagram } from "lucide-react";
import VenueCard from "@/components/VenueCard";
import WaitlistForm from "@/components/WaitlistForm";
import { Logo } from "@/components/Logo";
import { getVariant, copy, type Variant } from "@/lib/ab";

const featureIcons = [Compass, Sparkles, Shield];

export default function Home() {
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    setVariant(getVariant());
  }, []);

  if (!variant) return null;

  const c = copy[variant];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 md:px-12">
        <Logo />
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
              {c.headline}
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-forest/70">
              {c.subheadline}
            </p>
            <div className="mt-8" id="waitlist">
              <WaitlistForm
                variant={variant}
                buttonText={c.ctaButton}
                successMessage={c.successMessage}
              />
              <p className="mt-3 text-xs text-forest/40">{c.ctaMicro}</p>
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-end">
            <VenueCard />
            <p className="mt-2 text-xs italic text-forest/30">
              Fictitious venue shown for illustration purposes.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-sandstone/50 bg-white/40">
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-12">
          <h2 className="text-center font-serif text-3xl tracking-tight text-forest">
            {c.featuresHeading}
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {c.features.map((feature, i) => {
              const Icon = featureIcons[i];
              return (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-linen">
                    <Icon className="size-6 text-forest" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg text-forest">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest/60">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-sandstone/50">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center md:px-12">
          <h2 className="font-serif text-3xl tracking-tight text-forest">
            {c.closingHeadline}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-forest/70">
            {c.closingBody}
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <WaitlistForm
              variant={variant}
              buttonText={c.closingCta}
              successMessage={c.successMessage}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
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
