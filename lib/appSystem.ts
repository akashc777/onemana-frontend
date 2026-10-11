/**
 * THE ONE TABLE. OneCamp (the workspace, onecamp-fe) is the source of truth
 * for the design system, and this site is the same product before a visitor
 * pays, so its building blocks are the app's. Every core value the site draws
 * with is here, copied from the app with the file each comes from:
 *
 *   - SHARED, ALPHA, CAMP and AVATAR: the colours, light and dark, the alpha
 *     lines and overlays, the camp hues and the avatar cut;
 *   - ELEVATION and GLOW: the shadow ladder and the house theme's light;
 *   - APP: radii, the type scales, headings, buttons, fields, chips, cards,
 *     motion, icons and the logo.
 *
 * Design v3 (11 Oct 2026) changed every row of it, in step with the app.
 *
 * Nothing else writes these numbers. lib/tailwindAppSystem.ts builds the
 * site from this table: the colour custom properties for :root and .dark, the
 * Tailwind theme (radii, text sizes, shadows, timing) and the component
 * shapes (ui-btn-*, ui-field, ui-chip, ui-card). app/appSystem.test.ts and
 * app/sharedTokens.test.ts check that the site is built from it and that no
 * value is written around it. onecamp-fe's app/sharedTokens.test.ts pins the
 * same colours on the app's side.
 *
 * To change the design: change the app, then this table. Both halves then
 * move together.
 */

/**
 * The palette, as sRGB triples: design v3 of 11 Oct 2026 (onecamp-fe
 * app/globals.css :root and .dark, DESIGN_V3.md §3.2 to §3.5). Named as this
 * site names them; the app's v3 name is beside each. The page is the sheet:
 * white in light and the frame's #0B0C0E in dark (§3.2, "storefront page"),
 * on the canvas (the app's frame).
 */
export const SHARED: Record<"light" | "dark", Record<string, [number, number, number]>> = {
  light: {
    brand: [204, 74, 11], // #CC4A0B
    "brand-foreground": [255, 255, 255],
    "brand-ink": [194, 65, 12], // --brand-text #C2410C
    "brand-soft": [252, 239, 230], // --brand-muted #FCEFE6
    background: [255, 255, 255], // --sheet
    foreground: [22, 23, 27], // --ink #16171B
    card: [255, 255, 255], // --raised
    pop: [255, 255, 255], // --pop
    muted: [248, 249, 250], // --sunken #F8F9FA
    "muted-foreground": [91, 93, 101], // --ink-2 #5B5D65
    faint: [138, 140, 146], // --ink-3 #8A8C92
    "ink-4": [185, 187, 192], // --ink-4 #B9BBC0
    accent: [248, 249, 250],
    "accent-foreground": [22, 23, 27],
    // The hover and press steps are alphas in the app (ALPHA below); an
    // opaque press for a solid ground: press over the sheet.
    highlight: [238, 238, 239],
    canvas: [243, 244, 246], // --frame #F3F4F6
    agent: [91, 99, 214], // #5B63D6
    "agent-foreground": [255, 255, 255],
    "agent-muted": [238, 239, 252], // --agent-t #EEEFFC
    "agent-ink": [59, 63, 166], // --agent-i #3B3FA6
    success: [31, 138, 76],
    warning: [178, 107, 0],
    danger: [209, 41, 61],
    info: [47, 111, 219],
    "success-ink": [23, 107, 58],
    "warning-ink": [138, 83, 0],
    "info-ink": [34, 87, 181],
    "danger-ink": [174, 31, 51],
  },
  dark: {
    brand: [255, 122, 51], // #FF7A33
    "brand-foreground": [11, 12, 14], // #0B0C0E
    "brand-ink": [255, 138, 76], // #FF8A4C
    "brand-soft": [42, 26, 16], // #2A1A10
    background: [11, 12, 14], // the storefront page, #0B0C0E
    foreground: [238, 238, 240], // #EEEEF0
    card: [27, 28, 31], // --raised #1B1C1F
    pop: [31, 32, 36], // --pop #1F2024
    muted: [15, 16, 18], // --sunken #0F1012
    "muted-foreground": [168, 171, 177], // #A8ABB1
    faint: [114, 116, 123], // #72747B
    "ink-4": [74, 76, 82], // #4A4C52
    accent: [15, 16, 18],
    "accent-foreground": [238, 238, 240],
    highlight: [29, 30, 32],
    canvas: [11, 12, 14], // --frame #0B0C0E
    agent: [154, 162, 246], // #9AA2F6
    "agent-foreground": [11, 12, 14],
    "agent-muted": [30, 32, 64], // #1E2040
    "agent-ink": [201, 205, 251], // #C9CDFB
    success: [76, 195, 138],
    warning: [240, 180, 76],
    danger: [242, 85, 90],
    info: [110, 164, 245],
    "success-ink": [76, 195, 138],
    "warning-ink": [240, 180, 76],
    "info-ink": [110, 164, 245],
    "danger-ink": [255, 128, 134],
  },
}

