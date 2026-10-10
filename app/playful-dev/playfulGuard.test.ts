import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

/**
 * The playful showcase is for the people building the site. It must never
 * ship: a production build answers 404, it is not in the sitemap, and it asks
 * search engines to stay away.
 */
const page = readFileSync(join(__dirname, "page.tsx"), "utf8")
const sitemap = readFileSync(join(__dirname, "..", "sitemap.ts"), "utf8")

describe("the playful showcase", () => {
  it("is a 404 in any production build", () => {
    expect(page).toMatch(/if \(process\.env\.NODE_ENV === "production"\) notFound\(\)/)
    expect(page).toMatch(/import \{ notFound \} from "next\/navigation"/)
  })

  it("is not in the sitemap, and asks search engines to stay away", () => {
    expect(sitemap).not.toContain("playful")
    expect(page).toMatch(/robots:\s*\{\s*index:\s*false/)
  })
})
