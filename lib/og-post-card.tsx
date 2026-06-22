import { site } from "@/lib/site";

// Shared 1200x630 social card for dynamically generated blog/doc OG images.
// Title-driven, matching the brand language of lib/og-card.tsx. Rendered by the
// per-slug opengraph-image / twitter-image routes via next/og ImageResponse, so
// every element uses explicit `display: flex` (a Satori requirement).

export const OG_POST_SIZE = { width: 1200, height: 630 };

/** Trim a title to a sane length for the card (Satori has no real clamp). */
export function clampTitle(t: string, max = 110): string {
  const s = (t || "").trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "\u2026" : s;
}

/** Scale the title down as it gets longer so it always fits the card. */
function titleFontSize(len: number): number {
  if (len <= 36) return 70;
  if (len <= 60) return 60;
  if (len <= 84) return 50;
  return 42;
}

const CARD_BG = {
  width: "100%",
  height: "100%",
  display: "flex",
  position: "relative" as const,
  overflow: "hidden",
  background: "#ffffff",
  fontFamily: "Inter",
  color: "#222222",
};

export function PostOgCard({ eyebrow, title, meta }: { eyebrow: string; title: string; meta?: string }) {
  const t = clampTitle(title);
  const fs = titleFontSize(t.length);
  return (
    <div style={CARD_BG}>
      {/* Faint grid + top-left brand glow + orange rule, matching the site card. */}
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
          height: 220,
          display: "flex",
          background: "radial-gradient(ellipse 80% 60% at 18% -10%, rgba(255,77,0,0.14), transparent 70%)",
        }}
      />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, display: "flex", background: "#FF4D00" }} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 80px",
          position: "relative",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <LogoMark />
          <span style={{ display: "flex", marginLeft: 16, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {site.name}
          </span>
        </div>

        {/* Eyebrow + title */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 600,
              color: "#FF4D00",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: fs,
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              color: "#1a1a1a",
              maxWidth: 1000,
            }}
          >
            {t}
          </div>
        </div>

        {/* Footer: meta + domain */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", fontSize: 24, fontWeight: 500, color: "#5f6368" }}>{meta || ""}</span>
          <span style={{ display: "flex", fontSize: 22, fontWeight: 600, color: "#FF4D00" }}>onemana.dev</span>
        </div>
      </div>
    </div>
  );
}

function LogoMark() {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #FF8A00, #FF3D00)",
      }}
    >
      <div style={{ width: 20, height: 20, borderRadius: 999, display: "flex", border: "3px solid #fff" }} />
    </div>
  );
}
