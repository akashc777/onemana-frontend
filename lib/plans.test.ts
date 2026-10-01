import { describe, expect, it } from "vitest";
import { planOptions, PLAN_ROWS } from "./plans";
import { FREE_SEATS } from "./freePlan";
import type { Pricing } from "./pricing";

const p = {
  lifetime_inr: 24999, lifetime_usd: 299, cloud_inr: 9999, cloud_usd: 105, cloud_seats: 30,
  business_seats: 100, business_configured: true,
} as unknown as Pricing;

describe("planOptions", () => {
  it("offers the four ways, each with every row filled", () => {
    const plans = planOptions(p);
    expect(plans.map((x) => x.key)).toEqual(["source", "free", "lifetime", "cloud"]);
    for (const plan of plans) for (const row of PLAN_ROWS) expect(plan[row.key], `${plan.key}.${row.key}`).toBeTruthy();
  });

  it("takes prices and seats from live pricing, never from copy", () => {
    const plans = planOptions(p);
    expect(plans[2].price).toContain("₹24,999");
    expect(plans[3].price).toContain("₹9,999");
    expect(plans[3].people).toContain("30");
    expect(plans[1].people).toContain(String(FREE_SEATS));
    const changed = planOptions({ ...p, lifetime_inr: 30000, cloud_seats: 40, business_configured: false } as Pricing);
    expect(changed[2].price).toContain("₹30,000");
    expect(changed[3].people).toBe("Up to 40");
  });

  it("says plainly which ones carry AGPL obligations", () => {
    const [source, free, lifetime] = planOptions(p);
    expect(source.licence).toMatch(/AGPL/);
    expect(free.licence).toMatch(/AGPL/);
    expect(lifetime.licence).toMatch(/no AGPL obligations/);
  });
});
