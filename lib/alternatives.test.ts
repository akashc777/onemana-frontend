import { describe, expect, it } from "vitest";
import { ALTERNATIVE_INDEX } from "./alternativeIndex";
import { alternatives } from "./alternatives";

describe("alternative pages", () => {
  it("the light index matches the pages, slug and label", () => {
    expect(ALTERNATIVE_INDEX.map((a) => [a.slug, a.label])).toEqual(alternatives.map((a) => [a.slug, a.label]));
  });
  it("every page is honest about its rival and says how to move", () => {
    for (const a of alternatives) {
      expect(a.rival?.theyWin.length, a.slug).toBeGreaterThanOrEqual(2);
      expect(a.rival?.source, a.slug).toMatch(/^https:\/\//);
      expect(a.rival?.billing, a.slug).not.toMatch(/[$₹€£]\s?\d/); // structural, never a price that moves
      expect(a.move?.steps.length, a.slug).toBeGreaterThanOrEqual(3);
    }
  });
});
