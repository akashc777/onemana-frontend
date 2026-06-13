import type { Metadata } from "next";
import { AboutView } from "@/components/site/AboutView";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Who builds ${site.name}: OneMana Solutions, a Bangalore-based company shipping a self-hosted workspace.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${site.name}`,
    description: `OneMana builds ${site.name}, the self-hosted workspace for chat, docs, tasks, video, calendar, and local AI.`,
    url: `${site.url}/about`,
    type: "website",
    images: defaultOgImages,
  },
  twitter: {
    card: "summary_large_image",
    title: `About ${site.name}`,
    description: `OneMana builds ${site.name}, the self-hosted workspace for teams that want their data on their server.`,
    images: defaultTwitterImages,
  },
};

export default function AboutPage() {
  return <AboutView />;
}