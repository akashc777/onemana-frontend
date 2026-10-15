import { describe, expect, it } from "vitest"
import { currencyNote, defaultPricing, priceWithEstimate, type Pricing } from "@/lib/pricing"
import { regionFor } from "@/lib/visitorCurrency"

const rupeesOnly = { ...defaultPricing, usd_rate: 96.37, charge_usd: false }
const dollars = { ...rupeesOnly, charge_usd: true }

describe("currencyNote", () => {
  it("says rupees and the rate while everything is charged in rupees", () => {
    expect(currencyNote(rupeesOnly, { inIndia: false })).toMatch(/^You pay in Indian rupees\. .*₹96\.37 to the dollar/)
  })

  it("tells a buyer abroad the dollar price is what their card is charged", () => {
    expect(currencyNote(dollars, { inIndia: false })).toBe("Charged in US dollars: the price shown is the amount on your card.")
  })

  it("keeps rupees and the GST invoice for a buyer in India", () => {
    expect(currencyNote(dollars, { inIndia: true })).toBe("You pay in Indian rupees, with a GST invoice.")
  })

  it("never claims dollars for Cloud, which is still a rupee subscription", () => {
    expect(currencyNote(dollars, { inIndia: false, cloud: true })).toMatch(/^OneCamp Cloud is billed in Indian rupees\./)
  })

  it("explains both where the country is unknown", () => {
    const note = currencyNote(dollars)
    expect(note).toContain("charged in US dollars outside India and in rupees in India")
    expect(note).toContain("OneCamp Cloud is billed in rupees")
  })
})

/**
 * The one way a sentence or a button writes a price (lib/pricing
 * priceWithEstimate): the rupees, which are charged, and beside them the
 * estimate the plan cards give, in the reader's own money. The pay buttons,
 * the calculator, the plan table and the account page all write it so.
 */
describe("priceWithEstimate", () => {
  /** Rupees to one unit of each currency, as the backend answers on a day; a test fixture, not a price. */
  const live: Pricing = { ...defaultPricing, rates: { USD: 96.87, EUR: 112.64, GBP: 129.16, SGD: 74.52, AUD: 63.73, CAD: 70.19 } }

  it("gives the estimate in the reader's own money", () => {
    expect(priceWithEstimate(live, 24999, regionFor("US"))).toBe("₹24,999 (≈ $258)")
    expect(priceWithEstimate(live, 24999, regionFor("GB", "en-GB"))).toBe("₹24,999 (≈ £194)")
    expect(priceWithEstimate(live, 24999, regionFor("SG", "en-SG"))).toBe("₹24,999 (≈ S$335)")
    // A country with no display currency, and a reader not known yet (the server's HTML), see dollars.
    expect(priceWithEstimate(live, 24999, regionFor("JP", "ja-JP"))).toBe("₹24,999 (≈ $258)")
    expect(priceWithEstimate(live, 24999, null)).toBe("₹24,999 (≈ $258)")
  })

  it("puts what the price is for before the estimate", () => {
    expect(priceWithEstimate(live, 9999, regionFor("GB", "en-GB"), "/mo")).toBe("₹9,999/mo (≈ £77)")
    expect(priceWithEstimate(live, 24999, regionFor("GB", "en-GB"), " once")).toBe("₹24,999 once (≈ £194)")
  })

  it("is the rupees alone in India, in India's grouping, and lakh grouping nowhere else", () => {
    expect(priceWithEstimate(live, 1460000, regionFor("IN", "en-IN"))).toBe("₹14,60,000")
    expect(priceWithEstimate(live, 1460000, regionFor("US"))).toBe("₹1,460,000 (≈ $15,072)")
  })

  it("is the rupees alone when there is no rate to estimate with, never an empty bracket", () => {
    const noRate: Pricing = { ...defaultPricing, usd_rate: 0, rates: undefined }
    expect(priceWithEstimate(noRate, 24999, regionFor("GB", "en-GB"))).toBe("₹24,999")
    expect(priceWithEstimate(noRate, 24999, null, "/mo")).toBe("₹24,999/mo")
  })
})
