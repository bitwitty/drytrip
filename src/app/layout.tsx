import type { Metadata } from "next";
import "./globals.css";
import PostHogProvider from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: {
    default: "Dry Trip — Clear-headed luxury travel",
    template: "%s | Dry Trip",
  },
  description:
    "AI-powered trip planning backed by verified alcohol-free venue data. Browse the London directory and plan your next trip.",
  metadataBase: new URL("https://drytrip.co"),
  openGraph: {
    type: "website",
    siteName: "Dry Trip",
    title: "Dry Trip — Clear-headed luxury travel",
    description:
      "Luxury travel rated for the alcohol-free experience. Verified venues, AI trip planning, zero compromises.",
    locale: "en_GB",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Dry Trip" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dry Trip — Clear-headed luxury travel",
    description:
      "AI-powered trip planning backed by verified alcohol-free venue data.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Montserrat:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
