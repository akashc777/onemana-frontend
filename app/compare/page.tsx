import type { Metadata } from "next";
import { CompareView } from "@/components/site/CompareView";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { site } from "@/lib/site";
import { getPricing } from "@/lib/pricing";
import { rivalNames } from "@/lib/compare";

export const revalidate = 300;

// Named from the page's own list, so a search result cannot promise a
// different set of rivals from the page it opens (it once listed four of six).
const DESCRIPTION = `OneCamp against ${rivalNames()}: how each one bills you, what governs its agents, and what each of them does better.`;

export const metadata: Metadata = {
  title: "Compare",
  description: DESCRIPTION,
  alternates: { canonical: "/compare" },
  openGraph: {
    title: `Compare ${site.name}`,
    description: DESCRIPTION,
    url: `${site.url}/compare`,
    type: "website",
    images: defaultOgImages,
  },
  twitter: {
    card: "summary_large_image",
    title: `Compare ${site.name}`,
    description: DESCRIPTION,
    images: defaultTwitterImages,
  },
};

export default async function ComparePage() {
  return <CompareView pricing={await getPricing()} />;
}
