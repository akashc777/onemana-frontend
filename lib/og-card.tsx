import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { APP } from "@/lib/appSystem";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Bump when the card design changes so social caches refetch.
 *
 * 4: repositioned on governed AI. This bump is load-bearing rather than housekeeping: the image URL is
 * otherwise identical, and Slack, LinkedIn and X all cache OG images hard, so a reworded card at an
 * unchanged URL keeps showing the old headline to exactly the audience the rewording was for.
 * 5: the playful layer (10 Oct 2026): the ring from the logo with a workspace's channels, people and
 * agent orbiting it in the camp hues, the home page's own headline at weight 600, no grid or glow.
 */
export const OG_IMAGE_VERSION = "6";

export const OG_TITLE = `${site.name} · Team chat, docs, tasks and calls on your own server`;
export const OG_DESCRIPTION =
  "Like Slack, Notion and Zoom in one app, running on your own server. AI agents that can only do what you can, with every action logged. Free for up to 25 people.";
export const OG_ALT = "OneCamp: your team's chat, docs, tasks and calls in one app, on your own server.";

export const defaultOgImages = [
  {
    url: `/opengraph-image?v=${OG_IMAGE_VERSION}`,
    width: 1200,
    height: 630,
    alt: OG_ALT,
    type: "image/png" as const,
  },
];

export const defaultTwitterImages = [`/twitter-image?v=${OG_IMAGE_VERSION}`];

/**
 * The palette, as satori needs it: literal colours, since an image has no
 * CSS variables. These are the light theme's values from globals.css (the
 * graphite neutrals, the link ink, and the camp hues' strong, tint and ink
 * cuts); lib/palette.ts pins the same numbers for the page.
 */
export const OG = {
  page: "#FCFCFD",
  text: "#14161A",
  text2: "#5F6470",
  line: "#E4E5E8",
  lineStrong: "#D3D5DA",
  link: "#C2410C",
  camp: {
    sky: { strong: "#3B7DDD", tint: "#E7EFFC", ink: "#1E4E9A" },
    moss: { strong: "#2F9E5B", tint: "#E6F6EC", ink: "#1D6A3C" },
    sun: { strong: "#B98200", tint: "#FFF6D6", ink: "#7A5200" },
    dusk: { strong: "#7B61D9", tint: "#EFEBFC", ink: "#4B3699" },
    berry: { strong: "#D9467C", tint: "#FCE8EF", ink: "#962556" },
    lake: { strong: "#0E97A6", tint: "#E1F5F6", ink: "#0B5C65" },
  },
} as const;

/**
 * The logo: the app's bare ring (lib/appSystem.ts APP.logo, from the app's
 * public/logo.svg), at its proportions: outer edge 204 of 512, stroke 56.
 */
export function OgLogo({ size = 48 }: { size?: number }) {
  const { viewBox, r, stroke, colour } = APP.logo;
  const k = size / viewBox;
  const ring = Math.round((2 * r + stroke) * k);
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: ring, height: ring, borderRadius: 999, display: "flex", border: `${Math.round(stroke * k)}px solid ${colour}` }} />
    </div>
  );
}

/** One thing orbiting the workspace: a hued dot, or a chip that names it. */
type Orbiter = { x: number; y: number; hue: keyof typeof OG.camp; size?: number; label?: string; initial?: string };

// Real things a workspace holds, from the live demo: its channels, its people
// and its agent. Placed on the rings by hand, in pixels from the centre.
const ORBITERS: Orbiter[] = [
  { x: -150, y: -128, hue: "sky", initial: "#", label: "engineering" },
  { x: 112, y: -70, hue: "berry", initial: "P", label: "Priya" },
  { x: -96, y: 158, hue: "dusk", initial: "RC", label: "Release Captain" },
  { x: 76, y: 66, hue: "moss", size: 16 },
  { x: -84, y: -18, hue: "sun", size: 14 },
  { x: 214, y: 156, hue: "lake", size: 18 },
  { x: 30, y: -222, hue: "moss", size: 12 },
  { x: -226, y: 64, hue: "berry", size: 12 },
];

