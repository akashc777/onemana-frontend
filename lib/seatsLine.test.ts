import { describe, expect, it } from "vitest";
import { seatsLine } from "./seatsLine";

describe("seatsLine", () => {
  it("says nothing before the first count, rather than a zero that reads as empty", () => {
    expect(seatsLine(undefined, 30)).toBe("");
  });

  it("states the count and what the plan includes", () => {
    expect(seatsLine(18, 30)).toBe("18 people · 30 included in your plan");
    expect(seatsLine(1, 30)).toBe("1 person · 30 included in your plan");
  });

  it("states an overage as a fact and points at the next step, never as a block", () => {
    // Nothing in the product stops the thirty-first person, so the line must
    // not imply a limit was hit.
    const line = seatsLine(34, 30);
    expect(line).toContain("34 people");
    expect(line).toContain("includes 30");
    expect(line).toContain("larger workspace");
    expect(line.toLowerCase()).not.toMatch(/limit|exceeded|blocked/);
  });

  it("dates the count when the backend says when it was taken", () => {
    expect(seatsLine(18, 30, "2026-09-21T03:00:00Z")).toMatch(/as of Sep 2[01]/);
  });
});
