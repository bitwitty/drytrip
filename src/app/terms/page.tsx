import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms for using drytrip.co and the Dry Trip trip planner.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-linen">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-forest md:text-5xl">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm text-forest/50">Last updated: September 2026</p>

        <div className="mt-10 space-y-8 text-forest/80 leading-relaxed">
          <section>
            <h2 className="font-serif text-xl text-forest">About these terms</h2>
            <p className="mt-2">
              These terms apply to your use of drytrip.co, including the directory, articles and
              the AI trip planner (together, &ldquo;Dry Trip&rdquo;). By using Dry Trip you agree to
              them. If you don&rsquo;t agree, please don&rsquo;t use the site.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">Our information</h2>
            <p className="mt-2">
              Dry Trip is an editorial guide. We audit venues carefully, but menus, opening hours
              and availability change without notice. Always check with the venue before you go.
              Dry Scores and descriptions are our editorial opinion. We don&rsquo;t guarantee that
              any information is complete, current or accurate, and we&rsquo;re not responsible for
              the services provided by venues.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">The AI trip planner</h2>
            <p className="mt-2">
              The trip planner uses an AI model to turn our directory into suggestions. It can make
              mistakes. Treat its answers as a starting point, not professional advice, and check
              details with venues directly. Please don&rsquo;t enter sensitive personal information
              into the chat. Use of the planner is subject to reasonable usage limits.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">Links and bookings</h2>
            <p className="mt-2">
              Dry Trip links to venue websites and booking pages run by third parties. Any booking
              you make is between you and that venue or provider, on their terms. We&rsquo;re not
              responsible for third-party sites.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">Acceptable use</h2>
            <p className="mt-2">
              Please don&rsquo;t misuse Dry Trip: no scraping or bulk copying of the directory, no
              automated or abusive use of the trip planner, no attempts to interfere with the site
              or access areas you&rsquo;re not authorised to use.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">Intellectual property</h2>
            <p className="mt-2">
              The Dry Trip name, logo, Dry Score, text and design are ours (or used with
              permission). You&rsquo;re welcome to share links and short quotes with credit. Venue
              names and trademarks belong to their owners.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">Liability</h2>
            <p className="mt-2">
              Dry Trip is provided free of charge and &ldquo;as is&rdquo;. To the extent the law
              allows, we&rsquo;re not liable for any loss arising from your use of the site or
              reliance on its content. Nothing in these terms limits liability that can&rsquo;t be
              limited by law, or your statutory rights as a consumer.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">Changes and contact</h2>
            <p className="mt-2">
              We may update these terms from time to time; the date above shows the latest
              version. Questions? Email{" "}
              <a href="mailto:hello@drytrip.co" className="underline hover:text-forest">
                hello@drytrip.co
              </a>{" "}
              or see our{" "}
              <Link href="/privacy" className="underline hover:text-forest">
                privacy policy
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
