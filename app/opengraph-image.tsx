import { ImageResponse } from "next/og";

// Social share card rendered for onemana.dev links (Twitter, WhatsApp, etc.).
export const runtime = "edge";
export const alt = "OneCamp — the self-hosted workspace for the AI era";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background:
            "radial-gradient(120% 90% at 20% 0%, #1a1740 0%, #06060a 55%), radial-gradient(80% 80% at 100% 100%, #07343a 0%, transparent 60%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#6d5efc,#34e3e3)",
            }}
          >
            <div style={{ width: 26, height: 26, borderRadius: 999, border: "4px solid #fff" }} />
          </div>
          <div style={{ marginLeft: 20, fontSize: 34, fontWeight: 700 }}>OneCamp</div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", marginTop: 48, fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 960 }}>
          <span>The workspace for the&nbsp;</span>
          <span style={{ color: "#8b7dff" }}>AI era.</span>
        </div>

        <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#94a3b8", maxWidth: 900 }}>
          Self-hosted chat, docs, tasks, calendar and meetings with a local AI. One-time or managed.
        </div>

        <div style={{ display: "flex", marginTop: 48 }}>
          <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: "rgba(255,255,255,0.08)", fontSize: 24, color: "#cbd5e1" }}>
            onemana.dev
          </div>
          <div style={{ display: "flex", marginLeft: 14, padding: "8px 18px", borderRadius: 999, background: "rgba(109,94,252,0.18)", fontSize: 24, color: "#c4bbff" }}>
            Open-source · Self-hosted
          </div>
        </div>
      </div>
    ),
    size,
  );
}
