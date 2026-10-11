import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { ALPHA, APP, AVATAR, CAMP, PAPER, SHARED, tripleToHex } from "@/lib/appSystem";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Bump when the card design changes so social caches refetch.
 *
 * 4: repositioned on governed AI. This bump is load-bearing rather than housekeeping: the image URL is
 * otherwise identical, and Slack, LinkedIn and X all cache OG images hard, so a reworded card at an
 * unchanged URL keeps showing the old headline to exactly the audience the rewording was for.
 * 5: the playful layer (10 Oct 2026): the ring from the logo with a workspace's channels, people and
 * agent orbiting it in the camp hues, the home page's own headline at weight 600, no grid or glow.
 * 6: design v3's two-tone headline and mini camp canvas.
 * 7: the site's own mark and people (11 Oct 2026): the gradient ring, gradient avatars with white
 * initials, the agent as its spark square, a neutral channel, and the v3 palette from the one table.
 */
export const OG_IMAGE_VERSION = "7";

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

const hex = tripleToHex;

/** An alpha hairline over the white page, as the solid colour satori draws. */
const over = (rgb: readonly [number, number, number], a: number) => hex([0, 1, 2].map((i) => 255 - (255 - rgb[i]!) * a) as [number, number, number]);

/**
 * The palette, as satori needs it: literal colours, since an image has no
 * CSS variables. Read from the one table (lib/appSystem.ts), so a card draws
 * the page's own v3 colours: the white sheet, the ink tiers, the alpha
 * hairlines as they land on white, the link ink, the paper and the camp hues'
 * strong, tint and ink cuts. The card used to type wave 1's (#FCFCFD,
 * #14161A, #5F6470, #E4E5E8).
 */
export const OG = {
  page: hex(SHARED.light.background!),
  text: hex(SHARED.light.foreground!),
  text2: hex(SHARED.light["muted-foreground"]!),
  text3: hex(SHARED.light.faint!),
  line: over(ALPHA.light.line![0], ALPHA.light.line![1]),
  lineStrong: over(ALPHA.light["line-3"]![0], ALPHA.light["line-3"]![1]),
  link: hex(SHARED.light["brand-ink"]!),
  paper: hex(PAPER.light),
  camp: Object.fromEntries(
    (["sky", "moss", "sun", "dusk", "berry", "lake"] as const).map((h) => [
      h,
      { strong: CAMP.light[`camp-${h}`]!, tint: CAMP.light[`camp-${h}-tint`]!, ink: CAMP.light[`camp-${h}-ink`]!, a1: AVATAR[`camp-${h}-a1`]!, a2: AVATAR[`camp-${h}-a2`]! },
    ]),
  ) as Record<"sky" | "moss" | "sun" | "dusk" | "berry" | "lake", { strong: string; tint: string; ink: string; a1: string; a2: string }>,
  agent: { a1: AVATAR["agent-a1"]!, a2: AVATAR["agent-a2"]!, tint: hex(SHARED.light["agent-muted"]!), ink: hex(SHARED.light["agent-ink"]!) },
} as const;

/** The four-point spark, in a 24 box (components/ui/graphics/motifs SPARK_PATH). */
const SPARK = "M12 2Q13.6 10.4 22 12Q13.6 13.6 12 22Q10.4 13.6 2 12Q10.4 10.4 12 2Z";

/**
 * The logo: the ring in the campfire gradient, as the site's nav draws it
 * (components/ui/v3 LogoRing): r8 and a 4 stroke on the 24 grid. It used to
 * be the app's flat ring, so the card and the page showed two marks.
 */
export function OgLogo({ size = 48 }: { size?: number }) {
  const [a, b] = APP.logoGradient;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="og-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="8" stroke="url(#og-ring)" strokeWidth="4" />
    </svg>
  );
}

/** A person (DESIGN_V3 §3.9): white initials on the hue's avatar gradient. */
export function OgFace({ initials, hue, size = 28 }: { initials: string; hue: keyof typeof OG.camp; size?: number }) {
  const c = OG.camp[hue];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(140deg, ${c.a1}, ${c.a2})`,
        color: "white",
        fontSize: Math.round(size * 0.375),
        fontWeight: 600,
      }}
    >
      {initials}
    </div>
  );
}

/** An agent (§3.9): a 32%-radius square in the agent's gradient with the white spark, never initials. */
function OgAgent({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `linear-gradient(140deg, ${OG.agent.a1}, ${OG.agent.a2})`,
      }}
    >
      <svg width={Math.round(size * 0.55)} height={Math.round(size * 0.55)} viewBox="0 0 24 24">
        <path d={SPARK} fill="white" />
      </svg>
    </div>
  );
}

/** A floating chip on the canvas (S19): white, a hairline and a soft drop. */
function Chip({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 14px 6px 6px",
        borderRadius: 14,
        background: OG.page,
        border: `1.5px solid ${OG.line}`,
        boxShadow: "0 8px 20px -8px rgba(16, 18, 26, 0.18)",
        fontSize: 20,
        fontWeight: 600,
        color: OG.text,
      }}
    >
      {children}
    </div>
  );
}

/** The camp hues' dots on the rings, in pixels from the centre. */
const DOTS: { x: number; y: number; hue: keyof typeof OG.camp; size: number }[] = [
  { x: 76, y: 66, hue: "moss", size: 16 },
  { x: -84, y: -18, hue: "sun", size: 14 },
  { x: 214, y: 156, hue: "lake", size: 18 },
  { x: 30, y: -222, hue: "sky", size: 12 },
  { x: -226, y: 64, hue: "berry", size: 12 },
];

/**
 * The motif: the logo's ring, extended into rings and one dotted orbit, with
 * the workspace's real things on it (site.md OG1): a channel (a neutral #,
 * since channels carry no hue), a person (her avatar gradient) and the agent
 * (its spark square, never initials), and five camp-hue dots.
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
      {DOTS.map((d, i) => (
        <div
          key={i}
          style={{ position: "absolute", left: cx + d.x - d.size / 2, top: cy + d.y - d.size / 2, width: d.size, height: d.size, borderRadius: 999, background: OG.camp[d.hue].strong, display: "flex" }}
        />
      ))}
      <Chip x={cx - 170} y={cy - 148}>
        <span style={{ display: "flex", width: 28, justifyContent: "center", color: OG.text3, fontSize: 22 }}>#</span>
        engineering
      </Chip>
      <Chip x={cx + 92} y={cy - 90}>
        <OgFace initials="PN" hue="berry" />
        Priya
      </Chip>
      <Chip x={cx - 116} y={cy + 138}>
        <OgAgent />
        Release Captain
        <span style={{ display: "flex", padding: "0 7px", borderRadius: 6, background: OG.agent.tint, color: OG.agent.ink, fontSize: 15, fontWeight: 600 }}>Agent</span>
      </Chip>
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
          backgroundColor: OG.paper,
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
        <span style={{ color: OG.text3 }}>Your team&apos;s chat, docs and calls,&nbsp;</span>
        <span style={{ color: OG.text }}>on a server you own.</span>
      </div>
      <div style={{ display: "flex", marginTop: 24, fontSize: 26, lineHeight: 1.4, color: OG.text2 }}>
        AI agents that can only do what you can. Free for up to 25 people.
      </div>
    </OgFrame>
  );
}
