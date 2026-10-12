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

  // Unsized, Roboto (Android) and Liberation Sans (Linux) set text about 7%
  // narrower than Inter, so lines rewrapped when Inter landed: CLS 0.0575 on
  // /pricing in a phone Lighthouse run. Each stand-in is sized by next/font's
  // own formula on Next's metrics table, recomputed here so the CSS can't drift.
  it("puts Inter's sized stand-ins for Android and Linux before the generic families", () => {
    expect(loader("fontSans")).toMatch(/fallback: \["Inter Fallback Roboto", "Inter Fallback Liberation", "ui-sans-serif"/);
    const css = readFileSync(join(__dirname, "../app/globals.css"), "utf8");
    const m = JSON.parse(readFileSync(join(__dirname, "../node_modules/next/dist/server/capsize-font-metrics.json"), "utf8"));
    const pct = (v: number) => `${(v * 100).toFixed(2)}%`;
    for (const [family, metrics] of [["Inter Fallback Roboto", m.roboto], ["Inter Fallback Liberation", m.arial]] as const) {
      const face = new RegExp(`@font-face \\{\\s*font-family: "${family}";([^}]*)\\}`).exec(css)?.[1] ?? "";
      expect(face, family).toContain("src: local(");
      const s = (m.inter.xWidthAvg / m.inter.unitsPerEm) / (metrics.xWidthAvg / metrics.unitsPerEm);
      expect(face, family).toContain(`size-adjust: ${pct(s)};`);
      expect(face, family).toContain(`ascent-override: ${pct(m.inter.ascent / (m.inter.unitsPerEm * s))};`);
      expect(face, family).toContain(`descent-override: ${pct(Math.abs(m.inter.descent) / (m.inter.unitsPerEm * s))};`);
    }
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
