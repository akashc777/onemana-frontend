import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { getPricing } from "@/lib/pricing";
import { loadOgFonts } from "@/lib/og-fonts";

export const runtime = "edge";
// alt cannot be async, so it quotes the build-time fallback. That fallback is
// pinned equal to the pricing module by lib/priceConsistency.test.ts, so it is
// only ever stale in the window between an admin price change and the next
// deploy. The image itself does not have that limitation and reads the live
// value below.
export const alt = `Get OneCamp: $${site.priceUsd} lifetime or $${site.cloudPriceUsd}/mo cloud`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BuyOpenGraphImage() {
  // The price on the card is the price we charge. It used to be a build-time
  // constant, so an admin price change updated the page and left every shared
  // link advertising the old number until somebody happened to redeploy.
  const [fonts, pricing] = await Promise.all([loadOgFonts(), getPricing()]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "#ffffff",
          color: "#222222",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(#e8eaed 1px, transparent 1px), linear-gradient(90deg, #e8eaed 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            display: "flex",
            background: "#c84f00",
          }}
        />

        <div style={{ display: "flex", fontSize: 18, fontWeight: 600, color: "#c84f00", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Get OneCamp
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 60, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
          Pay once.
        </div>
        <div style={{ display: "flex", marginTop: 8, fontSize: 44, fontWeight: 700, color: "#5f6368", letterSpacing: "-0.02em" }}>
          Self-host or cloud.
        </div>
        <div style={{ display: "flex", marginTop: 36, gap: 12 }}>
          <div
            style={{
              display: "flex",
              padding: "12px 22px",
              borderRadius: 8,
              background: "#c84f00",
              fontSize: 24,
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            ${pricing.lifetime_usd} lifetime
          </div>
          <div
            style={{
              display: "flex",
              padding: "12px 22px",
              borderRadius: 8,
              border: "1px solid #e1e4e8",
              fontSize: 24,
              fontWeight: 600,
              color: "#5f6368",
            }}
          >
            ${pricing.cloud_usd}/mo cloud
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 20, fontWeight: 600, color: "#c84f00" }}>
          onemana.dev/buy
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}