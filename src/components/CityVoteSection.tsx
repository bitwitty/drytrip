"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import CityVoteGrid from "./CityVoteGrid";
import WaitlistForm from "./WaitlistForm";
import { NewsletterEmbed } from "./NewsletterSignup";

export default function CityVoteSection() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  return (
    <>
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
            <CityVoteGrid
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
            />
          </div>
          {selectedCity ? (
            <div className="mx-auto mt-8 max-w-md">
              <p className="mb-3 text-center text-xs text-forest/60">
                Add your email to lock in your vote for {selectedCity}.
              </p>
              <WaitlistForm
                buttonText="Lock in my vote"
                successMessage="Vote counted."
                votedCity={selectedCity}
              />
            </div>
          ) : (
            <p className="mt-6 text-center text-xs text-forest/40">
              Pick a city, then add your email to lock in your vote.
            </p>
          )}
        </div>
      </section>

      {/* Newsletter signup */}
      <section
        id="newsletter"
        className="border-t border-sandstone/50 bg-white/40"
      >
        <div className="mx-auto max-w-2xl px-6 py-20 text-center md:px-12">
          <h2 className="font-serif text-3xl tracking-tight text-forest">
            Dry Dispatch
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-forest/70">
            One place worth your evening, exactly what to order, and how it
            scored. Every Thursday.
          </p>
          <div className="mx-auto mt-8 flex max-w-md justify-center">
            <NewsletterEmbed />
          </div>
        </div>
      </section>
    </>
  );
}
