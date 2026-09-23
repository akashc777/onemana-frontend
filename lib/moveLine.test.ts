import { describe, expect, it } from "vitest";
import { moveLine, sizeLabel } from "./moveLine";

describe("moveLine", () => {
  it("says nothing when no move is open", () => {
    expect(moveLine(undefined)).toBe("");
  });
  it("says where the move is and to what size", () => {
    expect(moveLine({ to_size: "business", label: "Preparing the new machine", can_move_now: false })).toBe(
      "Moving to a Business machine: Preparing the new machine.",
    );
  });
  it("dates a move waiting for quiet hours", () => {
    const line = moveLine({ to_size: "team", label: "Ready to move", when: "2026-09-23T20:00:00Z", can_move_now: true });
    expect(line).toContain("Team machine: Ready to move, ");
  });
  it("names sizes, Team by default", () => {
    expect(sizeLabel("business")).toBe("Business");
    expect(sizeLabel(undefined)).toBe("Team");
  });
});
