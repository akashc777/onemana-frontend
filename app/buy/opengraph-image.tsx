import { ImageResponse } from "next/og";
import { getPricing } from "@/lib/pricing";
import { loadOgFonts, loadRupeeFont } from "@/lib/og-fonts";
import { OG, OgFrame } from "@/lib/og-card";

export const runtime = "edge";
// alt cannot be async, and a price in it would be a constant that outlives
// the price. So it names the choice, and the image below carries the live
// figures: rupees (the charge), with the rupee sign when its glyph could be
// fetched (loadRupeeFont) and "INR" when it could not.
export const alt = "Get OneCamp: buy once, or let us host it";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The checkout's card, in the site's frame (the orbit on the right): the
 * choice in one line, then the two paid plans as white cards, each with its
 * plan's dot (sun for the licence, sky for Cloud, as on the plan cards). No uppercase orange
 * eyebrow and no filled orange "button" that cannot be pressed.
 */
export default async function BuyOpenGraphImage() {
  // The price on the card is the price we charge. It used to be a build-time
  // constant, so an admin price change updated the page and left every shared
  // link advertising the old number until somebody happened to redeploy.
  const [fonts, pricing, rupeeFont] = await Promise.all([loadOgFonts(), getPricing(), loadRupeeFont()]);
  // The card is seen worldwide: en-US grouping (₹24,999, never ₹24,999 in
  // lakh form for a larger figure), the sign only when its glyph is loaded.
  const money = (inr: number) => (rupeeFont ? `₹${inr.toLocaleString("en-US")}` : `INR ${inr.toLocaleString("en-US")}`);
  const plans = [
    { name: "Licence", hue: OG.camp.sun, price: money(pricing.lifetime_inr), per: "once" },
    { name: "Cloud", hue: OG.camp.sky, price: money(pricing.cloud_inr), per: "a month" },
  ];
  const allFonts = rupeeFont ? [...fonts, { name: "Inter Rupee", data: rupeeFont, weight: 600 as const, style: "normal" as const }] : fonts;
  return new ImageResponse(
    (
      <OgFrame address="onemana.dev/buy">
        {/* Two lines on purpose: at this size the sentence would leave "it."
            alone on a third. */}
        <div style={{ display: "flex", flexDirection: "column", fontSize: 58, fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
          <span style={{ display: "flex" }}>Pay once,</span>
          <span style={{ display: "flex" }}>or let us run it.</span>
        </div>
        {/* Each plan as a white card with its hue as a dot (site.md OG2,
            G7: identity is a dot, not a tinted chip). */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 30 }}>
          {plans.map((p) => (
            <div
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                width: 560,
                padding: "14px 20px",
                borderRadius: 16,
                background: OG.page,
                border: `1.5px solid ${OG.line}`,
                boxShadow: "0 6px 16px -8px rgba(16, 18, 26, 0.14)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, width: 128, fontSize: 22, fontWeight: 600, color: OG.text }}>
                <div style={{ display: "flex", width: 10, height: 10, borderRadius: 999, background: p.hue.strong }} />
                {p.name}
              </div>
              {/* The price on one line with its "once" or "a month" (site.md OG2). */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, whiteSpace: "nowrap" }}>
                <span style={{ display: "flex", fontSize: 30, fontWeight: 600, color: OG.text, fontFamily: "Inter, Inter Rupee" }}>{p.price}</span>
                <span style={{ display: "flex", fontSize: 20, color: OG.text2 }}>{p.per}</span>
              </div>
            </div>
          ))}
        </div>
      </OgFrame>
    ),
    { ...size, fonts: allFonts },
  );
}
