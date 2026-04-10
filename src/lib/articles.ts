import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Article {
  slug: string;
  title: string;
  type: "city-guide" | "venue-spotlight";
  excerpt: string;
  coverImage?: string;
  publishedAt: string;
  featured: boolean;
  readingTime: number;
}

export interface ArticleWithContent extends Article {
  content: string;
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const contentDir = path.join(process.cwd(), "content", "edit");

export async function getAllArticles(): Promise<Article[]> {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  const articles = files.map((filename) => {
    const raw = fs.readFileSync(path.join(contentDir, filename), "utf-8");
    const { data, content } = matter(raw);
    const slug = filename.replace(/\.mdx$/, "");

    return {
      slug,
      title: data.title,
      type: data.type,
      excerpt: data.excerpt,
      coverImage: data.coverImage || undefined,
      publishedAt: data.publishedAt,
      featured: Boolean(data.featured),
      readingTime: estimateReadingTime(content),
    } as Article;
  });

  return articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getArticleBySlug(
  slug: string,
): Promise<ArticleWithContent | null> {
  const filePath = path.join(contentDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title,
    type: data.type,
    excerpt: data.excerpt,
    coverImage: data.coverImage || undefined,
    publishedAt: data.publishedAt,
    featured: Boolean(data.featured),
    readingTime: estimateReadingTime(content),
    content,
  };
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));
  return files.map((f) => f.replace(/\.mdx$/, ""));
}