/**
 * The motif: the logo's ring, extended into rings and one dotted orbit, with
 * the workspace's channels, people and agent around it in the camp hues. Flat
 * shapes and hairlines only, as on the site.
 */
export function OgOrbit({ cx, cy }: { cx: number; cy: number }) {
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
      {ring(96, "solid", OG.line)}
      {ring(176, "dashed", OG.lineStrong)}
      {ring(256, "solid", OG.line)}
      <div style={{ position: "absolute", left: cx - 44, top: cy - 44, display: "flex" }}>
        <OgLogo size={88} />
      </div>
      {ORBITERS.map((o, i) => {
        const c = OG.camp[o.hue];
        if (!o.label) {
          const s = o.size ?? 14;
          return (
            <div
              key={i}
              style={{ position: "absolute", left: cx + o.x - s / 2, top: cy + o.y - s / 2, width: s, height: s, borderRadius: 999, background: c.strong, display: "flex" }}
            />
          );
        }
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + o.x - 20,
              top: cy + o.y - 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 14px 6px 6px",
              borderRadius: 999,
              background: "#FFFFFF",
              border: `1.5px solid ${OG.line}`,
              fontSize: 20,
              fontWeight: 600,
              color: OG.text,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: c.tint,
                border: `1.5px solid ${c.strong}`,
                color: c.ink,
                fontSize: o.initial && o.initial.length > 1 ? 12 : 15,
                fontWeight: 600,
              }}
            >
              {o.initial ?? ""}
            </div>
            {o.label}
          </div>
        );
      })}
    </>
  );
}

/**
 * The frame every site card shares: the text column on the left (brand, the
 * card's words, the address) and the orbit on the right.
 */
export function OgFrame({ children, address = "onemana.dev" }: { children: ReactNode; address?: string }) {
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
      {/* A mini camp canvas (site.md OG1): the paper with the ember glow and
          the dusk and lake light, bleeding off the right edge, the orbit on it. */}
      <div
        style={{
          position: "absolute",
          left: 664,
          top: 40,
          width: 600,
          height: 550,
          borderRadius: 32,
          display: "flex",
          backgroundColor: "#F7F4F1",
          backgroundImage:
            "radial-gradient(circle at 78% -10%, rgba(255,110,30,0.30), rgba(255,110,30,0) 60%), radial-gradient(circle at 0% 110%, rgba(123,97,217,0.16), rgba(123,97,217,0) 55%), radial-gradient(circle at 100% 110%, rgba(14,151,166,0.13), rgba(14,151,166,0) 55%)",
        }}
      />
      <OgOrbit cx={940} cy={315} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 660, padding: "64px 0 60px 72px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <OgLogo size={44} />
          <span style={{ display: "flex", fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>{site.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
        <div style={{ display: "flex", fontSize: 22, fontWeight: 600, color: OG.link }}>{address}</div>
      </div>
    </div>
  );
}

/** The site's card: the home page's headline and its one line. */
export function OgCard() {
  return (
    <OgFrame>
      {/*
        The hero h1, at weight 600 (never 700). Satori wraps at the column's
        width but never shrinks, so the line length was checked at this size
        against the 588 px column rather than eyeballed.
      */}
      <div style={{ display: "flex", flexWrap: "wrap", fontSize: 58, fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.024em" }}>
        {/* Two tones, as the hero (site.md H1, OG1): the soft half in ink-3, the claim in ink. */}
        <span style={{ color: "#8A8C92" }}>Your team&apos;s chat, docs and calls,&nbsp;</span>
        <span style={{ color: OG.text }}>on a server you own.</span>
      </div>
      <div style={{ display: "flex", marginTop: 24, fontSize: 26, lineHeight: 1.4, color: OG.text2 }}>
        AI agents that can only do what you can. Free for up to 25 people.
      </div>
    </OgFrame>
  );
}
