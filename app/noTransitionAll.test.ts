import { describe, expect, it } from "vitest"
import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

/**
 * `transition-all` animates every property that changes, layout included, so a
 * hover that nudges padding or a width becomes a reflow on every frame (Vercel's
 * interface guidelines: never transition "all"). The app enforces the same.
 * Name the properties: `transition` (colour, opacity, shadow, transform) or
 * `transition-[left,width]`.
 */
const root = resolve(__dirname, "..")
function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = resolve(dir, e.name)
    if (e.isDirectory()) {
      if (e.name !== "node_modules" && e.name !== ".next") walk(f, out)
    } else if (f.endsWith(".tsx") && !f.includes(".test.")) out.push(f)
  }
  return out
}

describe("no transition-all", () => {
  it("names the properties it animates", () => {
    const hits = [...walk(resolve(root, "components")), ...walk(resolve(root, "app"))]
      .filter((f) => /\btransition-all\b/.test(readFileSync(f, "utf8")))
      .map((f) => f.slice(root.length + 1))
    expect(hits).toEqual([])
  })
})
