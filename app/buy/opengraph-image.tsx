import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { loadOgFonts } from "@/lib/og-fonts";

export const runtime = "edge";
export const alt = `Get OneCamp — $${site.priceUsd} lifetime or $${site.cloudPriceUsd}/mo cloud`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BuyOpenGraphImage() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
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
            backgroundImage:
              "linear-gradient(#e1e4e8 1px, transparent 1px), linear-gradient(90deg, #e1e4e8 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 180,
            background: "radial-gradient(ellipse 90% 70% at 50% -20%, rgba(255,77,0,0.12), transparent 62%)",
          }}
        />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#FF4D00" }} />

        <div style={{ display: "flex", fontSize: 16, fontWeight: 600, color: "#FF4D00", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Pricing
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 54, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
          Buy once,
          <span style={{ color: "#FF4D00" }}> or let us host it.</span>
        </div>
        <div style={{ display: "flex", marginTop: 18, fontSize: 23, color: "#5f6368", maxWidth: 820, lineHeight: 1.4 }}>
          Lifetime self-host for ${site.priceUsd}, unlimited users, local AI included. Or managed OneCamp Cloud from ${site.cloudPriceUsd}/mo.
        </div>
        <div style={{ display: "flex", marginTop: 34, gap: 10 }}>
          <div
            style={{
              display: "flex",
              padding: "13px 22px",
              borderRadius: 8,
              background: "#FF4D00",
              fontSize: 21,
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            ${site.priceUsd} lifetime
          </div>
          <div
            style={{
              display: "flex",
              padding: "13px 22px",
              borderRadius: 8,
              border: "1px solid #e1e4e8",
              background: "#fafbfc",
              fontSize: 21,
              fontWeight: 600,
              color: "#5f6368",
            }}
          >
            ${site.cloudPriceUsd}/mo cloud
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 15, color: "#5f6368" }}>
          onemana.dev/buy · GST invoice · 30-day refund
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}