import { describe, expect, it } from "vitest"

import { SHARED } from "@/lib/palette"

/**
 * Every pair a visitor reads clears WCAG AA, in both themes.
 *
 * OKLCH and sRGB triples both hide contrast from the eye: an orange that looks
 * right can score 4.4 against its own text and fail. So the pairs are measured
 * here rather than judged, from the same numbers globals.css carries (which
 * sharedTokens.test.ts pins). Body text and links need 4.5; large text and
 * the parts of a control need 3. Hairlines (border) are structure only and are
 * deliberately not here, and neither is `faint`, which is for placeholders and
 * disabled text.
 */

type RGB = [number, number, number]

function luminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const PAIRS: [fg: string, bg: string, min: number][] = [
  ["foreground", "background", 4.5],
  ["foreground", "card", 4.5],
  ["foreground", "muted", 4.5],
  ["foreground", "accent", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "card", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["brand-ink", "background", 4.5],
  ["brand-ink", "card", 4.5],
  ["brand-ink", "brand-soft", 4.5],
  ["brand-foreground", "brand", 4.5],
  ["agent-foreground", "agent", 4.5],
  ["agent", "agent-muted", 4.5],
  // A filled button against the page, and the focus ring: non-text, 3:1.
  ["brand", "background", 3],
  ["danger", "background", 4.5],
  ["success", "background", 3],
]

describe("palette contrast", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const [fg, bg, min] of PAIRS) {
      it(`${theme}: ${fg} on ${bg} is at least ${min}:1`, () => {
        const ratio = contrast(SHARED[theme][fg], SHARED[theme][bg])
        expect(ratio, `${fg} on ${bg} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min)
      })
    }
  }
})
