import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Dry Trip — corrections, venue suggestions, press and partnerships.",
  alternates: { canonical: "/contact" },
};

const EMAIL = "hello@drytrip.co";

const reasons = [
  {
    title: "Corrections",
    body: "Menu changed or a venue has closed? Tell us which venue and what's different, and we'll re-check it.",
    subject: "Correction",
  },
  {
    title: "Suggest a venue",
    body: "Know somewhere with genuinely good alcohol-free drinks? Send us the name and city.",
    subject: "Venue suggestion",
  },
  {
    title: "Press & partnerships",
    body: "For interviews, features or collaborations.",
    subject: "Press / partnerships",
  },
  {
    title: "Privacy & data requests",
    body: "To access or delete your data, or unsubscribe.",
    subject: "Privacy request",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-linen">
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-forest md:text-5xl">
          Contact
        </h1>
        <p className="mt-4 text-forest/80 leading-relaxed">
          The quickest way to reach us is by email at{" "}
          <a href={`mailto:${EMAIL}`} className="underline underline-offset-2 hover:text-forest">
            {EMAIL}
          </a>
          . We read everything and usually reply within a few working days.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {reasons.map((r) => (
            <a
              key={r.title}
              href={`mailto:${EMAIL}?subject=${encodeURIComponent(r.subject)}`}
              className="rounded-xl border border-mist bg-white/60 p-5 transition-colors hover:border-forest/30"
            >
              <h2 className="font-serif text-lg text-forest">{r.title}</h2>
              <p className="mt-1 text-sm text-forest/70 leading-relaxed">{r.body}</p>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
