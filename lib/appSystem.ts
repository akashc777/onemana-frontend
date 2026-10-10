/**
 * THE ONE TABLE. OneCamp (the workspace, onecamp-fe) is the source of truth
 * for the design system, and this site is the same product before a visitor
 * pays, so its building blocks are the app's. Every core value the site draws
 * with is here, copied from the app with the file each comes from:
 *
 *   - SHARED and CAMP: the colours, light and dark;
 *   - APP: radii, the type scale, headings, buttons, fields, chips, cards,
 *     motion, shadows, icons and the logo.
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
 * The palette, as sRGB triples (the app writes the same colours in OKLCH and
 * converts them in its test). Named as this site names them: --brand-ink is
 * the app's --brand-text, --brand-soft its --brand-muted, --border-strong its
 * --input, --faint its --faint-foreground, --danger its --destructive.
 */
export const SHARED: Record<"light" | "dark", Record<string, [number, number, number]>> = {
  // The 10 October 2026 palette (DESIGN.md): cool graphite and signal orange.
  light: {
    brand: [204, 74, 11],
    "brand-foreground": [255, 255, 255],
    "brand-ink": [194, 65, 12],
    "brand-soft": [255, 241, 232],
    background: [252, 252, 253],
    foreground: [20, 22, 26],
    card: [255, 255, 255],
    muted: [245, 246, 247],
    "muted-foreground": [95, 100, 112],
    faint: [138, 143, 153],
    // The app's --accent is surface-2 (the muted step); its hover step is
    // --sidebar-accent, bg-highlight there and here.
    accent: [245, 246, 247],
    "accent-foreground": [20, 22, 26],
    highlight: [237, 238, 240],
    // The app's canvas: --brand-wash of the house theme (app/themes.css).
    canvas: [249, 245, 241],
    border: [228, 229, 232],
    "border-strong": [211, 213, 218],
    "agent": [79, 91, 213],
    "agent-foreground": [255, 255, 255],
    "agent-muted": [238, 240, 253],
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
    brand: [255, 122, 51],
    "brand-foreground": [14, 15, 17],
    "brand-ink": [255, 138, 76],
    "brand-soft": [42, 26, 16],
    background: [14, 15, 17],
    foreground: [237, 238, 240],
    card: [22, 24, 28],
    muted: [29, 32, 37],
    "muted-foreground": [155, 160, 170],
    faint: [107, 112, 122],
    accent: [29, 32, 37],
    "accent-foreground": [237, 238, 240],
    highlight: [37, 40, 46],
    canvas: [35, 28, 23],
    border: [38, 40, 45],
    "border-strong": [51, 54, 61],
    "agent": [163, 171, 245],
    "agent-foreground": [14, 15, 17],
    "agent-muted": [30, 33, 64],
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
  /** onecamp-fe app/globals.css, @theme: --radius is 0.375rem; sm is 2px less, lg and xl 4px more, 2xl 8px more. */
  radius: { sm: 4, md: 6, lg: 10, xl: 10, "2xl": 14 },

  /**
   * onecamp-fe app/globals.css, @theme "THE APP SCALE": size and line height
   * in px. The site's names for the app's steps: caption is xs, small is sm,
   * h3 is xl.
   */
  type: {
    "3xs": [11, 14],
    "2xs": [12, 16],
    xs: [13, 18],
    sm: [14, 20],
    base: [16, 24],
    lg: [18, 28],
    xl: [20, 28],
    "2xl": [24, 32],
    "3xl": [30, 36],
    "4xl": [36, 40],
  },

  /**
   * onecamp-fe app/globals.css (h1, h2, h3 take --font-display; no
   * letter-spacing on text) and components/ui/pageHeader.tsx (the page
   * title: font-display font-semibold tracking-normal). Marketing display
   * sizes may be larger than the app's largest title (36px, text-4xl); only
   * those take the app's one tightening step, Tailwind's tracking-tight.
   */
  heading: { weight: 600, tracking: "normal", tightStep: "-0.025em", largestTitle: 36 },

  /** onecamp-fe app/globals.css @layer components: * { font-feature-settings: "calt" 0 }. */
  text: { featureSettings: '"calt" 0' },

  /**
   * onecamp-fe components/ui/button.tsx, buttonVariants: height, horizontal
   * padding and text size in px. The site's md is the app's default. Below md
   * the default and lg sizes reach 44px for a finger, as the app's fields do.
   */
  button: {
    sizes: {
      sm: { height: 32, paddingX: 12, text: "xs", phoneHeight: 32 },
      md: { height: 36, paddingX: 16, text: "sm", phoneHeight: 44 },
      lg: { height: 40, paddingX: 32, text: "sm", phoneHeight: 44 },
    },
    weight: 500,
    radius: "md",
    disabledOpacity: 0.5,
    /** default (the accent): bg-primary, which is --brand-text, the site's --brand-ink; hover:bg-primary/90. */
    hoverAlpha: 0.9,
    /** FILLED_FOCUS: a 1.5px outline 2px off the fill, in the ring colour. */
    filledFocus: { width: 1.5, offset: 2 },
    /** Everything else: ring-2 ring-ring/70 ring-offset-1. */
    focus: { width: 2, alpha: 0.7, offset: 1 },
  },

  /**
   * onecamp-fe components/ui/input.tsx, BASE and inputSizing: 44px and 16px
   * text on a phone, 36px and 14px from md; a transparent ground, the strong
   * border, text-3 on hover, the accent border and a soft ring on focus.
   */
  field: { height: 36, phoneHeight: 44, paddingX: 12, text: "sm", phoneText: "base", radius: "md", ringAlpha: 0.25, disabledOpacity: 0.7 },

  /** onecamp-fe components/ui/badge.tsx, the default badge: a neutral label on the highlight step. */
  chip: { paddingX: 10, paddingY: 2, text: "xs", weight: 500, radius: "md" },

  /** onecamp-fe components/ui/card.tsx: a hairline, the card ground, radius lg, no shadow. */
  card: { radius: "lg", border: 1 },

  /** onecamp-fe app/globals.css @theme, MOTION: 120ms for hover and press, one easing; the spring for a knob. */
  motion: { duration: 120, ease: "cubic-bezier(0.2, 0.8, 0.2, 1)", spring: "cubic-bezier(0.3, 1.35, 0.5, 1)" },

  /** onecamp-fe public/logo.svg: a bare ring, no tile, one literal colour in both themes. */
  logo: { viewBox: 512, r: 176, stroke: 56, colour: "#c84f00" },

  /** onecamp-fe components/navigationBar/desktop/desktopNavigationTopBar.tsx: h-12 on bg-canvas. */
  topBar: { height: 48 },

  /** onecamp-fe app/globals.css: svg.lucide[stroke-width="2"] { stroke-width: 1.5 }. */
  icon: { stroke: 1.5 },

  /** onecamp-fe app/globals.css @theme: shadows only for what floats. */
  shadow: { popover: "0 4px 16px rgb(0 0 0 / 0.08)", dialog: "0 16px 48px rgb(0 0 0 / 0.16)" },
} as const

export type TypeStep = keyof typeof APP.type
