import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import { DEFAULT_USD_RATE, defaultPricing, usdAt } from "./pricing"
import { site } from "./site"

/**
 * Every price the site says out loud must be the price it charges.
 *
 * The price is admin-editable and fetched live, which is right, and it meant
 * the number appeared in three other places that a change did not reach: the
 * marketing copy, the sales blurb, and the schema.org offer that search engines
 * read. The structured data is now derived from the same source. Prose cannot
 * be, so it is pinned here instead.
 *
 * This is the same failure as the Slack import FAQ, which is guarded next door:
 * something true was written down once and quietly stopped being true. A price
 * is the worst possible instance of it, because a visitor who reads one number
 * and is charged another does not file a bug, they leave.
 */
const files = {
  "content/onecamp.md": resolve(__dirname, "..", "content", "onecamp.md"),
  "lib/content.ts": resolve(__dirname, "content.ts"),
}

/** Every module that holds its own copy of the price, and the fields to check. */
const mirrors: Array<[string, () => number, () => number]> = [
  ["lib/site.ts priceInr", () => site.priceInr, () => defaultPricing.lifetime_inr],
  ["lib/site.ts cloudPriceInr", () => site.cloudPriceInr, () => defaultPricing.cloud_inr],
]

/** Every "$N" in the text, as numbers, so a stale price cannot hide as prose. */
function dollarFigures(body: string): number[] {
  return [...body.matchAll(/\$(\d[\d,]*)/g)].map((m) => Number(m[1].replace(/,/g, "")))
}

