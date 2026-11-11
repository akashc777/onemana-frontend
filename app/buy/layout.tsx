import type { Metadata } from "next";
import { site } from "@/lib/site";
import { fmtINR, getPricing } from "@/lib/pricing";
import { PEOPLE } from "@/lib/freePlan";
import { PLAN } from "@/lib/plans";

// Worked out from live pricing, never from constants: link previews in Slack,
// X and email are often the first price a buyer sees, and a fixed "$299" there
// outlived the price it described.
export async function generateMetadata(): Promise<Metadata> {
  const p = await getPricing();
  const once = fmtINR(p.lifetime_inr);
  const monthly = `${fmtINR(p.cloud_inr)} a month`;
  const alt = `Get OneCamp: the ${PLAN.licence.name.toLowerCase()} for ${once} once, or ${PLAN.cloud.name} from ${monthly}`;
  return {
    title: "Get OneCamp",
    description: `A licence for ${once} once, or managed cloud from ${monthly}. ${PEOPLE.licence}, your server, local AI included.`,
    alternates: { canonical: "/buy" },
    openGraph: {
      title: "Get OneCamp · Buy once, or let us host it",
      description: `Pay ${once} once for ${PEOPLE.licence.toLowerCase()} on your server, or choose managed hosting from ${monthly}.`,
      url: `${site.url}/buy`,
      type: "website",
      images: [{ url: "/buy/opengraph-image?v=7", width: 1200, height: 630, alt, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Get OneCamp · Buy once, or let us host it",
      description: `A licence for ${once} once, or managed cloud from ${monthly}.`,
      images: ["/buy/opengraph-image?v=7"],
    },
  };
}

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
