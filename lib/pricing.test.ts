import { describe, expect, it } from "vitest"
import { currencyNote, defaultPricing } from "@/lib/pricing"

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
