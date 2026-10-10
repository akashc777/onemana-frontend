import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { CAMP_HUES } from "@/lib/campHue"
import { CAMP, SHARED, hexToTriple } from "@/lib/palette"

type RGB = [number, number, number]

// WCAG 2 contrast, as app/paletteContrast.test.ts measures it.
function luminance([r, g, b]: RGB): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Text keeps its tokens on a camp band, so every token it uses must read on
 * every tint: a section on a band (Section band=...) holds headings, grey
 * body, links and the primary button, unchanged. Measured, in both themes, for
 * all six hues, so a band can take any of them.
 */
const READ_ON_BAND: [token: string, min: number][] = [
  ["foreground", 4.5],
  ["muted-foreground", 4.5],
  // The primary button's fill against the band: a control's edge, 3:1.
  ["brand", 3],
]

describe("text on a camp band", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const hue of CAMP_HUES) {
      it(`${theme}: every text token reads on the ${hue} band`, () => {
        const tint = hexToTriple(CAMP[theme][`camp-${hue}-tint`])
        for (const [token, min] of READ_ON_BAND) {
          const ratio = contrast(SHARED[theme][token], tint)
          expect(ratio, `${token} on camp-${hue}-tint is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min)
        }
      })
    }
  }
})

/**
 * Links are the exception. The orange link ink misses 4.5:1 on some tints, so
 * on a band a link reads in the text colour with the accent underline
 * (globals.css, [data-band] .link), and Section marks a band for that rule.
 */
describe("links on a camp band", () => {
  it("would fail in the orange ink on at least one tint, which is why the rule exists", () => {
    const misses = CAMP_HUES.filter((hue) => contrast(SHARED.light["brand-ink"], hexToTriple(CAMP.light[`camp-${hue}-tint`])) < 4.5)
    expect(misses.length).toBeGreaterThan(0)
  })

  it("read in the text colour there, with the accent kept in the underline", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8")
    expect(css).toMatch(/\[data-band\] \.link \{\s*@apply text-foreground decoration-brand-ink;/)
    const section = readFileSync(join(process.cwd(), "components/ui/Section.tsx"), "utf8")
    expect(section).toContain("data-band={band}")
  })
})

/**
 * Bands are rare: at most every other section of a page, so two never touch,
 * and never more than two on the home page.
 */
describe("bands on the home page", () => {
  const page = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8")
  const sections = [...page.matchAll(/<Section\b([^>]*)>/g)].map((m) => /\bband=/.test(m[1]))

  it("never puts two banded sections side by side", () => {
    for (let i = 1; i < sections.length; i++) expect(sections[i - 1] && sections[i], `sections ${i - 1} and ${i}`).toBe(false)
    expect(sections.filter(Boolean).length).toBeLessThanOrEqual(2)
  })
})
