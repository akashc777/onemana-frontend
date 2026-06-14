import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { loadOgFonts } from "@/lib/og-fonts";

export const runtime = "edge";
export const alt = `Get OneCamp: $${site.priceUsd} lifetime or $${site.cloudPriceUsd}/mo cloud`;
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
            background: "#FF4D00",
          }}
        />

        <div style={{ display: "flex", fontSize: 18, fontWeight: 600, color: "#FF4D00", letterSpacing: "0.08em", textTransform: "uppercase" }}>
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
              background: "#FF4D00",
              fontSize: 24,
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            ${site.priceUsd} lifetime
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
            ${site.cloudPriceUsd}/mo cloud
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 20, fontWeight: 600, color: "#FF4D00" }}>
          onemana.dev/buy
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}