describe("the price on the page is the price in the module", () => {
  const { lifetime_usd, cloud_usd, lifetime_inr } = defaultPricing

  // The licence USED to equal one month of the managed plan, and this test
  // asserted it, correctly: the equality was the sentence the pricing rested on.
  // It was deliberately broken on 14 September 2026 when the licence went to
  // $299 / Rs 24,999 and cloud stayed put, and the copy that leaned on it was
  // rewritten in the same change rather than restated as a multiple — 299/99 is
  // three, 24,999/9,999 is two and a half, and a claim true only in dollars is
  // not one this page can make.
  //
  // What replaces it is the invariant that is still real: the rupee figure and
  // the paise figure are two spellings of one number, and a typo in either is a
  // wrong charge rather than a wrong sentence.
  it("spells the rupee price the same way twice", () => {
    expect(defaultPricing.lifetime_paise).toBe(lifetime_inr * 100)
    expect(defaultPricing.cloud_paise).toBe(defaultPricing.cloud_inr * 100)
  })

  // A licence that costs less than a month of the managed plan would invert the
  // offer — buy it outright for less than renting it once — and that is a
  // pricing mistake no amount of copy can carry.
  it("never prices the licence below a month of the managed plan", () => {
    expect(lifetime_usd).toBeGreaterThanOrEqual(cloud_usd)
    expect(lifetime_inr).toBeGreaterThanOrEqual(defaultPricing.cloud_inr)
  })

  // site.ts held a third copy and had already drifted to Rs 2,000 against a
  // live charge of Rs 1,999. Nothing was watching, because nothing was looking.
  for (const [what, mirror, source] of mirrors) {
    it(`keeps ${what} equal to the pricing module`, () => {
      expect(mirror()).toBe(source())
    })
  }

  for (const [name, path] of Object.entries(files)) {
    it(`quotes no superseded licence price in ${name}`, () => {
      const body = readFileSync(path, "utf8")
      // Anything under the current licence price and above a plausible floor is
      // either an old licence price or a competitor's per-seat figure. The
      // competitor figures are all per user per month and carry that unit, so
      // strip them before judging what is left.
      const withoutPerSeat = body.replace(/\$\d[\d.,]*\s*(?:\/\s*(?:user|mo)|per\s+user)/gi, "")
      const stale = dollarFigures(withoutPerSeat).filter((n) => n === 19 || n === 29 || n === 49)
      expect(stale).toEqual([])
    })
  }

  it("states the licence price somewhere a buyer will read it", () => {
    const body = readFileSync(files["content/onecamp.md"], "utf8")
    expect(body).toContain(`₹${lifetime_inr.toLocaleString("en-IN")}`)
  })

  // Dollars are the rupee price at the day's rate, worked out by the backend.
  // A dollar price typed anywhere is wrong the next day: the $299 and $99 that
  // were typed in were 14% high and 5% low against what a US card was charged.
  it("derives every dollar default from the rupee price", () => {
    const p = defaultPricing
    expect(p.usd_rate).toBe(DEFAULT_USD_RATE)
    expect(p.lifetime_usd).toBe(usdAt(p.lifetime_paise, p.usd_rate))
    expect(p.cloud_usd).toBe(usdAt(p.cloud_paise, p.usd_rate))
    expect(p.business_usd).toBe(usdAt(p.business_paise, p.usd_rate))
    expect(p.storage_addon_usd).toBe(usdAt(p.storage_addon_paise, p.usd_rate))
  })

  for (const [name, path] of Object.entries(files)) {
    it(`types no dollar price of ours into ${name}`, () => {
      const body = readFileSync(path, "utf8")
      // Our prices, in dollars, as prose: "$99 One-Time", "₹24,999 ($299)",
      // "$299 lifetime". Other people's dollar prices (a $12 droplet, a $10
      // seat) are theirs and stay.
      expect(body.match(/\$\d[\d,]*\s*(?:once|one-time|lifetime|licen[cs]e)/gi) ?? []).toEqual([])
      expect(body.match(/₹[\d,]+\s*\(\s*\$\d/g) ?? []).toEqual([])
    })
  }
})

/**
 * Estimates in a visitor's own currency (plan A2, owner decision D1): every
 * foreign amount on the page is a rupee amount over the backend's rupees per
 * unit for the day. None is typed: no source file writes a euro, pound or
 * Singapore, Australian or Canadian dollar amount.
 */
describe("estimates in the visitor's currency", () => {
  it("are the rupee price over the day's rate, in each display currency", async () => {
    const { localEstimate, defaultPricing } = await import("./pricing")
    const { regionFor } = await import("./visitorCurrency")
    // A fixture of what the backend answers, not a price.
    const rates = { USD: 96.87, EUR: 112.64, GBP: 129.16, SGD: 74.52, AUD: 63.73, CAD: 70.19 }
    const p = { ...defaultPricing, rates }
    for (const [country, cur] of [["US", "USD"], ["DE", "EUR"], ["GB", "GBP"], ["SG", "SGD"], ["AU", "AUD"], ["CA", "CAD"]] as const) {
      const shown = localEstimate(p, p.lifetime_inr, regionFor(country))
      const n = Number(shown.replace(/[^\d]/g, ""))
      expect(n, `${country} ${shown}`).toBe(Math.round(p.lifetime_inr / rates[cur]))
    }
    // An older backend with no rates: dollars from usd_rate, as before.
    expect(localEstimate(defaultPricing, 24999, regionFor("DE"))).toBe(`≈ $${Math.round(24999 / defaultPricing.usd_rate)}`)
    expect(localEstimate(p, 24999, regionFor("IN"))).toBe("")
  })

  it("types no foreign amount into the site", async () => {
    const { readdirSync, statSync } = await import("node:fs")
    const { join } = await import("node:path")
    const root = resolve(__dirname, "..")
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const e of readdirSync(dir)) {
        const p = join(dir, e)
        if (statSync(p).isDirectory()) walk(p, out)
        else if (/\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p)) out.push(p)
      }
      return out
    }
    const sources = Object.fromEntries(
      ["app", "components", "lib", "hooks"].flatMap((d) => walk(join(root, d))).map((f) => [
        f.slice(root.length + 1),
        // Comments may show what an estimate looks like; code may not type one.
        readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|\s)\/\/[^\n]*/g, "$1"),
      ]),
    )
    const offenders: string[] = []
    for (const [name, body] of Object.entries(sources)) {
      for (const m of body.match(/(?:€\s?\d|\d\s?€|£\s?\d|\b(?:S|A|C)\$\s?\d)/g) ?? []) offenders.push(`${name}: ${m}`)
    }
    expect(offenders).toEqual([])
  })
})
