import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { CAMP, SHARED, hexToTriple } from "@/lib/palette"

function tokens(css: string, selector: string): Record<string, string> {
  const at = css.search(new RegExp(`^${selector.replace(".", "\\.")}\\s*\\{`, "m"))
  if (at < 0) return {}
  const body = css.slice(at, css.indexOf("}", at))
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

describe("shared tokens", () => {
  const css = readFileSync(resolve(__dirname, "globals.css"), "utf8")
  for (const [theme, selector] of [["light", ":root"], ["dark", ".dark"]] as const) {
    it(`${theme} matches the workspace`, () => {
      const got = tokens(css, selector)
      for (const [name, rgb] of Object.entries(SHARED[theme])) {
        expect(got[name], `--${name}`).toBe(rgb.join(" "))
      }
    })

    it(`${theme} camp palette is the workspace's, exactly`, () => {
      const got = tokens(css, selector)
      expect(Object.keys(CAMP[theme])).toHaveLength(18)
      for (const [name, hex] of Object.entries(CAMP[theme])) {
        expect(got[name], `--${name} (${hex})`).toBe(hexToTriple(hex).join(" "))
      }
    })
  }
})
