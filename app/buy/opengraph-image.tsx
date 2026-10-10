import { ImageResponse } from "next/og";
import { getPricing } from "@/lib/pricing";
import { loadOgFonts } from "@/lib/og-fonts";
import { OG, OgFrame } from "@/lib/og-card";

export const runtime = "edge";
// alt cannot be async, and a price in it would be a constant that outlives
// the price. Rupees on the card (the charge), written "INR" because the OG
// font subset has no rupee sign. So it names the
// choice, and the image below carries the live figures.
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
  const [fonts, pricing] = await Promise.all([loadOgFonts(), getPricing()]);
  const plans = [
    { name: "Licence", hue: OG.camp.sun, price: `INR ${pricing.lifetime_inr.toLocaleString("en-IN")} once`, fits: "Any number of people" },
    { name: "Cloud", hue: OG.camp.sky, price: `INR ${pricing.cloud_inr.toLocaleString("en-IN")} a month`, fits: "Run by us" },
  ];
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
              <div style={{ display: "flex", fontSize: 26, fontWeight: 600, color: OG.text }}>{p.price}</div>
              <div style={{ display: "flex", fontSize: 22, color: OG.text2 }}>{p.fits}</div>
            </div>
          ))}
        </div>
      </OgFrame>
    ),
    { ...size, fonts },
  );
}
