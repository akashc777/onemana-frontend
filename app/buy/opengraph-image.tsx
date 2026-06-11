import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { loadOgFonts } from "@/lib/og-fonts";

export const runtime = "edge";
export const alt = `Get OneCamp for $${site.priceUsd} (lifetime license)`;
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
          background:
            "radial-gradient(90% 70% at 15% 10%, rgba(109,94,252,0.35) 0%, transparent 55%), radial-gradient(70% 60% at 90% 90%, rgba(52,227,227,0.14) 0%, transparent 55%), #06060a",
          color: "#fff",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, fontWeight: 600, color: "#64748b" }}>onemana.dev / buy</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 64, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
          Get OneCamp.
          <span style={{ color: "#8b7dff" }}> Pay once.</span>
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 28, color: "#94a3b8", maxWidth: 900 }}>
          Self-host for ${site.priceUsd} one time, or managed cloud from ${site.cloudPriceUsd}/mo. Unlimited users on your server.
        </div>
        <div style={{ display: "flex", marginTop: 40, gap: 14 }}>
          <div
            style={{
              display: "flex",
              padding: "14px 24px",
              borderRadius: 14,
              background: "linear-gradient(135deg, #6d5efc, #5847e0)",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            ${site.priceUsd} lifetime
          </div>
          <div
            style={{
              display: "flex",
              padding: "14px 24px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              fontSize: 24,
              fontWeight: 600,
              color: "#cbd5e1",
            }}
          >
            ${site.cloudPriceUsd}/mo cloud
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}