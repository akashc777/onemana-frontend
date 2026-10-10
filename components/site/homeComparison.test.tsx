import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HomeComparison } from "@/components/site/HomeComparison"
import { defaultPricing } from "@/lib/pricing"

/**
 * OneCamp's column is tinted, with 16 px of tint inside each edge. The
 * column after it started its words on the tint's edge ("No, their cloud"
 * 2 px from it at 1440), where every other column starts 16 px after the
 * one before. In every row, the cell after the tinted one keeps 16 px.
 */
describe("the home comparison's columns", () => {
  const html = renderToString(<HomeComparison pricing={defaultPricing} />)
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? []

  it("start the column after OneCamp's tint 16 px past it, in every row", () => {
    expect(rows.length).toBe(9)
    for (const row of rows) {
      const cells = [...row.matchAll(/<t[hd][^>]*class="([^"]*)"/g)].map((m) => m[1]!)
      const tinted = cells.findIndex((c) => /\bbg-muted\b/.test(c))
      expect(tinted).toBe(1)
      expect(cells[tinted + 1]).toMatch(/(^|\s)pl-4(\s|$)/)
    }
  })
})
