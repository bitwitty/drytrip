import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About",
  description:
    "Dry Trip is an editorially curated travel guide for people drinking less — the good bars, restaurants and hotels, scored on their alcohol-free drinks.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-linen">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-forest md:text-5xl">
          About Dry Trip
        </h1>

        <div className="mt-10 space-y-6 text-forest/80 leading-relaxed">
          <p>
            Dry Trip is a travel guide for people who are drinking less but still want the good
            night out &mdash; the rooftop, the hotel bar, the late dinner &mdash; with a drink in
            hand that was made with as much care as anything else on the menu.
          </p>
          <p>
            Most guides treat the alcohol-free option as a footnote. We start with it. Every venue
            in the directory is individually audited and cleared by an editor before it goes live,
            and given a{" "}
            <Link href="/methodology" className="underline underline-offset-2 hover:text-forest">
              Dry Score
            </Link>{" "}
            from 1 to 5 on a single rubric: how good, how varied and how thoughtfully served the
            alcohol-free drinks are.
          </p>
          <p>
            We&rsquo;re building one city at a time, starting with London. Our trip planner turns
            the directory into an itinerary in seconds, and only ever recommends venues we&rsquo;ve
            audited.
          </p>

          <h2 className="pt-4 font-serif text-2xl text-forest">Get in touch</h2>
          <p>
            Spotted something out of date, or want to suggest a venue? We&rsquo;d love to hear from
            you &mdash; see our{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-forest">
              contact page
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
