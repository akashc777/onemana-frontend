import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HomeComparison } from "@/components/site/HomeComparison"
import { SavingChip } from "@/components/site/SavingChip"
import { RegionProvider } from "@/hooks/useVisitorRegion"
import { defaultPricing, type Pricing } from "@/lib/pricing"
import { SEAT_COSTS, SERVER_USD_PER_MONTH, teamCost } from "@/lib/teamCost"
import { regionFor, type Region } from "@/lib/visitorCurrency"

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

/**
 * The price row compares OneCamp's first year with the per-seat stack's, so
 * both sides are in one currency. It read "₹24,999 once, plus your server"
 * beside "About $8,300" for a reader in the US: the bigger number was ours,
 * and seeing that the licence is a small part of the stack's bill took
 * knowing the rupee's rate. Abroad both sides are in the reader's money, with
 * the rupee charge said in brackets; in India both are in rupees.
 */
describe("the price row", () => {
  /** Rupees to one unit of each currency, as the backend answers on a day; a test fixture, not a price. */
  const live: Pricing = { ...defaultPricing, rates: { USD: 96.87, EUR: 112.64, GBP: 129.16, SGD: 74.52, AUD: 63.73, CAD: 70.19 } }
  /** What is seen: words a screen reader alone is given (sr-only) are left out. */
  const text = (html: string) =>
    html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<span class="sr-only">[^<]*<\/span>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .replace(/ ([,.;:?!)])/g, "$1")
      .replace(/\( /g, "(")
      .trim()
  const render = (region: Region | null) =>
    renderToString(region ? <RegionProvider region={region}><HomeComparison pricing={live} /></RegionProvider> : <HomeComparison pricing={live} />)
  /** The price row's cells on a wide screen, and its card on a phone, as read. */
  const priceRow = (html: string) => {
    const table = html.slice(html.indexOf("<table"), html.indexOf("</table>"))
    const row = (table.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) ?? []).find((r) => r.includes("40 people, first year"))!
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => text(m[1]!))
    const card = (html.slice(html.indexOf("</table>")).match(/<li [\s\S]*?<\/li>/g) ?? []).find((c) => c.includes("40 people, first year"))!
    return { cells, card: text(card) }
  }
  /** The currencies a reader compares in a piece of text: the rupee charge in brackets is what the card is billed, not a figure to compare. */
  const currencies = (s: string) => new Set((s.replace(/\(charged ₹[\d,]+\)/g, "").match(/[A-Z]?\$|₹|€|£/g) ?? []).map((c) => c.replace(/^[A-Z]/, "")))

  const READERS: [string, Region | null, string, string][] = [
    // [who, region, OneCamp's figure, the symbol both sides share]
    ["the server's HTML, before the reader is known", null, "≈ $258 once (charged ₹24,999), plus your server", "$"],
    ["a reader in the US", regionFor("US", "en-US"), "≈ $258 once (charged ₹24,999), plus your server", "$"],
    ["a reader in the UK", regionFor("GB", "en-GB"), "≈ £194 once (charged ₹24,999), plus your server", "£"],
    ["a reader in Germany", regionFor("DE", "de-DE"), "≈ 222 € once (charged ₹24,999), plus your server", "€"],
    ["a reader in Singapore", regionFor("SG", "en-SG"), "≈ S$335 once (charged ₹24,999), plus your server", "$"],
    ["a reader in India", regionFor("IN", "en-IN"), "₹24,999 once, plus your server", "₹"],
  ]

  it("puts one currency in the price row: the reader's money on both sides abroad, rupees on both sides in India", () => {
    for (const [who, region, figure, symbol] of READERS) {
      const { cells, card } = priceRow(render(region))
      expect(cells[0], who).toContain(figure)
      expect([...currencies(`${cells[0]} ${cells[1]}`)], who).toEqual([symbol])
      expect(card, who).toContain(figure)
      expect([...currencies(card.slice(0, card.indexOf("Mattermost")))], who).toEqual([symbol])
    }
  })

  it("says how many times less OneCamp's first year is, worked out from the same figures", () => {
    const times = Math.round(teamCost(40, false, live.lifetime_usd, SERVER_USD_PER_MONTH, SEAT_COSTS).multiple)
    expect(times).toBeGreaterThanOrEqual(2)
    for (const [who, region] of READERS) {
      const { cells, card } = priceRow(render(region))
      expect(cells[0], who).toContain(`${times}× less in the first year`)
      expect(card, who).toContain(`${times}× less in the first year`)
    }
  })

  it("reads the estimate's sign as 'about' to a screen reader", () => {
    const html = render(regionFor("US", "en-US"))
    expect(html).toMatch(/<span aria-hidden="true">≈ <\/span><span class="sr-only">about <\/span>\$258/)
  })

  // With the backend's charge_usd on, checkout charges a buyer abroad the
  // licence's exact dollar price, so the row says that price: never a dollar
  // estimate "(charged ₹24,999)" beside a charge in dollars. In India it stays
  // rupees, which is what India is charged.
  it("says the exact dollar charge for the licence abroad when the backend charges it in dollars, and rupees in India", () => {
    const dollars: Pricing = { ...live, charge_usd: true }
    const row = (region: Region) => priceRow(renderToString(<RegionProvider region={region}><HomeComparison pricing={dollars} /></RegionProvider>))
    const usd = `$${dollars.lifetime_usd}`
    const us = row(regionFor("US", "en-US"))
    expect(us.cells[0]).toContain(`${usd} once, plus your server`)
    expect(us.cells[0]).not.toContain("≈")
    expect(us.cells[0]).not.toContain("₹")
    expect(us.card).toContain(`${usd} once, plus your server`)
    const uk = row(regionFor("GB", "en-GB"))
    expect(uk.cells[0]).toContain(`once (charged ${usd}), plus your server`)
    expect(uk.cells[0]).not.toContain("₹")
    const india = row(regionFor("IN", "en-IN"))
    expect(india.cells[0]).toContain("₹24,999 once, plus your server")
    expect(india.cells[0]).not.toContain("$")
  })
})

/**
 * The moss chip says a multiple only from twice up: below that the gap is
 * small, and the calculator says so in words. The home row and the
 * calculator draw the same chip, so the rule is pinned once, here.
 */
describe("the saving chip", () => {
  it("draws nothing below twice, and the rounded multiple from twice up", () => {
    const chip = (multiple: number) => renderToString(<SavingChip multiple={multiple} />).replace(/<!--[\s\S]*?-->/g, "")
    expect(chip(1.9)).toBe("")
    expect(chip(Number.NaN)).toBe("")
    expect(chip(2)).toContain(">2× less in the first year<")
    expect(chip(20.4)).toContain(">20× less in the first year<")
  })
})
