import { describe, expect, it } from "vitest";
import { switchConfirm, switchLabel } from "./billingSwitch";

describe("billing switch words", () => {
  it("offers the saving going up and the timing going down", () => {
    expect(switchLabel("yearly", 2)).toBe("Switch to yearly, 2 months free");
    expect(switchLabel("yearly", 0)).toBe("Switch to yearly");
    expect(switchLabel("monthly", 2)).toContain("when the year ends");
    expect(switchLabel("", 2)).toBe("");
  });

  it("says exactly what is charged and that nothing is refunded", () => {
    expect(switchConfirm("yearly")).toContain("difference");
    expect(switchConfirm("yearly")).toContain("we do not offer refunds");
    expect(switchConfirm("monthly")).toContain("Nothing is charged");
    expect(switchConfirm("monthly")).toContain("not refunded");
  });
});
