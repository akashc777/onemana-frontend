import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

/**
 * DESIGN.md, Motion: every animation stands still for a visitor who asked for
 * reduced motion. A class that animates in globals.css must therefore also be
 * named in the `prefers-reduced-motion: reduce` block, or the hero plays for
 * someone who opted out of it.
 */
const css = readFileSync(resolve(__dirname, "globals.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")

function reducedBlock(src: string): string {
  const start = src.indexOf("@media (prefers-reduced-motion: reduce)")
  if (start < 0) return ""
  let depth = 0
  for (let i = src.indexOf("{", start); i < src.length; i++) {
    if (src[i] === "{") depth++
    else if (src[i] === "}" && --depth === 0) return src.slice(start, i + 1)
  }
  return src.slice(start)
}

describe("reduced motion", () => {
  it("stills every animated class", () => {
    const reduced = reducedBlock(css)
    const rest = css.replace(reduced, "")
    const animated = new Set<string>()
    for (const m of rest.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/(^|[;\s])animation(-name)?\s*:\s*(?!none)/.test(m[2])) continue
      for (const cls of m[1].matchAll(/\.([a-zA-Z][\w-]*)/g)) animated.add(cls[1])
    }
    expect(animated.size).toBeGreaterThan(0)
    const missing = [...animated].filter((c) => !new RegExp(`\\.${c}(?![\\w-])`).test(reduced))
    expect(missing).toEqual([])
  })
})