/**
 * ALPHA OVER HEX FOR STRUCTURE (§3.1, §3.3): hairlines, hover, press and
 * selection are ink at a low alpha, so one token reads on the page, a card
 * and a menu. Each is an RGB triple and its alpha; Tailwind multiplies the
 * alpha by any opacity a class asks for (border-line/50).
 */
export const ALPHA: Record<"light" | "dark", Record<string, [[number, number, number], number]>> = {
  light: {
    line: [[20, 22, 30], 0.075],
    "line-2": [[20, 22, 30], 0.12],
    "line-3": [[20, 22, 30], 0.18],
    hover: [[20, 22, 30], 0.04],
    press: [[20, 22, 30], 0.07],
    sel: [[20, 22, 30], 0.055],
  },
  dark: {
    line: [[255, 255, 255], 0.065],
    "line-2": [[255, 255, 255], 0.1],
    "line-3": [[255, 255, 255], 0.16],
    hover: [[255, 255, 255], 0.04],
    press: [[255, 255, 255], 0.07],
    sel: [[255, 255, 255], 0.06],
  },
}

/**
 * NIGHT (site.md S6): the storefront's one dark section, the same in both
 * themes, with ink inverted; in dark the ground steps down to #060708 so it
 * still reads as a step. The camp hues take their dark cuts.
 */
export const NIGHT = {
  ground: { light: [11, 12, 14], dark: [6, 7, 8] } as Record<"light" | "dark", [number, number, number]>,
  tokens: {
    foreground: [238, 238, 240],
    "muted-foreground": [168, 171, 177],
    faint: [114, 116, 123],
    card: [20, 21, 24],
    pop: [27, 28, 31],
    muted: [15, 16, 18],
    "brand-ink": [255, 138, 76],
    agent: [154, 162, 246],
    "agent-ink": [201, 205, 251],
    "agent-muted": [30, 32, 64],
  } as Record<string, [number, number, number]>,
  line: 0.08,
}

/** The avatar cut (§3.5): two gradient stops per hue, the same in both modes. */
export const AVATAR: Record<string, string> = {
  "camp-sun-a1": "#AD7300", "camp-sun-a2": "#855500",
  "camp-moss-a1": "#3F945B", "camp-moss-a2": "#0E7344",
  "camp-lake-a1": "#0F919C", "camp-lake-a2": "#006E7D",
  "camp-sky-a1": "#427FD8", "camp-sky-a2": "#315CB0",
  "camp-dusk-a1": "#816BD8", "camp-dusk-a2": "#6749AC",
  "camp-berry-a1": "#CA4B85", "camp-berry-a2": "#A32B5E",
  "agent-a1": "#6572E4", "agent-a2": "#5050B9",
}

/** The house theme's campfire glow (§3.4), as RGB triples. */
export const GLOW = { glow: [255, 110, 30], glow2: [255, 61, 0] } as const

/**
 * THE ELEVATION LADDER (§3.8), light and dark: every step a ring plus drops,
 * and in dark a top highlight. onecamp-fe app/globals.css --e1 to --e-sheet.
 */
