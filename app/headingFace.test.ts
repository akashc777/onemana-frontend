import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Headings are Inter Display (design v3, the owner's choice of 11 Oct 2026):
 * Inter at its opsz 32 cut, which globals.css gives every h1 to h3. A heading
 * set at a text size (a template's task, an aside's title, a post's "Read
 * next") must not take the display cut: under Inter Tight, at 14 px its words
 * ran together ("Firstdraft", "Finaldelivery", "Ataglance"). The size class
 * decides it, in one rule: the text cut, at an app heading's 590.
 */
const css = readFileSync(join(__dirname, "globals.css"), "utf8")

describe("a heading set at a text size", () => {
  const rule = css.match(/:is\(h1, h2, h3, h4\):is\(([^)]*)\)\s*\{([^}]*)\}/)

  it("is caught by one rule for every text size on the scale", () => {
    expect(rule).not.toBeNull()
    const sizes = rule![1].split(",").map((s) => s.trim())
    for (const size of [".text-body", ".text-small", ".text-caption"]) expect(sizes).toContain(size)
  })

  it("takes the text cut at 590, with its size's own tracking", () => {
    expect(rule![2]).toMatch(/font-family:\s*var\(--font-rupee\),\s*var\(--font-sans\)/)
    expect(rule![2]).toMatch(/font-variation-settings:\s*normal/)
    expect(rule![2]).toMatch(/font-weight:\s*590/)
  })

  it("gives every other heading Inter Display: opsz 32, no Inter Tight", () => {
    expect(css).toMatch(/h1, h2, h3, \.font-display \{[^}]*font-variation-settings:\s*"opsz" 32/)
    expect(css.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/font-display-face|Inter Tight/)
    const fonts = readFileSync(join(__dirname, "../lib/fonts.ts"), "utf8")
    expect(fonts).not.toMatch(/Inter_Tight/)
    expect(fonts).toMatch(/axes: \["opsz"\]/)
  })
})
