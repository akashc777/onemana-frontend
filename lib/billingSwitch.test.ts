import { describe, expect, it } from "vitest";
import { changesNow, switchConfirm, switchLabel } from "./billingSwitch";
import { defaultPricing } from "./pricing";

const p = { ...defaultPricing, cloud_yearly_free_months: 2 };

describe("plan change words", () => {
  it("happens now only when paying more, sooner, from Team monthly", () => {
    expect(changesNow("yearly", "onecamp_cloud_team")).toBe(true);
    expect(changesNow("business", "onecamp_cloud_team")).toBe(true);
    expect(changesNow("business", "onecamp_cloud_team_yearly")).toBe(false);
    expect(changesNow("monthly", "onecamp_cloud_business")).toBe(false);
    expect(changesNow("monthly", "onecamp_cloud_team_yearly")).toBe(false);
  });

  it("labels each change by what it does and when", () => {
    expect(switchLabel("business", "onecamp_cloud_team", p)).toBe("Upgrade to Business, 100 users");
    expect(switchLabel("business", "onecamp_cloud_team_yearly", p)).toContain("when the year ends");
    expect(switchLabel("yearly", "onecamp_cloud_team", p)).toBe("Switch to yearly, 2 months free");
    expect(switchLabel("monthly", "onecamp_cloud_business", p)).toBe("Move down to Team when this month ends");
    expect(switchLabel("monthly", "onecamp_cloud_team_yearly", p)).toBe("Switch to monthly when the year ends");
  });

  it("says what is charged and that nothing is refunded", () => {
    const up = switchConfirm("business", "onecamp_cloud_team", p);
    expect(up).toContain("difference");
    expect(up).toContain("₹24,999");
    expect(up).toContain("we do not offer refunds");
    const down = switchConfirm("monthly", "onecamp_cloud_business", p);
    expect(down).toContain("Nothing is charged");
    expect(down).toContain("not refunded");
    expect(switchConfirm("monthly", "onecamp_cloud_team_yearly", p)).toContain("the paid year ends");
  });
});
