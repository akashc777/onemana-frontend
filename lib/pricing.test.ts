import { describe, expect, it } from "vitest"
import { currencyNote, defaultPricing, displayPrice, priceWithEstimate, type Pricing } from "@/lib/pricing"
import { regionFor } from "@/lib/visitorCurrency"
import { choicePerPerson, cloudChoices } from "@/lib/paymentTerms"

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

  it("names the currency the estimate beside it is in, and talks of none in India", () => {
    const live = { ...rupeesOnly, rates: { USD: 96.87, GBP: 129.16, EUR: 112.64 } }
    expect(currencyNote(live, { region: regionFor("GB", "en-GB") })).toBe(
      "You pay in Indian rupees. The estimate is at today's exchange rate (₹129.16 to the pound); your card converts at its own rate and may add a small foreign transaction fee.",
    )
    expect(currencyNote(live, { region: regionFor("DE", "de-DE") })).toContain("(₹112.64 to the euro)")
    // A currency with no rate today is estimated in dollars, and the note says the dollar's.
    expect(currencyNote(live, { region: regionFor("AU", "en-AU") })).toContain("(₹96.87 to the dollar)")
    expect(currencyNote(live, { region: regionFor("IN", "en-IN") })).toBe("You pay in Indian rupees, with a GST invoice.")
    expect(currencyNote(live, { inIndia: true })).toBe("You pay in Indian rupees, with a GST invoice.")
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

/**
 * A price as one figure for the reader to compare, and what the card is
 * charged when that differs: the reader's own money abroad with the rupee
 * charge beside it, rupees alone in India and when there is no rate, and the
 * exact dollar amount when the backend charges the licence in dollars.
 */
describe("displayPrice", () => {
  /** Rupees to one unit of each currency, as the backend answers on a day; a test fixture, not a price. */
  const live: Pricing = { ...defaultPricing, rates: { USD: 96.87, EUR: 112.64, GBP: 129.16, SGD: 74.52, AUD: 63.73, CAD: 70.19 } }

  it("is the reader's money first abroad, with the rupee charge in the reader's grouping", () => {
    expect(displayPrice(live, 24999, regionFor("US"))).toEqual({ figure: "$258", approx: true, charge: "₹24,999", chargedIn: "INR" })
    expect(displayPrice(live, 24999, regionFor("GB", "en-GB"))).toEqual({ figure: "£194", approx: true, charge: "₹24,999", chargedIn: "INR" })
    expect(displayPrice(live, 1460000, regionFor("US")).charge).toBe("₹1,460,000")
    // Not known yet (the server's HTML), or a country with no display currency: dollars.
    expect(displayPrice(live, 24999, null).figure).toBe("$258")
    expect(displayPrice(live, 24999, regionFor("JP", "ja-JP")).figure).toBe("$258")
  })

  it("is rupees alone in India, and when there is no rate", () => {
    expect(displayPrice(live, 1460000, regionFor("IN", "en-IN"))).toEqual({ figure: "₹14,60,000", approx: false, charge: "", chargedIn: "INR" })
    const noRate: Pricing = { ...defaultPricing, usd_rate: 0, rates: undefined }
    expect(displayPrice(noRate, 24999, regionFor("GB", "en-GB"))).toEqual({ figure: "₹24,999", approx: false, charge: "", chargedIn: "INR" })
  })

  it("is the exact dollar charge for the licence when the backend charges it in dollars, and rupees in India", () => {
    const usd: Pricing = { ...live, charge_usd: true, lifetime_usd: 263 }
    expect(displayPrice(usd, usd.lifetime_inr, regionFor("US"), { licence: true })).toEqual({ figure: "$263", approx: false, charge: "", chargedIn: "USD" })
    expect(displayPrice(usd, usd.lifetime_inr, null, { licence: true })).toEqual({ figure: "$263", approx: false, charge: "", chargedIn: "USD" })
    // A pound reader compares in pounds; the card is charged the dollars.
    expect(displayPrice(usd, usd.lifetime_inr, regionFor("GB", "en-GB"), { licence: true })).toEqual({ figure: "£194", approx: true, charge: "$263", chargedIn: "USD" })
    expect(displayPrice(usd, usd.lifetime_inr, regionFor("IN", "en-IN"), { licence: true }).figure).toBe("₹24,999")
    // Cloud is still a rupee subscription.
    expect(displayPrice(usd, usd.cloud_inr, regionFor("US")).charge).toBe("₹9,999")
  })
})

/**
 * Cloud Business and the licence can be the same figure (one a month, one
 * once), so each Cloud size also says what it comes to for one person a
 * month: its monthly price over the people it covers, worked out from the
 * pricing payload, in the reader's money with the cents abroad.
 */
describe("a per-person figure for each Cloud size", () => {
  const live: Pricing = {
    ...defaultPricing,
    rates: { USD: 96.87, EUR: 112.64, GBP: 129.16, SGD: 74.52, AUD: 63.73, CAD: 70.19 },
    cloud_yearly_configured: true, cloud_yearly_inr: 99990, cloud_yearly_paise: 9999000,
    business_configured: true,
  }

  it("is the size's month over the people it covers, never typed", () => {
    expect(cloudChoices(live)).toEqual(["monthly", "yearly", "business"])
    expect(choicePerPerson("monthly", live)).toBeCloseTo(live.cloud_inr / live.cloud_seats)
    expect(choicePerPerson("yearly", live)).toBeCloseTo(live.cloud_yearly_inr / 12 / live.cloud_seats)
    expect(choicePerPerson("business", live)).toBeCloseTo(live.business_inr / live.business_seats)
    const moved = { ...live, business_inr: 30000, business_seats: 120 }
    expect(choicePerPerson("business", moved)).toBeCloseTo(250)
    expect(choicePerPerson("business", { ...live, business_seats: 0 })).toBe(0)
  })

  it("is said with the cents abroad and in whole rupees in India", () => {
    const business = choicePerPerson("business", live)
    expect(displayPrice(live, business, regionFor("US"), { cents: true }).figure).toBe("$2.58")
    expect(displayPrice(live, business, regionFor("DE", "de-DE"), { cents: true }).figure).toBe("2,22 €")
    expect(displayPrice(live, business, regionFor("GB", "en-GB"), { cents: true }).figure).toBe("£1.94")
    expect(displayPrice(live, business, regionFor("IN", "en-IN"), { cents: true }).figure).toBe("₹250")
  })
})
