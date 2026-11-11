import { describe, expect, it } from "vitest";
import { seatsLine } from "./seatsLine";

describe("seatsLine", () => {
  it("says nothing before the first count, rather than a zero that reads as empty", () => {
    expect(seatsLine(undefined, 30)).toBe("");
  });

  it("states the count and the people the plan is sized for", () => {
    expect(seatsLine(18, 30)).toBe("18 people\u00a0· your plan is sized for 30 people");
    expect(seatsLine(1, 30)).toBe("1 person\u00a0· your plan is sized for 30 people");
  });

  it("states an overage as a fact and points at the next step, never as a block", () => {
    // Nothing in the product stops the thirty-first person, so the line must
    // not imply a limit was hit.
    const line = seatsLine(34, 30);
    expect(line).toContain("34 people");
    expect(line).toContain("Your plan is sized for 30 people");
    expect(line).toContain("larger workspace");
    expect(line.toLowerCase()).not.toMatch(/limit|exceeded|blocked/);
  });

  it("dates the count when the backend says when it was taken", () => {
    // The house date, the same in every browser: "9 Oct", not "Oct 9".
    expect(seatsLine(18, 30, "2026-10-09T03:00:00Z")).toBe("18 people as of 9 Oct\u00a0· your plan is sized for 30 people");
  });

  it("never lets a wrapped line start with the separator", () => {
    expect(seatsLine(18, 30, "2026-10-09T03:00:00Z")).not.toContain(" ·");
  });
});
