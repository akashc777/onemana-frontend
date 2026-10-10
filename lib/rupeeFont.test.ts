import { readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * The rupee sign costs about 2 kB of font, not 175 kB.
 *
 * Inter and Inter Tight draw ₹, but Google Fonts files it in their latin-ext
 * subsets. Every page with a price (rupees first, so nearly every page that
 * sells) downloaded both latin-ext files, 85 and 90 kB at the highest
 * priority, to draw one character: 294 kB of fonts on a phone against 124 kB
 * now (measured on /pricing, 10 Oct 2026). Two one-glyph faces, cut from the
 * same fonts, sit first in the stacks with a unicode-range of U+20B9 alone.
 *
 * Each rule here is one the saving depends on: drop the range and the face
 * draws everything; let next/font add a fallback face and Arial lands in
 * front of Inter; leave a stack without it and that text fetches latin-ext.
 */
const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8")

describe("the one-glyph rupee faces", () => {
  const fonts = read("lib/fonts.ts")
  const faces = [...fonts.matchAll(/localFont\(\{([\s\S]*?)\}\);/g)].map((m) => m[1])

  it("are two faces, each limited to the rupee sign and without a fallback face", () => {
    expect(faces).toHaveLength(2)
    for (const face of faces) {
      expect(face).toContain('declarations: [{ prop: "unicode-range", value: "U+20B9" }]')
      expect(face).toContain("adjustFontFallback: false")
      expect(face, "a late face lets the browser fall through to latin-ext").not.toContain("preload: false")
    }
  })

  it("stay one glyph each, not a whole font", () => {
    for (const f of ["inter-rupee.woff2", "inter-tight-rupee.woff2"]) {
      const size = statSync(join(ROOT, "lib/font-files", f)).size
      expect(size, f).toBeGreaterThan(200)
      expect(size, `${f} is ${size} bytes: a whole font, not the rupee sign`).toBeLessThan(4096)
    }
    expect(read("lib/font-files/OFL.txt")).toContain("SIL OPEN FONT LICENSE Version 1.1")
  })

  it("come first in every stack that sets text", () => {
    const tailwind = read("tailwind.config.ts")
    expect(tailwind).toMatch(/sans: \["var\(--font-rupee\)", "var\(--font-sans\)"/)
    expect(tailwind).toMatch(/display: \["var\(--font-rupee-display\)", "var\(--font-display-face\)"/)
    expect(read("app/globals.css")).toMatch(/h1, h2, h3 \{\s*font-family: var\(--font-rupee-display\), var\(--font-display-face\)/)
  })

  it("are defined on the page, and the body takes the stack rather than Inter's own class", () => {
    const layout = read("app/layout.tsx")
    expect(layout).toContain("${fontRupee.variable} ${fontRupeeDisplay.variable}")
    expect(layout).not.toContain("fontSans.className")
  })
})
