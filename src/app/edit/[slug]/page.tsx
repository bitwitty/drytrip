import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Sparkles } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WaitlistForm from "@/components/WaitlistForm";
import { mdxComponents } from "@/components/mdx-components";
import {
  getArticleBySlug,
  getAllArticleSlugs,
  getAllArticles,
  formatDate,
  type Article,
} from "@/lib/articles";

const BASE_URL = "https://drytrip.co";

function formatType(type: Article["type"]): string {
  return type === "city-guide" ? "City Guide" : "Spotlight";
}

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `/edit/${slug}`,
    },
    openGraph: {
      title: `${article.title} | Dry Trip`,
      description: article.excerpt,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(article.excerpt)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | Dry Trip`,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const allArticles = await getAllArticles();
  const related = allArticles
    .filter((a) => a.slug !== slug)
    .slice(0, 2);

  const ogImage = article.coverImage
    ? `${BASE_URL}${article.coverImage}`
    : `${BASE_URL}/api/og?title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(article.excerpt)}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    image: ogImage,
    author: {
      "@type": "Organization",
      name: "Dry Trip",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Dry Trip",
      url: BASE_URL,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "The Edit",
        item: `${BASE_URL}/edit`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${BASE_URL}/edit/${slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-linen">
      <Nav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Article header */}
      <div className="mx-auto max-w-3xl px-6 pb-8 pt-16 md:px-12 md:pt-20">
        <div className="flex items-center gap-3 text-xs text-forest/50">
          <span className="rounded-full border border-sandstone/50 px-3 py-1 font-medium uppercase tracking-[0.15em] text-sandstone">
            {formatType(article.type)}
          </span>
          <span>{formatDate(article.publishedAt)}</span>
          <span>&middot;</span>
          <span>{article.readingTime} min read</span>
        </div>
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight text-forest md:text-5xl">
          {article.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-forest/60">
          {article.excerpt}
        </p>
      </div>

      {/* MDX content */}
      <article className="mx-auto max-w-3xl px-6 pb-16 md:px-12">
        <MDXRemote source={article.content} components={mdxComponents} />
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 pb-10 md:px-12">
          <h2 className="font-serif text-xl font-semibold text-forest">
            More from The Edit
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/edit/${r.slug}`}
                className="group block rounded-xl border border-sandstone/30 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-sandstone">
                  {formatType(r.type)}
                </span>
                <h3 className="mt-1 font-serif text-base font-semibold leading-snug text-forest group-hover:text-forest/80">
                  {r.title}
                </h3>
                <p className="mt-2 text-xs text-forest/40">
                  {formatDate(r.publishedAt)} &middot; {r.readingTime} min read
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI planner CTA */}
      <section className="mx-auto max-w-3xl px-6 md:px-12">
        <div className="rounded-2xl border border-sandstone/30 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linen">
              <Sparkles className="size-5 text-forest" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-forest">
                Ready to plan your trip?
              </h3>
              <p className="mt-1 text-sm text-forest/60">
                Our AI concierge builds personalised itineraries using verified
                venue data — never hallucinated.
              </p>
              <Link
                href="/plan"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-sm font-medium text-linen transition-opacity hover:opacity-90"
              >
                Plan Your Trip
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-8 md:px-12">
        <p className="text-sm font-medium text-forest/60">
          More guides and finds like this, weekly. No spam.
        </p>
        <div className="mt-3 max-w-md">
          <WaitlistForm
            buttonText="Subscribe"
            successMessage="You're in. Weekly intel from The Edit, starting soon."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
