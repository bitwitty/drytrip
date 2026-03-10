import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Dry Trip collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        <h1 className="font-serif text-4xl font-light text-forest">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-forest/50">Last updated: March 2026</p>

        <div className="mt-10 space-y-8 text-forest/80 leading-relaxed">
          <section>
            <h2 className="font-serif text-xl text-forest">Who we are</h2>
            <p className="mt-2">
              Dry Trip (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;)
              operates the website at drytrip.co. We are a travel directory and
              AI trip planner focused on alcohol-free experiences.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">
              What data we collect
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Email address</strong> &mdash; when you join the
                waitlist, sign up via the AI chat email gate, or request a plan
                by email.
              </li>
              <li>
                <strong>Chat messages</strong> &mdash; conversations with our AI
                trip planner are processed in real time to generate
                recommendations. We do not store chat transcripts after your
                session ends.
              </li>
              <li>
                <strong>Usage analytics</strong> &mdash; we use PostHog to
                collect anonymised usage data (page views, feature usage, device
                type). No personally identifiable information is sent to
                PostHog.
              </li>
              <li>
                <strong>Click tracking</strong> &mdash; when you click through
                to a venue&rsquo;s external website, we record the venue and a
                random session ID to understand which venues are most useful.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">
              How we use your data
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To send you the trip plan you requested by email.</li>
              <li>
                To notify you when Dry Trip launches or adds new features (if
                you joined the waitlist).
              </li>
              <li>To improve the product based on aggregate usage patterns.</li>
              <li>
                We never sell, share, or rent your personal data to third
                parties.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">
              Third-party services
            </h2>
            <p className="mt-2">We use the following services to operate Dry Trip:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Supabase</strong> &mdash; database hosting (stores
                waitlist emails and venue data).
              </li>
              <li>
                <strong>Vercel</strong> &mdash; website hosting and edge
                functions.
              </li>
              <li>
                <strong>Anthropic (Claude)</strong> &mdash; AI model powering
                the trip planner. Chat messages are sent to Anthropic&rsquo;s API
                for processing. See{" "}
                <a
                  href="https://www.anthropic.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-forest"
                >
                  Anthropic&rsquo;s privacy policy
                </a>
                .
              </li>
              <li>
                <strong>Resend</strong> &mdash; transactional email delivery.
              </li>
              <li>
                <strong>PostHog</strong> &mdash; anonymised product analytics.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">Cookies</h2>
            <p className="mt-2">
              Dry Trip uses minimal cookies. We use a PostHog analytics cookie
              for anonymised usage tracking. We do not use advertising cookies
              or cross-site tracking. Your email is stored in your
              browser&rsquo;s local storage to avoid asking you to re-enter it
              on return visits.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">Your rights</h2>
            <p className="mt-2">You have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Request a copy of any personal data we hold about you.
              </li>
              <li>
                Request deletion of your data (email us and we will remove your
                email from our waitlist within 7 days).
              </li>
              <li>Unsubscribe from any emails at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">Data retention</h2>
            <p className="mt-2">
              Waitlist emails are retained until you request removal or we
              delete them after the product has launched and you have been
              notified. Click tracking data is retained in aggregate form
              indefinitely. Chat messages are not stored after your browser
              session ends.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-forest">Contact</h2>
            <p className="mt-2">
              For any privacy-related questions or data requests, email us at{" "}
              <a
                href="mailto:hello@drytrip.co"
                className="underline hover:text-forest"
              >
                hello@drytrip.co
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
