import Link from "next/link";
import { Droplets } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linen">
      <Nav />

      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center md:px-12">
        <div className="flex size-16 items-center justify-center rounded-full bg-sandstone/20">
          <Droplets className="size-7 text-forest/30" />
        </div>
        <h1 className="mt-6 font-serif text-4xl tracking-tight text-forest">
          Page not found
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-forest/60">
          The page you&rsquo;re looking for doesn&rsquo;t exist, or it may have
          moved. Try browsing the directory or planning a trip instead.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/directory/london"
            className="inline-flex items-center justify-center rounded-lg bg-forest px-6 py-3 text-sm font-semibold text-linen shadow-sm transition-opacity hover:opacity-90"
          >
            Browse the directory
          </Link>
          <Link
            href="/plan"
            className="inline-flex items-center justify-center rounded-lg border border-sandstone/60 bg-white/60 px-6 py-3 text-sm font-semibold text-forest transition-colors hover:bg-white"
          >
            Plan a trip
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
