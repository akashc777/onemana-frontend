import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HomeComparison } from "@/components/site/HomeComparison"
import { defaultPricing } from "@/lib/pricing"

/**
 * OneCamp's column is lifted (site.md S12): the raised tint between two
 * hairlines (planHues RAISED_COLUMN), under a 2px brand rule, with 16 px
 * inside each edge, and the column after it starts 16 px past it, in every
 * row. On a phone the table is one card per row, so nothing scrolls sideways,
 * and the row OneCamp loses keeps its berry chip.
 */
describe("the home comparison's columns", () => {
  const html = renderToString(<HomeComparison pricing={defaultPricing} />)
  const table = html.slice(html.indexOf("<table"), html.indexOf("</table>"))
  const rows = table.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? []

  it("start the column after OneCamp's lifted column 16 px past it, in every row", () => {
    expect(rows.length).toBe(9)
    for (const row of rows) {
      const cells = [...row.matchAll(/<t[hd][^>]*class="([^"]*)"/g)].map((m) => m[1]!)
      const lifted = cells.findIndex((c) => /\bbg-press\b/.test(c))
      expect(lifted).toBe(1)
      expect(cells[lifted]).toMatch(/(^|\s)pl-4(\s|$)/)
      expect(cells[lifted + 1]).toMatch(/(^|\s)pl-4(\s|$)/)
    }
    expect(rows[0]).toMatch(/border-t-2 border-foreground\/70/)
  })

  it("is one card per row on a phone, and says where OneCamp loses", () => {
    expect(table).toMatch(/class="[^"]*\bhidden\b[^"]*\bsm:table\b/)
    const cards = html.slice(html.indexOf("</table>"))
    expect(cards).toMatch(/<ul class="[^"]*sm:hidden/)
    expect(cards.match(/<li /g)?.length).toBe(8)
    expect(html.match(/We lose this one/g)?.length).toBe(2)
    expect(cards).not.toContain("overflow-x-auto")
  })
})
