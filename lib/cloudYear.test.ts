import { describe, expect, it } from "vitest"
import { cloudYearFor } from "./cloudYear"

const p = { cloud_usd: 105, cloud_seats: 30, cloud_yearly_usd: 1050, cloud_yearly_configured: true, business_usd: 261, business_seats: 100, business_configured: true }

describe("cloudYearFor", () => {
  it("prices the plan that fits the team", () => {
    expect(cloudYearFor(20, p)).toEqual({ plan: "Team, paid yearly", usdYear: 1050, href: "/buy?plan=cloud&billing=yearly" })
    expect(cloudYearFor(20, { ...p, cloud_yearly_configured: false })?.usdYear).toBe(1260)
    expect(cloudYearFor(60, p)).toEqual({ plan: "Business", usdYear: 3132, href: "/buy?plan=cloud&size=business" })
  })
  it("offers nothing when no plan fits", () => {
    expect(cloudYearFor(150, p)).toBeNull()
    expect(cloudYearFor(60, { ...p, business_configured: false })).toBeNull()
  })
})
