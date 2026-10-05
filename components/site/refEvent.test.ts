import { describe, expect, it } from "vitest";
import { refEvent } from "./VisitorTracker";

describe("refEvent", () => {
  it("records the credit a visitor came from", () => {
    expect(refEvent("?ref=made-with-booking")).toBe("ref-made-with-booking");
    expect(refEvent("?x=1&ref=Made-With-Form")).toBe("ref-made-with-form");
  });
  it("ignores a missing or hostile ref", () => {
    expect(refEvent("")).toBeNull();
    expect(refEvent("?ref=")).toBeNull();
    expect(refEvent("?ref=../admin")).toBeNull();
    expect(refEvent(`?ref=${"a".repeat(49)}`)).toBeNull();
  });
});
