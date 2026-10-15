import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HomeComparison } from "@/components/site/HomeComparison"
import { PlanComparison } from "@/components/site/PlanComparison"
import { PLAN_HUE } from "@/components/site/planHues"
import { HUE_CLASS } from "@/components/ui/graphics/hues"
import { PLAN_ROWS } from "@/lib/plans"
import { CAMP, SHARED, hexToTriple } from "@/lib/palette"
import { defaultPricing } from "@/lib/pricing"

/**
 * The plan table's raised licence column (storefront audit §5.2 and P3). In
 * light mode it was a card on a page of the same white, held up only by two
 * hairlines. It takes its plan's hue tint now (sun, the colour of the
 * licence's dot), from the tokens and never a raw colour, so the column is a
 * ground of its own in both themes. In dark, where the card already read, the
 * tint is lighter than the page too.
 */

type RGB = [number, number, number]

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

/** The classes of the wide table's raised cells: the column between its two hairlines. */
function raisedCells(html: string): string[] {
  return [...html.matchAll(/<t[hd][^>]*class="([^"]*)"/g)].map((m) => m[1]!).filter((c) => c.includes("inset_1px_0_0_var(--line-2-c)"))
}

// The home page's comparison raised OneCamp's column on the same white card
// (bg-card on the white page). Both tables take one rule, planHues RAISED_COLUMN.
describe("the home comparison's raised column", () => {
  const cells = raisedCells(renderToString(<HomeComparison pricing={defaultPricing} />))

  it("is OneCamp's heading and a cell for every row", () => {
    expect(cells.length).toBeGreaterThanOrEqual(6)
  })

  it("stands on the same tint as the plan table's, never the card's white", () => {
    for (const c of cells) {
      expect(c.split(/\s+/), c).toContain(HUE_CLASS[PLAN_HUE.lifetime])
      expect(c.split(/\s+/), c).toContain("bg-hue-tint")
      expect(c, c).not.toMatch(/(^|\s)bg-(card|white|background)(\s|$)/)
    }
  })
})

describe("the raised column", () => {
  it("is written once, in planHues.ts, for every table that raises one", () => {
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const e of readdirSync(dir)) {
        const p = join(dir, e)
        if (statSync(p).isDirectory()) walk(p, out)
        else if (/\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p)) out.push(p)
      }
      return out
    }
    const writers = ["app", "components", "lib"]
      .flatMap((d) => walk(join(process.cwd(), d)))
      .filter((f) => readFileSync(f, "utf8").includes("inset_1px_0_0_var(--line-2-c),inset_-1px_0_0_var(--line-2-c)"))
      .map((f) => f.slice(process.cwd().length + 1))
    expect(writers).toEqual(["components/site/planHues.ts"])
  })
})

describe("the plan table's raised licence column", () => {
  const html = renderToString(<PlanComparison pricing={defaultPricing} />)
  const cells = raisedCells(html)

  it("is the licence's heading, a cell for every row, and its button", () => {
    expect(cells).toHaveLength(PLAN_ROWS.length + 2)
  })

  it("stands on its plan's hue tint, from the tokens, never a raw colour", () => {
    for (const c of cells) {
      expect(c.split(/\s+/), c).toContain(HUE_CLASS[PLAN_HUE.lifetime])
      expect(c.split(/\s+/), c).toContain("bg-hue-tint")
      expect(c, c).not.toMatch(/(^|\s)bg-(card|white|background)(\s|$)|bg-\[#|bg-\[rgb/)
    }
  })

  for (const theme of ["light", "dark"] as const) {
    const tint = hexToTriple(CAMP[theme][`camp-${PLAN_HUE.lifetime}-tint`])
    const page = SHARED[theme].background

    it(`${theme}: is a ground of its own, apart from the page`, () => {
      expect(contrast(tint, page), `the tint on the page is ${contrast(tint, page).toFixed(3)}:1`).toBeGreaterThanOrEqual(1.05)
      // In dark the raised column read because it was lighter than the page; it still is.
      if (theme === "dark") expect(luminance(tint)).toBeGreaterThan(luminance(page))
    })

    it(`${theme}: keeps its words and its button readable on the tint`, () => {
      for (const [fg, min] of [["foreground", 4.5], ["muted-foreground", 4.5], ["brand", 3]] as const) {
        const ratio = contrast(SHARED[theme][fg], tint)
        expect(ratio, `${fg} on the tint is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min)
      }
    })
  }
})
