import { describe, expect, it } from "vitest";
import { timeAgo } from "./format";

describe("timeAgo", () => {
  const at = (secondsAgo: number) => new Date(Date.now() - secondsAgo * 1000).toISOString();

  it("reads in the units a person would use", () => {
    expect(timeAgo(at(5))).toBe("5s ago");
    expect(timeAgo(at(120))).toBe("2m ago");
    expect(timeAgo(at(7200))).toBe("2h ago");
    expect(timeAgo(at(172800))).toBe("2d ago");
  });

  it("says nothing when there is nothing to say", () => {
    expect(timeAgo(null)).toBe("");
    expect(timeAgo(undefined)).toBe("");
    expect(timeAgo("not a date")).toBe("");
  });

  // A browser clock a little behind the server should not render as the future.
  it("does not report a future moment", () => {
    expect(timeAgo(new Date(Date.now() + 5000).toISOString())).toBe("just now");
  });
});
