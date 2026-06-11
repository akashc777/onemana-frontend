import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get OneCamp",
  description: `Lifetime self-host from $${site.priceUsd} or managed cloud from $${site.cloudPriceUsd}/mo. Unlimited users, your server, local AI included.`,
  alternates: { canonical: "/buy" },
  openGraph: {
    title: `Get OneCamp for $${site.priceUsd} (lifetime)`,
    description: `Pay once for unlimited users, or choose managed hosting from $${site.cloudPriceUsd}/mo.`,
    url: `${site.url}/buy`,
    type: "website",
    images: [{ url: "/buy/opengraph-image", width: 1200, height: 630, alt: `Get OneCamp for $${site.priceUsd} (lifetime license)`, type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Get OneCamp for $${site.priceUsd} (lifetime)`,
    description: `Lifetime self-host or managed cloud. Unlimited users on your infrastructure.`,
    images: ["/buy/opengraph-image"],
  },
};

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return children;
}