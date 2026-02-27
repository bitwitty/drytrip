import type { Metadata } from "next";

const CITIES: Record<string, string> = {
  london: "London",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const display = CITIES[city] ?? "London";

  return {
    title: `${display} Venues`,
    description:
      "Hotels, restaurants, and bars rated for the quality of their alcohol-free experience.",
  };
}

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
