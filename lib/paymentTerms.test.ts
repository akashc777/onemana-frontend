import { describe, expect, it } from "vitest";
import { cloudPlanCode, paymentTerms, yearlyOffered, yearlySaving } from "./paymentTerms";
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
