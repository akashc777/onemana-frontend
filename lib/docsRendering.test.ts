import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * A page that regenerates on a timer (`export const revalidate`) may not read
 * anything with no-store: Next then throws DYNAMIC_SERVER_USAGE at runtime, the
 * build still passes, and the page answers 500. Every doc page did, until the
 * October 2026 walk through the site found it.
 */
function pages(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) pages(p, out)
    else if (/^(page|layout|sitemap)\.tsx?$/.test(name)) out.push(p)
  }
  return out
}

describe("pages that regenerate on a timer", () => {
  const app = join(__dirname, "..", "app")
  const timed = pages(app).filter((p) => /export const revalidate\s*=/.test(readFileSync(p, "utf8")))

  it("exist, so this test is looking at something", () => {
    expect(timed.length).toBeGreaterThan(0)
  })

  it.each(timed)("%s reads nothing uncached", (p) => {
    const src = readFileSync(p, "utf8")
    expect(src).not.toMatch(/no-store|noStore|fresh:\s*true|cookies\(\)|headers\(\)/)
  })
})
