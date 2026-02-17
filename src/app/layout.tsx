import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dry Trip — Luxury Travel at Full Resolution",
  description:
    "The first travel directory and AI planner built for clear-headed luxury.",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
