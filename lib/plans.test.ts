import { describe, expect, it } from "vitest";
import { planOptions, PLAN_ROWS } from "./plans";
import { FREE_SEATS } from "./freePlan";
import type { Pricing } from "./pricing";

const p = {
  lifetime_inr: 24999, lifetime_usd: 299, cloud_inr: 9999, cloud_usd: 105, cloud_seats: 30,
  business_seats: 100, business_configured: true,
} as unknown as Pricing;

describe("planOptions", () => {
  it("offers the three plans, each with every row filled", () => {
    const plans = planOptions(p);
    expect(plans.map((x) => x.key)).toEqual(["free", "lifetime", "cloud"]);
    for (const plan of plans) for (const row of PLAN_ROWS) expect(plan[row.key], `${plan.key}.${row.key}`).toBeTruthy();
  });

  // The table was drawn under the pay button on /buy, and its first column
  // said: build it yourself, free, unlimited people, company controls
  // included. At the moment of paying, the page argued for not paying.
  // Building from source is said once, under the table, as a link to
  // /open-source; it is not a plan beside a price.
  it("never offers a build-it-yourself option beside a price", () => {
    for (const plan of planOptions(p)) {
      expect(plan.key, plan.name).not.toBe("source");
      expect(`${plan.name} ${plan.runs} ${plan.install} ${plan.updates}`, plan.name).not.toMatch(/build|GitHub|source/i);
      expect(plan.cta.external, plan.name).toBeFalsy();
      expect(plan.cta.href, plan.name).toMatch(/^\/(free|buy)\b/);
    }
  });

  it("takes prices and seats from live pricing, never from copy", () => {
    const plans = planOptions(p);
    // Rupees, which the table writes with the reader's estimate beside them (lib/pricing priceWithEstimate).
    const [free, lifetime, cloud] = plans;
    expect(lifetime.price).toEqual({ inr: 24999, per: " once" });
    expect(cloud.price).toEqual({ lead: "From ", inr: 9999, per: "/mo" });
    expect(cloud.people).toContain("30");
    expect(free.people).toContain(String(FREE_SEATS));
    const changed = planOptions({ ...p, lifetime_inr: 30000, cloud_seats: 40, business_configured: false } as Pricing);
    expect(changed[1].price).toEqual({ inr: 30000, per: " once" });
    expect(changed[2].people).toBe("Up to 40");
  });

  it("says plainly which ones carry AGPL obligations", () => {
    const [free, lifetime] = planOptions(p);
    expect(free.licence).toMatch(/AGPL/);
    expect(lifetime.licence).toMatch(/no AGPL obligations/);
  });
});

/**
 * A row's label fits its column on one line (16 characters fit a phone's
 * 128 px label column at 14 px); what it covers goes in its note. The
 * controls row's label, with its list in brackets, was four lines of one or
 * two words on a phone.
 */
describe("the plan table's labels", () => {
  it("are short, and put what they cover in a note", () => {
    for (const row of PLAN_ROWS) {
      expect(row.label.length, row.label).toBeLessThanOrEqual(16)
      expect(row.label, row.label).not.toMatch(/[()]/)
    }
    expect(PLAN_ROWS.find((r) => r.key === "controls")?.note).toBe("SSO, LDAP, SCIM, audit export")
  })
})
