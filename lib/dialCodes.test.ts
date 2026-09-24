import { describe, expect, it } from "vitest"
import { contactForCheckout, dialPrefix, phoneForCountry } from "./dialCodes"

describe("dial codes", () => {
  it("prefixes the buyer's country", () => {
    expect(dialPrefix("US")).toBe("+1 ")
    expect(dialPrefix("gb")).toBe("+44 ")
    expect(dialPrefix("ZZ")).toBe("")
  })
  it("follows the country until the buyer types, then keeps their number", () => {
    expect(phoneForCountry("", "IN", "US")).toBe("+1 ")
    expect(phoneForCountry("+1 ", "US", "GB")).toBe("+44 ")
    expect(phoneForCountry("+1 415 555 0100", "US", "GB")).toBe("+1 415 555 0100")
  })
  it("never hands the payment window a bare prefix", () => {
    expect(contactForCheckout("+1 ")).toBe("")
    expect(contactForCheckout("+1 415 555 0100")).toBe("+1 415 555 0100")
  })
})
