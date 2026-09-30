import { describe, expect, it } from "vitest";
import { teamCost } from "./teamCost";
import { FREE_SEATS } from "./freePlan";

const COSTS = [
  { name: "Slack Pro", usd: 8.75, ai: false },
  { name: "Notion Business", usd: 10, ai: false },
  { name: "Zoom Pro", usd: 13, ai: false },
  { name: "AI", usd: 10, ai: true },
];

describe("teamCost", () => {
  it("charges no licence inside the free plan", () => {
    const c = teamCost(FREE_SEATS, false, 260, 12, COSTS);
    expect(c.free).toBe(true);
    expect(c.licenceUsd).toBe(0);
    expect(c.oneCampYear).toBe(144);
  });
  it("charges the lifetime licence once the team is past it", () => {
    const c = teamCost(FREE_SEATS + 1, false, 260, 12, COSTS);
    expect(c.free).toBe(false);
    expect(c.oneCampYear).toBe(260 + 144);
  });
  it("adds the AI line only when asked", () => {
    expect(teamCost(10, true, 260, 12, COSTS).saasYear).toBe((8.75 + 10 + 13 + 10) * 10 * 12);
    expect(teamCost(10, false, 260, 12, COSTS).saasYear).toBe((8.75 + 10 + 13) * 10 * 12);
  });
  it("bounds silly input", () => {
    expect(teamCost(0, false, 260, 12, COSTS).seats).toBe(1);
    expect(teamCost(50000, false, 260, 12, COSTS).seats).toBe(1000);
    expect(teamCost(Number.NaN, false, 260, 12, COSTS).seats).toBe(1);
  });
});