export const ELEVATION: Record<"light" | "dark", Record<"e1" | "sel" | "e2" | "e3" | "e4" | "sheet", string>> = {
  light: {
    e1: "0 0 0 1px rgb(16 18 26 / 0.09), 0 1px 2px rgb(16 18 26 / 0.05)",
    sel: "0 0 0 1px rgb(16 18 26 / 0.07), 0 1px 2px rgb(16 18 26 / 0.06), 0 2px 6px -2px rgb(16 18 26 / 0.06)",
    e2: "0 0 0 1px rgb(16 18 26 / 0.07), 0 1px 2px rgb(16 18 26 / 0.05), 0 4px 12px -4px rgb(16 18 26 / 0.08)",
    e3: "0 0 0 1px rgb(16 18 26 / 0.08), 0 4px 8px -2px rgb(16 18 26 / 0.07), 0 16px 32px -8px rgb(16 18 26 / 0.16)",
    e4: "0 0 0 1px rgb(16 18 26 / 0.08), 0 8px 16px -4px rgb(16 18 26 / 0.08), 0 32px 64px -16px rgb(16 18 26 / 0.24)",
    sheet: "0 0 0 1px rgb(16 18 26 / 0.06), 0 1px 3px rgb(16 18 26 / 0.04), 0 12px 32px -16px rgb(16 18 26 / 0.10)",
  },
  dark: {
    e1: "inset 0 1px 0 rgb(255 255 255 / 0.04), 0 0 0 1px rgb(255 255 255 / 0.08), 0 1px 2px rgb(0 0 0 / 0.4)",
    sel: "inset 0 1px 0 rgb(255 255 255 / 0.05), 0 0 0 1px rgb(255 255 255 / 0.06), 0 1px 2px rgb(0 0 0 / 0.4)",
    e2: "inset 0 1px 0 rgb(255 255 255 / 0.05), 0 0 0 1px rgb(255 255 255 / 0.08), 0 2px 4px rgb(0 0 0 / 0.3), 0 8px 16px -6px rgb(0 0 0 / 0.5)",
    e3: "inset 0 1px 0 rgb(255 255 255 / 0.06), 0 0 0 1px rgb(255 255 255 / 0.09), 0 8px 16px -4px rgb(0 0 0 / 0.5), 0 24px 48px -12px rgb(0 0 0 / 0.7)",
    e4: "inset 0 1px 0 rgb(255 255 255 / 0.06), 0 0 0 1px rgb(255 255 255 / 0.09), 0 16px 32px -8px rgb(0 0 0 / 0.6), 0 40px 80px -20px rgb(0 0 0 / 0.8)",
    sheet: "inset 0 1px 0 rgb(255 255 255 / 0.035), 0 0 0 1px rgb(255 255 255 / 0.06), 0 12px 32px -16px rgb(0 0 0 / 0.8)",
  },
}

/** Inter's tracking for a size (§3.6): -0.0223 + 0.185 * e^(-0.1745 * px), in em, to 3 places. */
export function tracking(px: number): number {
  return Math.round((-0.0223 + 0.185 * Math.exp(-0.1745 * px)) * 1000) / 1000
}

/**
 * The camp palette (the playful layer of 10 Oct 2026): six identity hues in
 * three cuts, the design direction's table verbatim. Strong: marks, icons and
 * dots. -tint: soft grounds. -ink: text on its own tint. The workspace writes
 * the same table as hex and pins it in its app/sharedTokens.test.ts, exactly:
 * a person's colour on this site is the colour they get in the app.
 */
export const CAMP: Record<"light" | "dark", Record<string, string>> = {
  light: {
    "camp-sun": "#B98200", "camp-sun-tint": "#FFF6D6", "camp-sun-ink": "#7A5200",
    "camp-moss": "#2F9E5B", "camp-moss-tint": "#E6F6EC", "camp-moss-ink": "#1D6A3C",
    "camp-lake": "#0E97A6", "camp-lake-tint": "#E1F5F6", "camp-lake-ink": "#0B5C65",
    "camp-sky": "#3B7DDD", "camp-sky-tint": "#E7EFFC", "camp-sky-ink": "#1E4E9A",
    "camp-dusk": "#7B61D9", "camp-dusk-tint": "#EFEBFC", "camp-dusk-ink": "#4B3699",
    "camp-berry": "#D9467C", "camp-berry-tint": "#FCE8EF", "camp-berry-ink": "#962556",
  },
  dark: {
    "camp-sun": "#F5C542", "camp-sun-tint": "#2E2712", "camp-sun-ink": "#FBE29C",
    "camp-moss": "#4CC38A", "camp-moss-tint": "#14291F", "camp-moss-ink": "#A6E7C4",
    "camp-lake": "#3CC6D2", "camp-lake-tint": "#10292F", "camp-lake-ink": "#A3E6EC",
    "camp-sky": "#6EA4F5", "camp-sky-tint": "#152238", "camp-sky-ink": "#B9D3FB",
    "camp-dusk": "#A795F5", "camp-dusk-tint": "#211B38", "camp-dusk-ink": "#D4CBFB",
    "camp-berry": "#F07AA6", "camp-berry-tint": "#33161F", "camp-berry-ink": "#F9C2D6",
  },
}

