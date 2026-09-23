import { describe, expect, it } from "vitest";
import { businessOffered, choiceLabel, choicePrice, cloudCheckoutDescription, cloudChoices, cloudPlanCode, paymentTerms } from "./paymentTerms";
import { defaultPricing, usdAt } from "./pricing";

const on = { ...defaultPricing, cloud_yearly_configured: true, cloud_yearly_paise: 9999000, cloud_yearly_inr: 99990, cloud_yearly_usd: usdAt(9999000, defaultPricing.usd_rate), cloud_yearly_free_months: 2, business_configured: true };

describe("Cloud plan choices", () => {
  it("offers only what is on sale, Team monthly first", () => {
    expect(cloudChoices(defaultPricing)).toEqual(["monthly"]);
    expect(cloudChoices(on)).toEqual(["monthly", "yearly", "business"]);
    expect(cloudChoices({ ...on, business_configured: false })).toEqual(["monthly", "yearly"]);
    expect(businessOffered({ ...on, business_paise: 0 })).toBe(false);
  });

  it("sends the plan code checkout expects, and nothing for Team monthly", () => {
    expect(cloudPlanCode("monthly")).toBeUndefined();
    expect(cloudPlanCode("yearly")).toBe("onecamp_cloud_team_yearly");
    expect(cloudPlanCode("business")).toBe("onecamp_cloud_business");
  });

  it("names and prices each choice", () => {
    expect(choiceLabel("business", on)).toBe("Business · 100 users");
    expect(choiceLabel("yearly", on)).toBe("Team yearly · 2 months free");
    expect(choicePrice("business", on)).toEqual({ inr: 24999, usd: usdAt(2499900, on.usd_rate), per: "/mo" });
    expect(choicePrice("yearly", on)).toEqual({ inr: 99990, usd: usdAt(9999000, on.usd_rate), per: "/yr" });
  });

  it("says no refunds for Business too, and the checkout window names the plan", () => {
    expect(paymentTerms("business")).toContain("we do not offer refunds");
    expect(cloudCheckoutDescription("onecamp_cloud_business")).toContain("Business");
    expect(cloudCheckoutDescription("onecamp_cloud_team_yearly")).toContain("yearly");
    expect(cloudCheckoutDescription(undefined)).toContain("monthly");
  });
});
