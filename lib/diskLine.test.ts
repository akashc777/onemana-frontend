import { describe, expect, it } from "vitest";
import { DISK_ATTENTION_PCT, diskLine } from "./diskLine";

describe("diskLine", () => {
  it("says nothing before the first measurement, rather than a zero that reads as empty", () => {
    expect(diskLine(undefined)).toBe("");
  });

  it("states the figure quietly while there is room", () => {
    expect(diskLine(41)).toBe("Disk 41% used");
    expect(diskLine(DISK_ATTENTION_PCT - 1)).toBe(`Disk ${DISK_ATTENTION_PCT - 1}% used`);
  });

  it("from the threshold on, offers removing data before a larger workspace, and never reads as a block", () => {
    const line = diskLine(DISK_ATTENTION_PCT);
    expect(line).toContain(`Disk ${DISK_ATTENTION_PCT}% used`);
    expect(line.indexOf("Remove")).toBeGreaterThan(-1);
    expect(line.indexOf("Remove")).toBeLessThan(line.indexOf("larger workspace"));
    expect(line.toLowerCase()).not.toMatch(/full|limit|exceeded|blocked/);
  });

  it("clamps a figure the backend should never send", () => {
    expect(diskLine(140)).toContain("Disk 100% used");
    expect(diskLine(-3)).toBe("Disk 0% used");
  });
});
