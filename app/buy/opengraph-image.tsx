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
 * choice in one line, then the two paid plans, each in its plan's hue (sun
 * for the licence, sky for Cloud, as on the plan cards). No uppercase orange
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
    { name: "Licence", hue: OG.camp.sun, price: `${money(pricing.lifetime_inr)} once`, fits: "Any number of people" },
    { name: "Cloud", hue: OG.camp.sky, price: `${money(pricing.cloud_inr)} a month`, fits: "Run by us" },
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
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 34 }}>
          {plans.map((p) => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: p.hue.tint,
                  color: p.hue.ink,
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {p.name}
              </div>
              <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: OG.text, fontFamily: "Inter, Inter Rupee" }}>{p.price}</div>
              <div style={{ display: "flex", fontSize: 22, color: OG.text2 }}>{p.fits}</div>
            </div>
          ))}
        </div>
      </OgFrame>
    ),
    { ...size, fonts: allFonts },
  );
}
