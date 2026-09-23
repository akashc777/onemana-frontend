import { describe, expect, it } from "vitest";
import { capacityLine, capacitySummary } from "./capacityLine";

describe("capacityLine", () => {
  it("says nothing while the machine is fine or unread", () => {
    expect(capacityLine("ok", "")).toBe("");
    expect(capacityLine(undefined)).toBe("");
  });
  it("names what is full and offers the free way first, never as a block", () => {
    const line = capacityLine("tight", "memory 87% used, most of it opensearch (38%)");
    expect(line).toContain("memory 87%");
    expect(line.indexOf("Archive")).toBeLessThan(line.indexOf("larger machine"));
    expect(line.toLowerCase()).not.toMatch(/limit|blocked|suspend/);
    expect(capacityLine("outgrown")).toContain("outgrown");
  });
});

describe("capacitySummary", () => {
  it("reads the stored reading for the admin row", () => {
    const s = capacitySummary(JSON.stringify({ mem_total_mb: 32768, mem_avail_mb: 4096, cores: 8, load15: 2.5, verdict: "tight", messages: 120000, db_size_mb: 900 }));
    expect(s).toContain("tight");
    expect(s).toContain("memory 88% of 32 GB");
    expect(s).toContain("load 2.5 on 8 cores");
    expect(s).toContain("messages");
  });
  it("is empty for nothing or junk", () => {
    expect(capacitySummary("")).toBe("");
    expect(capacitySummary("{not json")).toBe("");
  });
});
