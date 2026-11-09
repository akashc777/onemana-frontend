import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { cloudPlanCode, MONEY_RULE, paymentTerms, yearlyOffered, yearlySaving } from "./paymentTerms";
import { FREE_SEATS } from "./freePlan";
import { defaultPricing } from "./pricing";

describe("paymentTerms", () => {
  it("says there are no refunds for every way of paying", () => {
    for (const kind of ["lifetime", "monthly", "yearly"] as const) {
      expect(paymentTerms(kind)).toMatch(/do not offer refunds/);
    }
  });

  it("tells a yearly buyer the remaining months are not refunded", () => {
    // The one case where the sentence carries real money: a year up front.
    expect(paymentTerms("yearly")).toMatch(/remaining months are not refunded/);
    expect(paymentTerms("yearly")).toMatch(/once a year/);
  });

  it("tells a monthly buyer the workspace runs to the end of the paid month", () => {
    expect(paymentTerms("monthly")).toMatch(/end of the paid month/);
  });
});

describe("yearly offer", () => {
  it("sends no plan code for monthly, so every older client stays monthly", () => {
    expect(cloudPlanCode("monthly")).toBeUndefined();
    expect(cloudPlanCode("yearly")).toBe("onecamp_cloud_team_yearly");
  });

  it("is not offered until a yearly plan exists to charge it", () => {
    expect(yearlyOffered(defaultPricing)).toBe(false);
    expect(yearlySaving(defaultPricing)).toBe("");
    const live = { ...defaultPricing, cloud_yearly_configured: true, cloud_yearly_paise: 9_999_000, cloud_yearly_free_months: 2 };
    expect(yearlyOffered(live)).toBe(true);
    expect(yearlySaving(live)).toBe("2 months free");
  });

  it("claims no saving when the yearly price does not earn one", () => {
    const flat = { ...defaultPricing, cloud_yearly_configured: true, cloud_yearly_paise: 11_998_800, cloud_yearly_free_months: 0 };
    expect(yearlySaving(flat)).toBe("");
  });
});

/**
 * The money rule under the plan cards, on the checkout and on the rival and
 * audience pages. It led with the refusal ("No trials or refunds: try the
 * demo..."), the first line after the price. It is one sentence now, the same
 * everywhere, with the offer first and the rule kept: payments are final.
 */
describe("the money rule", () => {
  it("says the offer before the rule, in one sentence used everywhere", () => {
    expect(MONEY_RULE).toBe(`Try it first: the live demo, and the free plan for up to ${FREE_SEATS} people. Payments are final.`);
    expect(MONEY_RULE.indexOf("live demo")).toBeLessThan(MONEY_RULE.indexOf("Payments are final"));
    for (const file of ["components/site/PlanColumns.tsx", "app/buy/BuyCheckout.tsx", "components/site/AudienceView.tsx"]) {
      const src = readFileSync(join(process.cwd(), file), "utf8");
      expect(src, file).toContain("<MoneyRule");
      expect(src, file).not.toMatch(/No trials or refunds/);
    }
  });
});
