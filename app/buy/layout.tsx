import type { Metadata } from "next";
import { site } from "@/lib/site";
import { fmtINR, getPricing } from "@/lib/pricing";

// Worked out from live pricing, never from constants: link previews in Slack,
// X and email are often the first price a buyer sees, and a fixed "$299" there
// outlived the price it described.
export async function generateMetadata(): Promise<Metadata> {
  const p = await getPricing();
  const once = fmtINR(p.lifetime_inr);
  const monthly = `${fmtINR(p.cloud_inr)} a month`;
  const alt = `Get OneCamp: ${once} lifetime or ${monthly} cloud`;
  return {
    title: "Get OneCamp",
    description: `A licence for ${once} once, or managed cloud from ${monthly}. Unlimited users, your server, local AI included.`,
    alternates: { canonical: "/buy" },
    openGraph: {
      title: "Get OneCamp · Buy once, or let us host it",
      description: `Pay ${once} once for unlimited users on your server, or choose managed hosting from ${monthly}.`,
      url: `${site.url}/buy`,
      type: "website",
      images: [{ url: "/buy/opengraph-image?v=3", width: 1200, height: 630, alt, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Get OneCamp · Buy once, or let us host it",
      description: `A licence for ${once} once, or managed cloud from ${monthly}.`,
      images: ["/buy/opengraph-image?v=3"],
    },
  };
}

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
