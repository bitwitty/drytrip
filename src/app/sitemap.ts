import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { getAllArticleSlugs } from "@/lib/articles";

const BASE_URL = "https://drytrip.co";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/directory/london`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/plan`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/methodology`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/edit`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Article pages
  const slugs = await getAllArticleSlugs();
  const articlePages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/edit/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Published venue pages
  const { data: venues } = await supabaseAdmin
    .from("venues")
    .select("slug")
    .eq("status", "Published");

  const venuePages: MetadataRoute.Sitemap = (venues ?? []).map((v) => ({
    url: `${BASE_URL}/venues/${v.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages, ...venuePages];
}
