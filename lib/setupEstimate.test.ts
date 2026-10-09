import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { cloudBenefits } from "./content"
import { failedLine } from "./instanceState"
import { defaultPricing, setupEstimateFor, type Pricing } from "./pricing"

/**
 * One timing estimate, from one place.
 *
 * WHY. /buy said "usually live within a day", the building email "within a
 * few hours", the account page "a few hours" or "under an hour", and none said
 * what it depends on: whether a machine is free. The backend now says it once
 * (business/onecamp/setupEstimate.go) and every surface shows its words: /buy
 * and the receipt from the pricing payload, the account page from the
 * workspace. These hold that nothing here says a time of its own.
 */

const spare = { spare: true, short: "about an hour", sentence: "A server is ready for it." }
const order = { spare: false, short: "usually within a day", sentence: "Its server is ordered." }

describe("the estimate for the plan bought", () => {
  it("is the backend's, by size", () => {
    const p: Pricing = { ...defaultPricing, cloud_setup: spare, business_setup: order }
    expect(setupEstimateFor(p, false)).toBe(spare)
    expect(setupEstimateFor(p, true)).toBe(order)
  })

  it("is nothing until the backend has said, never a guess", () => {
    expect(setupEstimateFor(defaultPricing, false)).toBeNull()
    expect(setupEstimateFor({ ...defaultPricing, cloud_setup: { ...spare, sentence: "" } }, false)).toBeNull()
  })
})

describe("no page says a time of its own", () => {
  const read = (f: string) => readFileSync(f, "utf8")
  const times = /within a day|few hours|under an hour|within an hour/i

  it("on /buy, which shows the estimate for the plan chosen", () => {
    const buy = read("app/buy/page.tsx")
    expect(buy).toContain("setupEstimateFor(pricing, business)?.sentence")
    expect(buy).not.toMatch(times)
    expect(cloudBenefits.join(" ")).not.toMatch(times)
  })

  it("on the receipt, which shows it for the size bought", () => {
    const success = read("app/buy/success/page.tsx")
    expect(success).toContain('setupEstimateFor(p, purchase?.size === "business")')
    expect(success).toContain("{estimate.sentence}")
    expect(success).not.toMatch(times)
  })

  it("on the account page, which shows the workspace's own", () => {
    const section = read("components/account/WorkspaceSection.tsx")
    expect(section).toContain("inst.estimate")
    expect(section).toContain("failedLine(inst.retry_at, inst.max_attempts)")
    expect(section).not.toMatch(times)
    expect(section).not.toContain("We retry automatically")
  })
})

describe("a failed setup", () => {
  it("says when it is tried again, how many times, and that a person follows", () => {
    const line = failedLine("2026-10-09T14:05:00Z", 3, "en-GB")
    // In the reader's own time zone, whatever this machine's is.
    expect(line).toMatch(/again automatically at \d{1,2}:\d{2},/)
    expect(line).toContain("3 times at most")
    expect(line).toContain("one of us takes over and emails you")
  })

  it("says a person has it once the tries have run out", () => {
    for (const at of [undefined, "", "not a date"]) {
      expect(failedLine(at, 3)).toContain("automatic tries have run out")
    }
  })
})
