import { describe, expect, it } from "vitest";
import { freeClaimPayload } from "./freePlan";

describe("freeClaimPayload", () => {
  it("normalises the address and trims the name", () => {
    expect(freeClaimPayload("  Team@Example.COM ", "  Acme ")).toEqual({ email: "team@example.com", name: "Acme" });
  });
  it("refuses what cannot be an address", () => {
    for (const bad of ["", "nope", "a@b", "a b@c.d"]) expect(freeClaimPayload(bad, "")).toBeNull();
  });
  it("bounds the name", () => {
    expect(freeClaimPayload("a@b.co", "x".repeat(500))?.name.length).toBe(120);
  });
});
