import { readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * PageHeader's className lands on its outer <section>, and its 40 px bottom
 * padding is on the container inside, so a padding override passed in does
 * nothing: /free, /buy and the template pages passed "!pb-0" and kept 40 px.
 * A page's first actions go in as children instead (PageHeader.tsx).
 */
const ROOT = resolve(__dirname, "..")
function tsx(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name)
    if (e.isDirectory()) {
      if (!["node_modules", ".next"].includes(e.name)) tsx(f, out)
    } else if (f.endsWith(".tsx") && !f.includes(".test.")) out.push(f)
  }
  return out
}

describe("PageHeader", () => {
  it("is never handed a bottom padding it cannot apply", () => {
    const offenders: string[] = []
    for (const f of [...tsx(join(ROOT, "app")), ...tsx(join(ROOT, "components"))]) {
      for (const m of readFileSync(f, "utf8").matchAll(/<PageHeader\b[^>]*?className="([^"]*)"/gs)) {
        if (/(^|\s)!?pb-/.test(m[1]!)) offenders.push(`${f.slice(ROOT.length + 1)}: ${m[1]}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
