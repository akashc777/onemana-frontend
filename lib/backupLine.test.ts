import { describe, expect, it } from "vitest";
import { backupLine } from "./backupLine";

describe("backupLine", () => {
  it("says nothing for a workspace that is not running yet", () => {
    expect(backupLine(false, true)).toBe("");
    expect(backupLine(false, true, "2026-09-22T04:10:00Z")).toBe("");
  });

  it("promises no off-site copy while no store is set up", () => {
    const line = backupLine(true, false);
    expect(line).toContain("nightly");
    expect(line).toContain("7 kept");
    expect(line).not.toMatch(/off-site|copy/);
  });

  it("says the first copy is coming once the store is set up", () => {
    expect(backupLine(true, true)).toContain("within a day");
  });

  it("dates the off-site copy once there is one", () => {
    const line = backupLine(true, true, "2026-09-22T04:10:00Z");
    expect(line).toMatch(/off-site copy from Sep 2[12]/);
    expect(line).toContain("30 kept");
  });
});
