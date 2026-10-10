import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Old links land on the home page's sections, so those sections are always
 * laid out.
 *
 * Tried on 10 Oct 2026 and taken out: content-visibility:auto on the lower
 * home sections halved a phone's style and layout work (median 411 to 223 ms
 * in Lighthouse), but a link to /#pricing then landed 5,966 px from its
 * target on a 390 px screen, and /#faq and /#compare were off on a wide one:
 * the browser scrolls by the skipped sections' estimated heights. Links to
 * /#pricing, /#faq and the rest are in posts and emails, and the LCP gain was
 * inside the noise, so the cost was not worth it.
 */
describe("anchor targets on the home page", () => {
  const page = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8")
  const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8")

  it("are never skipped by content-visibility", () => {
    expect(page).not.toMatch(/content-visibility/)
    expect(css).not.toMatch(/content-visibility:\s*auto/)
  })

  it("keep the ids old links use", () => {
    for (const id of ["product", "demo", "run", "compare", "pricing", "faq"]) {
      expect(page, `#${id}`).toContain(`id="${id}"`)
    }
    for (const alias of ["features", "tour", "governance", "enterprise"]) {
      expect(page, `#${alias}`).toContain(`id="${alias}"`)
    }
  })
})
