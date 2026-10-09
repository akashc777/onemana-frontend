import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { checkIndianBilling, gstinCheckChar, isValidGstin } from "./gstin"

/**
 * A GSTIN is checked at checkout, before it is printed on a tax invoice the
 * buyer cannot then use. See lib/gstin.ts for why.
 */

// The sample GSTIN in the GST network's own e-invoice documentation, so the
// check character is tested against something this file did not compute.
const PUBLISHED = "27AAPFU0939F1ZV"

describe("a GSTIN", () => {
  it("passes when its check character is right", () => {
    expect(gstinCheckChar(PUBLISHED.slice(0, 14))).toBe("V")
    expect(isValidGstin(PUBLISHED)).toBe(true)
    // Pasted in lower case or with spaces, it is still the same GSTIN.
    expect(isValidGstin(" 27aapfu0939f1zv ")).toBe(true)
    expect(isValidGstin("27 AAPFU 0939 F1ZV")).toBe(true)
  })

  it("fails with a typo the check character catches", () => {
    expect(isValidGstin("27AAPFU0939F1ZW")).toBe(false) // last character
    expect(isValidGstin("27AAPFU0399F1ZV")).toBe(false) // two neighbouring digits swapped
    expect(isValidGstin("29AAPFU0939F1ZV")).toBe(false) // another state's code
  })

  it("fails when it is not shaped like one", () => {
    for (const bad of ["", "BADGSTIN", "27AAPFU0939F1Z", "27AAPFU0939F1ZVX", "27AAPFU0939F1AV", "2AAAPFU0939F1ZV", "27AAPF00939F1ZV", "27AAPFU0939F0ZV"]) {
      expect(isValidGstin(bad), bad).toBe(false)
    }
  })
})

describe("an Indian buyer's GSTIN and state", () => {
  it("needs no GSTIN, and keeps the state chosen", () => {
    expect(checkIndianBilling("", "Karnataka")).toEqual({ ok: true, gstin: "", state: "Karnataka", stateCode: "29" })
    expect(checkIndianBilling("  ", "")).toEqual({ ok: true, gstin: "", state: "", stateCode: "" })
  })

  it("takes the state from a valid GSTIN when none was chosen", () => {
    expect(checkIndianBilling("27aapfu0939f1zv", "")).toEqual({ ok: true, gstin: PUBLISHED, state: "Maharashtra", stateCode: "27" })
    expect(checkIndianBilling(PUBLISHED, "Maharashtra")).toEqual({ ok: true, gstin: PUBLISHED, state: "Maharashtra", stateCode: "27" })
  })

  it("refuses a GSTIN that is wrong, and says it can be left empty", () => {
    const r = checkIndianBilling("27AAPFU0939F1ZW", "Maharashtra")
    expect(r.ok).toBe(false)
    expect(!r.ok && r.error).toContain("leave it empty")
  })

  it("refuses a state other than the one the GSTIN is registered in, naming both", () => {
    const r = checkIndianBilling(PUBLISHED, "Karnataka")
    expect(r.ok).toBe(false)
    expect(!r.ok && r.error).toContain("registered in Maharashtra")
    expect(!r.ok && r.error).toContain("Karnataka")
  })

  it("accepts a valid GSTIN from a state code we do not list, with the state as chosen", () => {
    const other = "97AAPFU0939F1Z" // 97: Other Territory
    const gstin = other + gstinCheckChar(other)
    expect(checkIndianBilling(gstin, "")).toEqual({ ok: true, gstin, state: "", stateCode: "" })
  })

  it("is what the checkout sends", () => {
    const page = readFileSync("app/buy/page.tsx", "utf8")
    expect(page).toContain("checkIndianBilling(gstin, stateName)")
    expect(page).toContain("gstin: billing.gstin")
    expect(page).toContain("state_code: billing.stateCode")
  })
})
