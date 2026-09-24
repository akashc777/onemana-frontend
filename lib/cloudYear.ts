import type { Pricing } from "@/lib/pricing"
import { cloudBuyHref, type Billing } from "@/lib/paymentTerms"

// What OneCamp Cloud costs a year for a team of this size, for the cost
// calculator. The calculator's own caveat is that someone has to run the
// server; this is the answer to it, priced from the live figures rather than
// typed in. Team up to its seats (yearly when yearly is on sale), Business up
// to its seats, and nothing past that, because no plan fits. Pure.
export interface CloudYear {
  plan: string
  usdYear: number
  href: string
}

export function cloudYearFor(
  people: number,
  p: Pick<Pricing, "cloud_usd" | "cloud_seats" | "cloud_yearly_usd" | "cloud_yearly_configured" | "business_usd" | "business_seats" | "business_configured">,
): CloudYear | null {
  const pick = (plan: string, usdYear: number, billing: Billing): CloudYear | null =>
    usdYear > 0 ? { plan, usdYear, href: cloudBuyHref(billing) } : null
  if (people <= p.cloud_seats) {
    return p.cloud_yearly_configured && p.cloud_yearly_usd > 0
      ? pick("Team, paid yearly", p.cloud_yearly_usd, "yearly")
      : pick("Team", p.cloud_usd * 12, "monthly")
  }
  if (p.business_configured && people <= p.business_seats) {
    return pick("Business", p.business_usd * 12, "business")
  }
  return null
}
