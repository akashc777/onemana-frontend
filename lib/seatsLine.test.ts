import { describe, expect, it } from "vitest";
import { PEOPLE } from "./freePlan";
import { defaultPricing } from "./pricing";
import { seatsLine } from "./seatsLine";

// Every figure from the pricing answer's defaults, so a change of size moves these with it.
const team = defaultPricing.cloud_seats;
const business = defaultPricing.business_seats;

describe("seatsLine", () => {
  it("says nothing before the first count, rather than a zero that reads as empty", () => {
    expect(seatsLine(undefined, team)).toEqual({ text: "" });
  });

  it("states the count and the people the plan is sized for", () => {
    expect(seatsLine(team - 12, team).text).toBe(`${team - 12} people · your plan is ${PEOPLE.cloud(team)}`);
    expect(seatsLine(1, team).text).toBe(`1 person · your plan is ${PEOPLE.cloud(team)}`);
    expect(seatsLine(team - 12, team, undefined, "team", business).step).toBeUndefined();
  });

  it("states a count with no number to be sized against on its own", () => {
    expect(seatsLine(7, 0)).toEqual({ text: "7 people" });
  });

  it("names Business as the next step for a Team workspace past its number, when Business is on offer", () => {
    // Nothing in the product stops the next person, so the line must not imply
    // a limit was hit; the step is the self-serve upgrade on the same page.
    const line = seatsLine(team + 2, team, undefined, "team", business);
    expect(line.text).toBe(`${team + 2} people. Your plan is ${PEOPLE.cloud(team)}; Business is ${PEOPLE.cloud(business)}.`);
    expect(line.step).toBe("upgrade");
    expect(line.text.toLowerCase()).not.toMatch(/limit|exceeded|blocked|get in touch/);
  });

  it("asks a Business workspace past its number to get in touch, the only step left", () => {
    const line = seatsLine(business + 2, business, undefined, "business", business);
    expect(line.text).toBe(`${business + 2} people. Your plan is ${PEOPLE.cloud(business)}.`);
    expect(line.step).toBe("talk");
  });

  it("asks a Team workspace to get in touch when Business is not on offer, never naming a plan it cannot buy", () => {
    for (const offered of [0, team]) {
      const line = seatsLine(team + 2, team, undefined, "team", offered);
      expect(line.step).toBe("talk");
      expect(line.text).not.toContain("Business");
    }
    // An older backend that does not say the plan: the same.
    expect(seatsLine(team + 2, team).step).toBe("talk");
  });

  it("dates the count when the backend says when it was taken", () => {
    // The house date, the same in every browser: "9 Oct", not "Oct 9".
    expect(seatsLine(team - 12, team, "2026-10-09T03:00:00Z").text).toBe(
      `${team - 12} people as of 9 Oct · your plan is ${PEOPLE.cloud(team)}`,
    );
  });

  it("never lets a wrapped line start with the separator", () => {
    expect(seatsLine(team - 12, team, "2026-10-09T03:00:00Z").text).not.toContain(" ·");
  });
});
