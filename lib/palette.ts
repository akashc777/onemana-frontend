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
    accent: [237, 238, 240],
    "accent-foreground": [20, 22, 26],
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
    accent: [37, 40, 46],
    "accent-foreground": [237, 238, 240],
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
