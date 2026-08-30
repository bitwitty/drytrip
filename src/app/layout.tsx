import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import PostHogPageView from "@/components/PostHogPageView";

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
    default: "Dry Trip — Alcohol-free travel directory",
    template: "%s | Dry Trip",
  },
  description:
    "An editorially curated alcohol-free travel directory. Every venue individually audited and scored on one rubric. London is live — more cities coming.",
  metadataBase: new URL("https://drytrip.co"),
  openGraph: {
    type: "website",
    siteName: "Dry Trip",
    title: "Dry Trip — Alcohol-free travel directory",
    description:
      "An editorially curated alcohol-free travel directory. Every venue individually audited and scored on one rubric.",
    locale: "en_GB",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Dry Trip" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dry Trip — Alcohol-free travel directory",
    description:
      "An editorially curated alcohol-free travel directory. Every venue individually audited and scored on one rubric.",
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
        <PostHogPageView />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
