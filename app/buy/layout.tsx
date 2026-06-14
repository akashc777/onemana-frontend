import type { Metadata } from "next";
import { site } from "@/lib/site";

const BUY_OG_ALT = `Get OneCamp: $${site.priceUsd} lifetime or $${site.cloudPriceUsd}/mo cloud`;

export const metadata: Metadata = {
  title: "Get OneCamp",
  description: `Lifetime self-host from $${site.priceUsd} or managed cloud from $${site.cloudPriceUsd}/mo. Unlimited users, your server, local AI included.`,
  alternates: { canonical: "/buy" },
  openGraph: {
    title: "Get OneCamp · Buy once, or let us host it",
    description: `Pay $${site.priceUsd} once for unlimited users on your server, or choose managed hosting from $${site.cloudPriceUsd}/mo.`,
    url: `${site.url}/buy`,
    type: "website",
    images: [{ url: "/buy/opengraph-image?v=2", width: 1200, height: 630, alt: BUY_OG_ALT, type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get OneCamp · Buy once, or let us host it",
    description: `Lifetime self-host from $${site.priceUsd} or managed cloud from $${site.cloudPriceUsd}/mo.`,
    images: ["/buy/opengraph-image?v=2"],
  },
};

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return children;
}