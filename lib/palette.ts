/**
 * The storefront and the workspace are one product to a visitor: the page they
 * read before paying must look like the app they get after. The workspace
 * (onecamp-fe) writes its palette in OKLCH; this site writes the same colours as
 * sRGB triples. Both repos pin this table (app/sharedTokens.test.ts here): onecamp-fe's app/sharedTokens.test.ts
 * converts its OKLCH and checks it against the same numbers. Change a shared
 * colour in both places, or neither.
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
 * three cuts, the design direction's table verbatim. globals.css writes them
 * as sRGB triples so Tailwind can add alpha; the workspace writes the same
 * table as hex in its globals.css and pins it in its app/sharedTokens.test.ts.
 * Both tables are this one, and both tests compare exactly, with no rounding:
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

/** "#3B7DDD" as the triple globals.css writes, [59, 125, 221]. */
export function hexToTriple(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
