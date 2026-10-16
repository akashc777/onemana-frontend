import { renderToString } from "react-dom/server"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

// The receipt reads its query and /buy routes with the app router, which a
// string render has not mounted.
let query = new URLSearchParams()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
  useSearchParams: () => query,
  usePathname: () => "/",
}))

import HomePage from "@/app/page"
import PricingPage from "@/app/pricing/page"
import FreePage from "@/app/free/page"
import SuccessPage from "@/app/buy/success/page"
import { BuyCheckout } from "@/app/buy/BuyCheckout"
import { AboutView } from "@/components/site/AboutView"
import { PlanColumns } from "@/components/site/PlanColumns"
import { PlanComparison } from "@/components/site/PlanComparison"
import { HomeComparison } from "@/components/site/HomeComparison"
import { CostCalculator } from "@/components/site/CostCalculator"
import { RegionProvider } from "@/hooks/useVisitorRegion"
import { defaultPricing, type Pricing } from "@/lib/pricing"
import { regionFor, type Region } from "@/lib/visitorCurrency"

/**
 * The storefront for a buyer outside India (plan A3, A4, A5; 11 Oct 2026).
 *
 * Most buyers are abroad and every charge is in rupees. A buyer in the US,
 * the UK, Germany or Singapore must never be told about GST: it means nothing
 * in the US and the UK, and in Singapore, which has a GST of its own, "prices
 * include GST" reads as Singapore's tax being handled. They read "No tax added
 * at checkout" and "an invoice from our Indian company" instead. Nor are they
 * shown rupees in lakh grouping (₹14,60,000), which reads as a typo outside
 * India. Each page is rendered as the region sees it; India is the control.
 */

const ABROAD: [string, string][] = [
  ["US", "en-US"],
  ["GB", "en-GB"],
  ["DE", "de-DE"],
  ["SG", "en-SG"],
]
const INDIA = regionFor("IN", "en-IN")

/** Rupees to one unit of each currency, as the backend answers on a day; a test fixture, not a price. */
const live: Pricing = { ...defaultPricing, rates: { USD: 96.87, EUR: 112.64, GBP: 129.16, SGD: 74.52, AUD: 63.73, CAD: 70.19 } }

const as = (region: Region, node: React.ReactNode) => renderToString(<RegionProvider region={region}>{node}</RegionProvider>)

/** The words a reader sees: markup, attributes and React's comment markers removed. */
const words = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .replace(/ ([,.;:?!])/g, "$1")

const LAKH = /\d,\d\d,\d{3}/

// The pages fetch live pricing and releases; offline they use their fallbacks.
const realFetch = globalThis.fetch
beforeAll(() => {
  globalThis.fetch = (() => Promise.reject(new Error("offline in tests"))) as typeof fetch
})
afterAll(() => {
  globalThis.fetch = realFetch
})

async function pagesFor(region: Region): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  out.home = as(region, await HomePage())
  out.pricing = as(region, await PricingPage())
  out.free = as(region, FreePage())
  out.about = as(region, <AboutView />)
  for (const plan of ["lifetime", "cloud"] as const) {
    out[`buy-${plan}`] = renderToString(
      <BuyCheckout initialPlan={plan} initialBilling="monthly" initialPricing={live} initialCountry={region.country} />,
    )
  }
  for (const q of ["", "pending=1", "cloud=1"]) {
    query = new URLSearchParams(q)
    out[`success${q ? `?${q}` : ""}`] = as(region, <SuccessPage />)
  }
  query = new URLSearchParams()
  return out
}

