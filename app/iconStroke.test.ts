import { readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * One icon stroke: 1.75 on the 24 grid (the bar's, and the app's Lucide
 * icons'), which is 1.46 on a 20 grid and 1.17 on a 16 grid, so a line is the
 * same weight at the same size whatever grid an icon was drawn on. Measured
 * before, a 16 px icon's line was 1.0 px (Glyphs, the menu, the theme switch),
 * 1.2 or 1.4 (the select's chevron, the plan ticks) or 1.5 (the docs and
 * account glyphs), and a 20 px tile's 1.25 or 1.9: the docs index's group
 * tiles drawn half again as heavy as the audience pages'. The drawn marks
 * (components/ui/graphics: spots, rings, the hero's orbit) and the logo keep
 * their own weights.
 *
 * And one size beside text: 16 px. The plan cards' header glyph and /buy's
 * plan glyph were 20 px beside 14 and 16 px words.
 */
const ROOT = resolve(__dirname, "..")
const SKIP = ["node_modules", ".next", "admin", "playful-dev", "graphics"]

function tsx(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name)
    if (e.isDirectory()) {
      if (!SKIP.includes(e.name)) tsx(f, out)
    } else if (f.endsWith(".tsx") && !f.includes(".test.") && !f.endsWith("BrandMarks.tsx")) out.push(f)
  }
  return out
}

describe("icons", () => {
  it("have one stroke: 1.75 on the 24 grid, scaled to the grid they are drawn on", () => {
    const offenders: string[] = []
    let icons = 0
    for (const f of [...tsx(join(ROOT, "app")), ...tsx(join(ROOT, "components"))]) {
      const src = readFileSync(f, "utf8")
      for (const m of src.matchAll(/<svg\b[\s\S]*?<\/svg>/g)) {
        const svg = m[0]
        const grid = Number(/viewBox="0 0 (\d+(?:\.\d+)?) /.exec(svg)?.[1] ?? 24)
        const widths = [...svg.matchAll(/strokeWidth=\{?"?(\d+(?:\.\d+)?)/g)].map((w) => Number(w[1]))
        if (!widths.length && !/stroke="currentColor"/.test(svg)) continue
        icons++
        for (const w of widths.length ? widths : [Number.NaN]) {
          const on24 = (w * 24) / grid
          if (!(Math.abs(on24 - 1.75) <= 0.02)) offenders.push(`${f.slice(ROOT.length + 1)}: ${w} on a ${grid} grid (${on24.toFixed(2)} on 24)`)
        }
      }
    }
    expect(icons).toBeGreaterThan(15)
    expect(offenders).toEqual([])
  })

  it("beside text are 16 px", () => {
    const plan = readFileSync(join(ROOT, "components/site/PlanCard.tsx"), "utf8")
    expect(plan).toContain('<Glyph className="size-4 shrink-0 text-hue" />')
    const buy = readFileSync(join(ROOT, "app/buy/BuyCheckout.tsx"), "utf8")
    expect(buy).not.toMatch(/Glyph className="size-5/)
  })
})
