import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HomeComparison } from "@/components/site/HomeComparison"
import { PlanComparison } from "@/components/site/PlanComparison"
import { RAISED_ROW } from "@/components/site/planHues"
import { PLAN_ROWS } from "@/lib/plans"
import { SHARED } from "@/lib/palette"
import { ALPHA } from "@/lib/appSystem"
import { defaultPricing } from "@/lib/pricing"

/**
 * The plan table's raised licence column (storefront audit §5.2 and P3). In
 * light mode it was a card on a page of the same white, held up only by two
 * hairlines. It stands on the press step now (ink at 7 %, white at 7 % in
 * dark), from the tokens and never a raw colour, so the column is a ground of
 * its own in both themes. Neutral since v3.1: a plan is not an area of the
 * product, so it wears no area's hue (the licence's sun tint went).
 *
 * The home page's comparison raises OneCamp on the same tint (planHues.ts
 * RAISED_TINT): its column from sm, and its line in each card on a phone.
 */

type RGB = [number, number, number]

/** The press step laid over a ground: what the raised column looks like. */
function pressOver(theme: "light" | "dark", ground: RGB): RGB {
  const [ink, a] = ALPHA[theme].press
  return ground.map((g, i) => Math.round(g * (1 - a) + ink[i]! * a)) as RGB
}
const NEUTRAL = "bg-press"

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

  it("stands on the same neutral ground as the plan table's, never the card's white", () => {
    for (const c of cells) {
      expect(c.split(/\s+/), c).toContain(NEUTRAL)
      expect(c, c).not.toMatch(/(^|\s)(hue-[a-z]+|bg-hue-tint)(\s|$)/)
      expect(c, c).not.toMatch(/(^|\s)bg-(card|white|background)(\s|$)/)
    }
  })
})

// On a phone the home comparison is one card per row, with OneCamp's answer on
// a raised line: the sunken surface, #F8F9FA inside a white card, so in light
// mode it was the same white on white as the columns were.
describe("the home comparison's raised line on a phone", () => {
  const html = renderToString(<HomeComparison pricing={defaultPricing} />)
  const cards = html.slice(html.indexOf("</table>"))
  const row = RAISED_ROW.split(/\s+/)
  const raised = [...cards.matchAll(/<p class="([^"]*)"/g)].map((m) => m[1]!.split(/\s+/)).filter((c) => row.every((k) => c.includes(k)))

  it("is OneCamp's answer in every card, on the same tint as the columns", () => {
    expect(raised).toHaveLength(8)
    for (const c of raised) {
      expect(c).toContain(NEUTRAL)
      expect(c.join(" ")).not.toMatch(/(^|\s)bg-(card|white|background|muted)(\s|$)/)
    }
    expect(cards).not.toMatch(/class="[^"]*\bbg-muted\b/)
  })

  for (const theme of ["light", "dark"] as const) {
    const card = SHARED[theme].card
    const tint = pressOver(theme, card)

    it(`${theme}: is a ground of its own inside the card, and its words read on it`, () => {
      expect(contrast(tint, card), `the tint in the card is ${contrast(tint, card).toFixed(3)}:1`).toBeGreaterThanOrEqual(1.05)
      expect(contrast(SHARED[theme].foreground, tint)).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe("the raised ground", () => {
  it("is written once, in planHues.ts, for every column and line that is raised", () => {
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const e of readdirSync(dir)) {
        const p = join(dir, e)
        if (statSync(p).isDirectory()) walk(p, out)
        else if (/\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p)) out.push(p)
      }
      return out
    }
    const sources = ["app", "components", "lib"].flatMap((d) => walk(join(process.cwd(), d)))
    const writers = (rule: string) =>
      sources.filter((f) => readFileSync(f, "utf8").includes(rule)).map((f) => f.slice(process.cwd().length + 1))
    expect(writers("inset_1px_0_0_var(--line-2-c),inset_-1px_0_0_var(--line-2-c)")).toEqual(["components/site/planHues.ts"])
    expect(writers("inset_0_0_0_1px_var(--line-2-c)")).toEqual(["components/site/planHues.ts"])
  })
})

describe("the plan table's raised licence column", () => {
  const html = renderToString(<PlanComparison pricing={defaultPricing} />)
  const cells = raisedCells(html)

  it("is the licence's heading, a cell for every row, and its button", () => {
    expect(cells).toHaveLength(PLAN_ROWS.length + 2)
  })

  it("stands on the neutral press step, from the tokens, never a hue or a raw colour", () => {
    for (const c of cells) {
      expect(c.split(/\s+/), c).toContain(NEUTRAL)
      expect(c, c).not.toMatch(/(^|\s)(hue-[a-z]+|bg-hue-tint)(\s|$)/)
      expect(c, c).not.toMatch(/(^|\s)bg-(card|white|background)(\s|$)|bg-\[#|bg-\[rgb/)
    }
  })

  for (const theme of ["light", "dark"] as const) {
    const page = SHARED[theme].background
    const tint = pressOver(theme, page)

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
