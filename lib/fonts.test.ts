import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// next/font is compiled by Next, so the loaders cannot run here; the source is
// what can be checked. The fallback copy of Arial it makes is missing on
// Android and most Linux machines, and a family list with nothing after it
// falls to the browser's default serif while the font loads.
const source = readFileSync(join(__dirname, "fonts.ts"), "utf8");

describe("fonts", () => {
  it("ends every face's fallback in a generic family", () => {
    const loaders = source.match(/= (Inter|Inter_Tight|JetBrains_Mono)\(\{[\s\S]*?\}\);/g) ?? [];
    expect(loaders).toHaveLength(3);
    for (const loader of loaders) {
      const generic = loader.startsWith("= JetBrains_Mono") ? "monospace" : "sans-serif";
      // A literal, since next/font cannot read a constant.
      expect(loader).toMatch(new RegExp(`fallback: \\[[^\\]]*"${generic}"\\]`));
    }
  });
});
