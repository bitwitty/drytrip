import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dry Trip — Clear-headed luxury travel",
    template: "%s | Dry Trip",
  },
  description:
    "AI-powered trip planning backed by verified alcohol-free venue data across 7 cities. Browse the directory and plan your next trip.",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${montserrat.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-forest focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-linen"
        >
          Skip to content
        </a>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
