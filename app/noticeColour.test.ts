import { readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Orange is for the one action, focus, the selection and links. A notice is
 * none of those: the account's "a code is on its way" and "that sign-in link
 * has been used" sat on the accent's tint (brand-soft, the selected
 * background). A status or an alert takes a meaning colour (info, success,
 * warning, danger) or none.
 */
const ROOT = resolve(__dirname, "..")
function tsx(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name)
    if (e.isDirectory()) {
      if (!["node_modules", ".next", "admin", "playful-dev"].includes(e.name)) tsx(f, out)
    } else if (f.endsWith(".tsx") && !f.includes(".test.")) out.push(f)
  }
  return out
}

describe("a notice", () => {
  it("is never drawn in the accent", () => {
    const offenders: string[] = []
    for (const f of [...tsx(join(ROOT, "app")), ...tsx(join(ROOT, "components"))]) {
      for (const m of readFileSync(f, "utf8").matchAll(/<[a-z]+\b[^>]*role="(?:status|alert)"[^>]*>/g)) {
        if (/\b(bg|text|border)-brand\b|\b(bg|text|border)-brand-/.test(m[0])) offenders.push(`${f.slice(ROOT.length + 1)}: ${m[0].slice(0, 120)}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
