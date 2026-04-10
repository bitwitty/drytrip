import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getAllArticles, formatDate, type Article } from "@/lib/articles";

export const metadata: Metadata = {
  title: "The Edit",
  description:
    "City guides, venue spotlights, and the stories behind alcohol-free travel.",
  alternates: {
    canonical: "/edit",
  },
  openGraph: {
    title: "The Edit | Dry Trip",
    description:
      "City guides, venue spotlights, and the stories behind alcohol-free travel.",
    images: [
      {
        url: "/api/og?title=The%20Edit&subtitle=City%20guides%2C%20venue%20spotlights%2C%20and%20the%20stories%20behind%20alcohol-free%20travel.",
        width: 1200,
        height: 630,
        alt: "The Edit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Edit | Dry Trip",
    description:
      "City guides, venue spotlights, and the stories behind alcohol-free travel.",
  },
};

function formatType(type: Article["type"]): string {
  return type === "city-guide" ? "City Guide" : "Spotlight";
}

function FeaturedHero({ article }: { article: Article }) {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-8 md:px-12">
      <Link href={`/edit/${article.slug}`} className="group block">
        <article className="overflow-hidden rounded-2xl border border-sandstone/40 bg-white shadow-sm transition-shadow hover:shadow-md md:flex">
          <div className="relative h-56 overflow-hidden bg-forest md:h-auto md:w-2/5">
            {article.coverImage ? (
              <img
                src={article.coverImage}
                alt={article.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)",
                  color: "#F9F7F2",
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-forest/10 md:bg-gradient-to-r" />
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:hidden">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-sandstone">
                {formatType(article.type)}
              </span>
              <h2 className="mt-1 font-serif text-2xl font-semibold leading-snug text-linen">
                {article.title}
              </h2>
            </div>
          </div>
          <div className="flex flex-col justify-center p-6 md:w-3/5 md:p-8">
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-sandstone md:block">
              {formatType(article.type)}
            </span>
            <h2 className="hidden font-serif text-2xl font-semibold leading-snug text-forest md:mt-2 md:block md:text-3xl">
              {article.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-forest/70">
              {article.excerpt}
            </p>
            <p className="mt-4 text-xs text-forest/40">
              {formatDate(article.publishedAt)} &middot; {article.readingTime} min read
            </p>
            <p className="mt-3 text-xs font-medium text-forest/50 transition-colors group-hover:text-forest">
              Read more &rarr;
            </p>
          </div>
        </article>
      </Link>
    </section>
  );
}

function EditCard({ article }: { article: Article }) {
  return (
    <Link href={`/edit/${article.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-sandstone/40 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="relative h-44 overflow-hidden bg-forest">
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)",
                color: "#F9F7F2",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/60 to-forest/10" />
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-sandstone">
              {formatType(article.type)}
            </span>
            <h3 className="mt-1 font-serif text-xl font-bold leading-snug text-linen">
              {article.title}
            </h3>
          </div>
        </div>
        <div className="p-5">
          <p className="line-clamp-3 text-sm leading-relaxed text-forest/70">
            {article.excerpt}
          </p>
          <p className="mt-3 text-xs text-forest/40">
            {formatDate(article.publishedAt)} &middot; {article.readingTime} min read
          </p>
          <p className="mt-3 text-xs font-medium text-forest/50 transition-colors group-hover:text-forest">
            Read more &rarr;
          </p>
        </div>
      </article>
    </Link>
  );
}

export default async function EditIndexPage() {
  const articles = await getAllArticles();
  const featured = articles.find((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <div className="min-h-screen bg-linen">
      <Nav />

      <header className="mx-auto max-w-5xl px-6 pb-8 pt-10 md:px-12 md:pt-16">
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-forest md:text-5xl">
          The Edit
        </h1>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-forest/60">
          City guides, venue spotlights, and the stories behind the
          alcohol-free travel movement.
        </p>
      </header>

      {featured && <FeaturedHero article={featured} />}

      {rest.length > 0 && (
        <main className="mx-auto max-w-5xl px-6 pb-24 pt-4 md:px-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <EditCard key={article.slug} article={article} />
            ))}
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}