/** "#3B7DDD" as an sRGB triple, [59, 125, 221]. */
export function hexToTriple(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export const APP = {
  /**
   * onecamp-fe app/globals.css, @theme: --radius is 0.5rem; xs 4, sm 6, md 8,
   * lg and xl 12, 2xl 16, 3xl 20. The storefront adds the spec's two
   * marketing radii (site.md G3): ctl 10 for an xl button and a segmented
   * track, and 4xl 24 for the hero's canvas.
   */
  radius: { xs: 4, sm: 6, md: 8, ctl: 10, lg: 12, xl: 12, "2xl": 16, "3xl": 20, "4xl": 24 },

  /**
   * onecamp-fe app/globals.css, @theme "THE APP SCALE": size and line height
   * in px; the tracking is Inter's for the size (tracking()). The site's
   * names for the app's steps: caption is xs, small is sm, h3 is title-1.
   */
  type: {
    "3xs": [11, 14],
    "2xs": [12, 16],
    xs: [13, 18],
    sm: [14, 20],
    body: [15, 23],
    base: [16, 24],
    lg: [18, 28],
    xl: [20, 28],
    "2xl": [24, 32],
    "3xl": [30, 36],
    "4xl": [36, 40],
  },

  /**
   * The marketing scale (DESIGN_V3.md §3.6): desktop and phone size/line
   * height in px, weight and tracking. Headings are Inter Display (Inter at
   * opsz 32), the owner's choice of 11 Oct 2026.
   */
  marketing: {
    hero: { desktop: [68, 70], tablet: [56, 60], phone: [42, 46], weight: 600, tracking: -0.024 },
    /** An inner page's H1 (site.md G2). */
    page: { desktop: [52, 56], tablet: [44, 48], phone: [34, 40], weight: 600, tracking: -0.023 },
    h2: { desktop: [44, 50], tablet: [38, 44], phone: [32, 38], weight: 600, tracking: -0.022 },
    /** The final call to action's claim. */
    close: { desktop: [56, 60], tablet: [48, 52], phone: [36, 40], weight: 600, tracking: -0.023 },
    h3: { desktop: [24, 30], tablet: [22, 28], phone: [20, 26], weight: 590, tracking: -0.019 },
    /** A doc's, a post's and a policy's H1. */
    "title-read": { desktop: [40, 46], tablet: [36, 42], phone: [30, 36], weight: 600, tracking: -0.022 },
    lead: { desktop: [20, 30], tablet: [19, 29], phone: [18, 28], weight: 400, tracking: -0.012 },
    body: { desktop: [16, 26], tablet: [16, 26], phone: [16, 26], weight: 400, tracking: -0.011 },
    small: { desktop: [14, 20], tablet: [14, 20], phone: [14, 20], weight: 400, tracking: -0.006 },
    eyebrow: { desktop: [13, 16], tablet: [13, 16], phone: [13, 16], weight: 510, tracking: 0 },
    price: { desktop: [44, 48], tablet: [44, 48], phone: [36, 40], weight: 600, tracking: -0.022 },
  },

  /**
   * onecamp-fe app/globals.css: h1 to h3 take the display face, which is
   * Inter at opsz 32 here (Inter Display); weight 600 from 28px (590 below),
   * tracking from the size.
   */
  heading: { weight: 600, opsz: 32 },

  /**
   * onecamp-fe app/globals.css body: Inter's optical sizes, cv11 ss01 ss03,
   * no optimizeLegibility (it ran words together on Linux at 1x), and a word
   * gap that gives back what the tracking takes.
   */
  text: { featureSettings: '"cv11", "ss01", "ss03"', wordSpacing: "0.01em" },

  /**
   * onecamp-fe components/ui/button.tsx, buttonVariants (design v3): height,
   * horizontal padding and text size in px. The site's sm is the app's sm,
   * md the app's default, lg and xl the app's. Below md, md and up reach 44px
   * for a finger, as the app's fields do.
   */
  button: {
    sizes: {
      sm: { height: 28, paddingX: 10, text: "xs", phoneHeight: 28 },
      md: { height: 32, paddingX: 12, text: "xs", phoneHeight: 44 },
      lg: { height: 40, paddingX: 16, text: "sm", phoneHeight: 44 },
      xl: { height: 46, paddingX: 20, text: "body", phoneHeight: 46 },
    },
    weight: 510,
    radius: "md",
    xlRadius: 10,
    disabledOpacity: 0.5,
    /** Primary hover: the accent mixed 92% with black. */
    hoverMix: 92,
    /** Press: half a pixel down, in 90ms. */
    press: { y: 0.5, ms: 90 },
    /** Every button: a 2px accent ring 2px off (§3.11). */
    focus: { width: 2, offset: 2 },
    /** The primary's inner highlight and tinted drop, light and dark (§3.8). */
    primaryShadow: {
      light: "inset 0 1px 0 rgb(255 255 255 / 0.2), inset 0 -1px 0 rgb(0 0 0 / 0.08), 0 0 0 1px color-mix(in oklab, rgb(var(--brand)) 82%, black), 0 1px 2px rgb(16 18 26 / 0.18), 0 2px 6px -2px color-mix(in oklab, rgb(var(--brand)) 45%, transparent)",
      dark: "inset 0 1px 0 rgb(255 255 255 / 0.3), inset 0 -1px 0 rgb(0 0 0 / 0.12), 0 0 0 1px color-mix(in oklab, rgb(var(--brand)) 70%, black), 0 2px 8px -2px color-mix(in oklab, rgb(var(--brand)) 35%, transparent)",
    },
  },

  /**
   * onecamp-fe components/ui/input.tsx (field-surface in globals.css): 44px
   * and 16px text on a phone, 32px and 14px from md; the raised surface at
   * e1 with no border, a 1px accent ring at 50% and a 3px halo at 12% on
   * focus.
   */
  // The storefront draws its forms (/buy, /account) at 40px from md (site.md S10).
  field: { height: 40, phoneHeight: 44, paddingX: 10, text: "sm", phoneText: "base", radius: "md", ringMix: 50, haloMix: 12, disabledOpacity: 0.7 },

  /** onecamp-fe app/globals.css @utility chip: 22px, r6, 12/510, the hover overlay in a hairline. */
  chip: { height: 22, paddingX: 8, text: "2xs", weight: 510, radius: "sm" },

  /** onecamp-fe cards (design v3): r12 at e1, no border. */
  card: { radius: "lg", elevation: "e1" },

  /** onecamp-fe app/globals.css @theme MOTION: press 90, hover 140, pop 180, panel 240, spring 220, page 320. */
  motion: {
    duration: 140,
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    spring: "cubic-bezier(0.3, 1.35, 0.5, 1)",
    durations: { press: 90, hover: 140, pop: 180, panel: 240, spring: 220, page: 320 },
  },

  /** onecamp-fe public/logo.svg: a bare ring, no tile, one literal colour in both themes. */
  logo: { viewBox: 512, r: 176, stroke: 56, colour: "#c84f00" },

  /** onecamp-fe components/navigationBar/desktop/desktopNavigationTopBar.tsx: h-12 on the frame. */
  topBar: { height: 48 },

  /** onecamp-fe app/globals.css: one rendered 1.25px stroke whatever the size (stroke-width = 30 / size). */
  icon: { renderedStroke: 1.25 },

  /** The storefront's gradient ring (site.md S1 and the mocks): the logo in the campfire, sun-orange to ember. */
  logoGradient: ["#FF8A00", "#FF3D00"],
} as const

export type TypeStep = keyof typeof APP.type
