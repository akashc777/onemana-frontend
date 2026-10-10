/**
 * THE APP'S BUILDING BLOCKS, CHECKED IN. OneCamp (the workspace, onecamp-fe)
 * is the source of truth for the design system; this site is the same product
 * before a visitor pays, so its primitives are the app's. These are the app's
 * numbers, copied by hand with the file each comes from, and
 * app/appSystem.test.ts holds the site's tokens and primitives to them. The
 * colours are in lib/palette.ts (SHARED and CAMP), pinned by
 * app/sharedTokens.test.ts in both repos.
 *
 * To change one: change the app, then this copy, then the site. A test that
 * fails here means the site drifted, or the app moved and this copy did not.
 *
 * Marketing display sizes (the hero, a page title) may be larger than any
 * size the app has. They still take the app's heading face, weight and
 * colour, and the app's one tightening step (tracking-tight) only above its
 * largest title.
 */
export const APP = {
  /** onecamp-fe app/globals.css, @theme: --radius is 0.375rem; sm is 2px less, lg and xl 4px more, 2xl 8px more. */
  radius: { sm: 4, md: 6, lg: 10, xl: 10, "2xl": 14 },

  /**
   * onecamp-fe app/globals.css, @theme "THE APP SCALE" (3xs to sm) and
   * Tailwind v4's defaults for the rest: size and line height in px.
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
   * letter-spacing on text) and components/ui/pageHeader.tsx (the page title:
   * font-display font-semibold tracking-normal, text-2xl or text-3xl).
   */
  heading: { face: "Inter Tight", weight: 600, tracking: "normal", tightStep: "-0.025em", largestTitle: 36 },

  /** onecamp-fe app/globals.css @layer components: * { font-feature-settings: "calt" 0 }. */
  text: { face: "Inter", featureSettings: '"calt" 0' },

  /** onecamp-fe components/ui/button.tsx, buttonVariants. Height, horizontal padding and text size in px. */
  button: {
    sizes: {
      default: { height: 36, paddingX: 16, text: 14 },
      sm: { height: 32, paddingX: 12, text: 13 },
      lg: { height: 40, paddingX: 32, text: 14 },
    },
    weight: 500,
    radius: 6,
    disabledOpacity: 0.5,
    /** default (the accent): bg-primary, which is --brand-text, the site's --brand-ink. */
    primaryFill: "brand-ink",
    /** hover:bg-primary/90 */
    hoverAlpha: 0.9,
    /** FILLED_FOCUS: a 1.5px outline 2px off the fill, in the ring colour. */
    filledFocus: { width: 1.5, offset: 2 },
    /** Everything else: ring-2 ring-ring/70 ring-offset-1. */
    focus: { width: 2, alpha: 0.7, offset: 1 },
  },

  /** onecamp-fe components/ui/input.tsx, BASE and inputSizing: 44px and 16px text on a phone, 36px and 14px from md. */
  input: { height: 36, phoneHeight: 44, paddingX: 12, text: 14, phoneText: 16, radius: 6, ringAlpha: 0.25 },

  /** onecamp-fe app/globals.css @theme, MOTION: 120ms for hover and press, one easing. */
  motion: { duration: 120, ease: "cubic-bezier(0.2, 0.8, 0.2, 1)", spring: "cubic-bezier(0.3, 1.35, 0.5, 1)" },

  /** onecamp-fe public/logo.svg: a bare ring, no tile, one literal colour. */
  logo: { viewBox: 512, r: 176, stroke: 56, colour: "#c84f00" },

  /** onecamp-fe components/navigationBar/desktop/desktopNavigationTopBar.tsx: h-12 on bg-canvas. */
  topBar: { height: 48 },

  /** onecamp-fe app/globals.css: svg.lucide[stroke-width="2"] { stroke-width: 1.5 }. */
  icon: { stroke: 1.5 },

  /** onecamp-fe app/globals.css @theme: shadows only for what floats. */
  shadow: { popover: "0 4px 16px rgb(0 0 0 / 0.08)", dialog: "0 16px 48px rgb(0 0 0 / 0.16)" },
} as const
