import { describe, expect, it } from "vitest";
import { attemptAndRefusal, shortHash } from "@/lib/recordExcerpt";

/**
 * The record rows on the home page are the site's evidence, so they have to
 * be the file /verify checks, and they have to show a chain: the refusal's
 * prev is the attempt's hash. If the sample file is replaced with rows that
 * do not chain, the picture would be claiming something the file does not.
 */
describe("record excerpt", () => {
  it("is an attempt followed by its refusal", () => {
    expect(attemptAndRefusal).toHaveLength(2);
    const [attempt, refusal] = attemptAndRefusal;
    expect(attempt.action).toMatch(/attempt$/);
    expect(refusal.refused).toBe(true);
    expect(refusal.seq).toBe(attempt.seq + 1);
  });

  it("chains: the second row carries the first row's hash", () => {
    const [attempt, refusal] = attemptAndRefusal;
    expect(refusal.prev).toBe(attempt.hash);
  });

  it("shortens a hash to its ends", () => {
    expect(shortHash("68d9fed301af3cfea436b21d76368cab0b4e31ac48f3c9d173cd7aeae3c95ca7")).toBe("68d9…5ca7");
  });
});
