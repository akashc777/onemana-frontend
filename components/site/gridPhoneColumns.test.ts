import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A grid that only names its desktop columns (lg:grid-cols-12) gets one
 * implicit column on phones, sized to its widest unbreakable child. On 20 Oct
 * 2026 a long release headline in the hero's pill widened that column to
 * 439px at every phone width, and the hero ran off the right edge. Naming the
 * phone column (grid-cols-1, which is minmax(0, 1fr)) lets it shrink to the
 * screen, so a long word or a nowrap line truncates instead.
 */
function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "node_modules" ? [] : tsxFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

describe("grids on phones", () => {
  it("name their phone column whenever they name desktop columns", () => {
    const offenders: string[] = [];
    for (const file of [...tsxFiles("app"), ...tsxFiles("components")]) {
      for (const [, cls] of readFileSync(file, "utf8").matchAll(/className="([^"]*)"/g)) {
        if (!/\bgrid\b/.test(cls) || !/\blg:grid-cols-\d+/.test(cls)) continue;
        const phone = cls.split(/\s+/).some((c) => /^(sm:|md:)?grid-cols-/.test(c));
        if (!phone) offenders.push(`${file}: ${cls}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
