import type { CampHue } from "@/lib/campHue";
import { OG, OgFace, OgLogo } from "@/lib/og-card";
import { hueFor } from "@/lib/campHue";
import { site } from "@/lib/site";

// Shared 1200x630 social card for the per-post and per-guide OG images, in the
// site card's language (lib/og-card.tsx, version 5): the page's ground, the
// logo, the words at weight 600, the post's topic or the guide's group as a
// chip in its camp hue, and the logo's rings in the corner. It used to keep
// what the site card dropped: a line grid, an orange glow, an orange rule
// across the top and an orange uppercase eyebrow, the template's signature,
// with the title at 700. Rendered by the per-slug opengraph-image and
// twitter-image routes via next/og ImageResponse, so every element uses
// explicit `display: flex` (a Satori requirement).

export const OG_POST_SIZE = { width: 1200, height: 630 };

/** Trim a title to a sane length for the card (Satori has no real clamp). */
export function clampTitle(t: string, max = 110): string {
  const s = (t || "").trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

/** Scale the title down as it gets longer so it always fits the card. */
function titleFontSize(len: number): number {
  if (len <= 36) return 70;
  if (len <= 60) return 60;
  if (len <= 84) return 50;
  return 42;
}

/** The logo's rings, a quarter of them, in the bottom-right corner, with one dot in the card's hue. */
function CornerRings({ hue }: { hue: CampHue }) {
  const cx = 1150;
  const cy = 600;
  const ring = (r: number, style: "solid" | "dashed", colour: string) => (
    <div
      key={r}
      style={{
        position: "absolute",
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: 9999,
        border: `2px ${style} ${colour}`,
        display: "flex",
      }}
    />
  );
  return (
    <>
      {ring(120, "solid", OG.line)}
      {ring(200, "dashed", OG.lineStrong)}
      {ring(280, "solid", OG.line)}
      {/* A dot on the dashed ring, up and to the left of the centre. */}
      <div style={{ position: "absolute", left: cx - 141 - 8, top: cy - 141 - 8, width: 16, height: 16, borderRadius: 999, background: OG.camp[hue].strong, display: "flex" }} />
    </>
  );
}

/** "Akash Hadagali" as "AH": two initials on a 32px face. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1]![0] : "")).toUpperCase();
}

export function PostOgCard({ eyebrow, title, meta, hue = "sky", author }: { eyebrow: string; title: string; meta?: string; hue?: CampHue; author?: string }) {
  const t = clampTitle(title);
  const fs = titleFontSize(t.length);
  const c = OG.camp[hue];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: OG.page,
        fontFamily: "Inter",
        color: OG.text,
      }}
    >
      {/* The topic's own canvas in the right third (site.md OG3): its tint
          lit by its strong cut, so each topic has a colour in a feed. */}
      <div
        style={{
          position: "absolute",
          left: 820,
          top: 40,
          width: 440,
          height: 550,
          borderRadius: 32,
          display: "flex",
          backgroundColor: c.tint,
          backgroundImage: `radial-gradient(circle at 80% 0%, ${c.strong}55, ${c.strong}00 65%)`,
        }}
      />
      <CornerRings hue={hue} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 80px 60px 72px",
          position: "relative",
        }}
      >
        {/* Brand row, as on the site card. */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <OgLogo size={44} />
          <span style={{ display: "flex", fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>{site.name}</span>
        </div>

        {/* The topic or group as a chip in its hue, then the title. */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 14px",
              borderRadius: 8,
              background: c.tint,
              color: c.ink,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {/* A dot, the site's identity mark for a topic (site.md G7). */}
            <div style={{ width: 10, height: 10, borderRadius: 999, background: c.strong, display: "flex" }} />
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: fs,
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: OG.text,
              maxWidth: 720,
            }}
          >
            {t}
          </div>
        </div>

        {/* Footer: the address and the meta. */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ display: "flex", fontSize: 22, fontWeight: 600, color: OG.link }}>onemana.dev</span>
          {/* The author's face (site.md OG3): the gradient avatar the site draws them with. */}
          {author ? <OgFace initials={initialsOf(author)} hue={hueFor(author)} size={32} /> : null}
          {meta ? <span style={{ display: "flex", fontSize: 22, color: OG.text2 }}>{meta}</span> : null}
        </div>
      </div>
    </div>
  );
}
