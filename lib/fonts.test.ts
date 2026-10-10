import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// next/font is compiled by Next, so the loaders cannot run here; the source is
// what can be checked. next/font's own fallback is a copy of Arial, missing on
// Android and most Linux machines, and its class sets nothing after it: text
// set by the class alone falls to the browser's default serif while the font
// loads, then jumps when it lands.
const fonts = readFileSync(join(__dirname, "fonts.ts"), "utf8");

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

function loader(name: string): string {
  const start = fonts.indexOf(`export const ${name} =`);
  expect(start).toBeGreaterThan(-1);
  return fonts.slice(start, fonts.indexOf("});", start));
}

describe("fonts", () => {
  it("ends Inter's class in a generic family, since the body is set with it", () => {
    expect(loader("fontSans")).toMatch(/fallback: \[[^\]]*"sans-serif"\]/);
  });

  it("gives every font whose class is used on an element a generic fallback", () => {
    const root = join(__dirname, "..");
    const used = new Set<string>();
    for (const file of [...sources(join(root, "app")), ...sources(join(root, "components"))]) {
      for (const m of readFileSync(file, "utf8").matchAll(/\b(font[A-Z]\w*)\.className\b/g)) used.add(m[1]);
    }
    for (const name of used) expect(loader(name)).toMatch(/fallback: \[[^\]]*"(sans-serif|serif|monospace)"\]/);
  });
});
