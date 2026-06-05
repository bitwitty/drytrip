"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import CityVoteGrid from "./CityVoteGrid";
import WaitlistForm from "./WaitlistForm";

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
          <p className="mt-6 text-center text-xs text-forest/40">
            {selectedCity
              ? `Sign up below to lock in your vote for ${selectedCity}.`
              : "Pick a city, then sign up to lock in your vote."}
          </p>
        </div>
      </section>

      {/* Newsletter signup */}
      <section
        id="newsletter"
        className="border-t border-sandstone/50 bg-white/40"
      >
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
              votedCity={selectedCity}
            />
          </div>
        </div>
      </section>
    </>
  );
}
