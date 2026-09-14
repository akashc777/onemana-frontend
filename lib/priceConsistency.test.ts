import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import { defaultPricing } from "./pricing"
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
  ["lib/site.ts priceUsd", () => site.priceUsd, () => defaultPricing.lifetime_usd],
  ["lib/site.ts priceInr", () => site.priceInr, () => defaultPricing.lifetime_inr],
  ["lib/site.ts cloudPriceUsd", () => site.cloudPriceUsd, () => defaultPricing.cloud_usd],
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
    expect(dollarFigures(body)).toContain(lifetime_usd)
  })
})
