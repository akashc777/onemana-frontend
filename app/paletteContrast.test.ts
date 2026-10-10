import { describe, expect, it } from "vitest"

import { CAMP, SHARED, hexToTriple } from "@/lib/palette"

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
  ["success", "background", 3],
  // Meaning colours as text: the -ink cuts, on the page and on a card.
  ["success-ink", "background", 4.8],
  ["warning-ink", "background", 4.8],
  ["info-ink", "background", 4.8],
  ["danger-ink", "background", 4.8],
  ["success-ink", "card", 4.8],
  ["warning-ink", "card", 4.8],
  ["info-ink", "card", 4.8],
  ["danger-ink", "card", 4.8],
]

/** A colour at `alpha` over a ground, as `bg-success/15` paints it. */
function over(fg: RGB, bg: RGB, alpha: number): RGB {
  return fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha))) as RGB
}

describe("palette contrast", () => {
  for (const theme of ["light", "dark"] as const) {
    // Status pills and notices: the ink on its own colour's tint (15% over a card, the strongest used).
    for (const k of ["success", "warning", "info", "danger"]) {
      it(`${theme}: ${k}-ink on a ${k} tint is at least 4.8:1`, () => {
        const tint = over(SHARED[theme][k], SHARED[theme].card, 0.15)
        const ratio = contrast(SHARED[theme][`${k}-ink`], tint)
        expect(ratio, `${k}-ink on its tint is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.8)
      })
    }
    for (const [fg, bg, min] of PAIRS) {
      it(`${theme}: ${fg} on ${bg} is at least ${min}:1`, () => {
        const ratio = contrast(SHARED[theme][fg], SHARED[theme][bg])
        expect(ratio, `${fg} on ${bg} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min)
      })
    }
    // The record's chain marks (components/site/RecordRows.tsx): the box round
    // the shared hash and the rule joining the rows are graphics a reader needs
    // to see the chain, so 3:1 on the page they sit on. They were border-strong,
    // which is a hairline at 1.4:1; muted-foreground at 70% clears it.
    it(`${theme}: the record's chain marks (muted-foreground/70) are at least 3:1 on the page`, () => {
      const mark = over(SHARED[theme]["muted-foreground"], SHARED[theme].background, 0.7)
      const ratio = contrast(mark, SHARED[theme].background)
      expect(ratio, `the chain marks are ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3)
    })

    // The camp palette (the playful layer). The ink is text: 4.5:1 on its own
    // tint (a tag, a tile, initials) and on the page and a card. The strong cut
    // is a graphic: 3:1 on the page, a card, the muted ground of a band and its
    // own tint, where a tile puts its icon. Sun is the tightest in light mode.
    for (const hue of ["sun", "moss", "lake", "sky", "dusk", "berry"]) {
      const camp = (name: string) => hexToTriple(CAMP[theme][name])
      it(`${theme}: camp ${hue} ink reads on its tint, the page and a card`, () => {
        for (const [ground, rgb] of [
          ["its tint", camp(`camp-${hue}-tint`)],
          ["the page", SHARED[theme].background],
          ["a card", SHARED[theme].card],
        ] as const) {
          const ratio = contrast(camp(`camp-${hue}-ink`), rgb)
          expect(ratio, `camp-${hue}-ink on ${ground} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)
        }
      })
      it(`${theme}: camp ${hue} strong is a visible mark on the page, a card, muted and its tint`, () => {
        for (const [ground, rgb] of [
          ["the page", SHARED[theme].background],
          ["a card", SHARED[theme].card],
          ["muted", SHARED[theme].muted],
          ["its tint", camp(`camp-${hue}-tint`)],
        ] as const) {
          const ratio = contrast(camp(`camp-${hue}`), rgb)
          expect(ratio, `camp-${hue} on ${ground} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(3)
        }
      })
    }
  }
})
