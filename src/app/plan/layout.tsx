import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan a Trip",
  description:
    "AI-powered trip planning backed by verified alcohol-free venue data. Tell us where you're going.",
};

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
