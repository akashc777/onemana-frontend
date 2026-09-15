import type { Metadata } from "next";
import { CompareView } from "@/components/site/CompareView";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { site } from "@/lib/site";

const DESCRIPTION =
  "OneCamp against Huly, Nextcloud, Mattermost and Plane: how each one bills you, what governs its agents, and what each of them does better. With the subscriptions a self-hosted workspace replaces.";

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

export default function ComparePage() {
  return <CompareView />;
}