describe("a buyer outside India", () => {
  for (const [country, locale] of ABROAD) {
    const region = regionFor(country, locale)

    it(`in ${country} is never told about GST, on pricing, buy, free, the receipt or about`, async () => {
      const pages = await pagesFor(region)
      for (const [page, html] of Object.entries(pages)) {
        expect(words(html), `${country} ${page}`).not.toMatch(/GST/)
      }
      expect(words(pages.pricing)).toContain("No tax added at checkout")
      expect(words(pages["buy-lifetime"])).toContain("no tax added at checkout")
      expect(words(pages["success?pending=1"])).toContain("an invoice from our Indian company")
      expect(words(pages.pricing)).toContain("Is tax added at checkout?")
    })

    it(`in ${country} reads no lakh grouping on the home page or /compare's calculator`, () => {
      for (const html of [as(region, <HomeComparison pricing={live} />), as(region, <CostCalculator lifetimeUsd={live.lifetime_usd} pricing={live} />)]) {
        expect(words(html)).not.toMatch(LAKH)
        expect(words(html)).not.toMatch(/₹\d{1,2},\d\d,/)
      }
    })
  }

  it("is shown the rivals' stack in dollars in the US and at the day's rate elsewhere", () => {
    const us = words(as(regionFor("US"), <HomeComparison pricing={live} />))
    // 40 people on Slack Pro and Notion Plus: $17.25 a seat-month, $8,280 a year, from lib/teamCost.
    expect(us).toContain("About $8,300")
    expect(us).toContain("at their US-dollar list prices")
    const de = words(as(regionFor("DE", "de-DE"), <HomeComparison pricing={live} />))
    expect(de).toMatch(/About 7\.100 €/)
    const sg = words(as(regionFor("SG", "en-SG"), <HomeComparison pricing={live} />))
    expect(sg).toContain("About S$10,800")
  })

  it("sees the free plan as Free, never ₹0", () => {
    const html = words(as(regionFor("US"), <PlanColumns pricing={live} />))
    expect(html).toMatch(/Free Up to 25 people|Free\b/)
    expect(html).not.toContain("₹0")
  })

  it("sees each price's estimate in their own currency, beside 'billed in Indian rupees'", () => {
    const by = (c: string, l: string) => words(as(regionFor(c, l), <PlanColumns pricing={live} />))
    expect(by("US", "en-US")).toContain("≈ $258 · billed in Indian rupees, your card converts")
    expect(by("GB", "en-GB")).toContain("≈ £194 · billed in Indian rupees")
    expect(by("DE", "de-DE")).toContain("≈ 222 € · billed in Indian rupees")
    expect(by("SG", "en-SG")).toContain("≈ S$335 · billed in Indian rupees")
    expect(by("AU", "en-AU")).toContain("≈ A$392")
    expect(by("CA", "en-CA")).toContain("≈ C$356")
    // A country with no display currency sees dollars.
    expect(by("JP", "ja-JP")).toContain("≈ $258")
  })

  // "Which OneCamp is for you" said "(about $261)" under cards that said
  // "≈ £197" to the same reader (storefront audit §5.2 and P3). The table
  // writes its prices through lib/pricing priceWithEstimate, so its estimate
  // is the cards' own, in the reader's money.
  it("reads the plan table's prices in the same money as the cards above it", () => {
    const readers = [["US", "en-US", "≈ $258"], ["GB", "en-GB", "≈ £194"], ["DE", "de-DE", "≈ 222 €"], ["SG", "en-SG", "≈ S$335"]] as const
    for (const [country, locale, figure] of readers) {
      const region = regionFor(country, locale)
      const cards = words(as(region, <PlanColumns pricing={live} />))
      const table = words(as(region, <PlanComparison pricing={live} />))
      expect(cards, country).toContain(figure)
      expect(table, country).toContain(`₹24,999 once (${figure})`)
      expect(table, country).toMatch(/From ₹9,999\/mo \(≈ /)
      expect(table, country).not.toMatch(/about \$/)
    }
    const india = words(as(INDIA, <PlanComparison pricing={live} />))
    expect(india).toContain("₹24,999 once")
    expect(india).not.toContain("≈")
  })

  // Under the pay button the note named "Dollar amounts" and the dollar's
  // rate, beside a button that said "(≈ £194)", and said the same in India,
  // where no estimate is shown at all. It names the estimate's own currency.
  it("is told the rate of the currency the checkout's estimate is in", async () => {
    const gb = words((await pagesFor(regionFor("GB", "en-GB")))["buy-lifetime"])
    expect(gb).toContain("Pay ₹24,999 (≈ £194) and get your key")
    expect(gb).toContain("The estimate is at today's exchange rate (₹129.16 to the pound)")
    expect(gb).not.toMatch(/Dollar amounts|to the dollar/)
    const india = words((await pagesFor(INDIA))["buy-lifetime"])
    expect(india).toContain("You pay in Indian rupees, with a GST invoice.")
    expect(india).not.toMatch(/exchange rate|to the dollar/)
  })
})

describe("a buyer in India, the control", () => {
  it("is told about GST and sees no estimate", async () => {
    const pages = await pagesFor(INDIA)
    expect(words(pages.pricing)).toContain("Prices include GST")
    expect(words(pages.pricing)).toContain("Do prices include GST?")
    expect(words(pages["buy-lifetime"])).toContain("GST included")
    expect(words(pages["success?pending=1"])).toContain("a GST invoice")
    expect(words(as(INDIA, <PlanColumns pricing={live} />))).not.toContain("≈")
  })

  it("reads rupees in lakh grouping", () => {
    expect(words(as(INDIA, <HomeComparison pricing={live} />))).toMatch(LAKH)
  })
})
