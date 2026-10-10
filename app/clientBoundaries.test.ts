import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * The marketing pages are drawn on the server; only what a visitor operates is
 * a client component.
 *
 * WHY. A page marked "use client" sends everything on it as JavaScript, and a
 * client page that reads the query (useSearchParams) is not drawn on the
 * server at all: /buy sent "Loading…" and drew the checkout in the browser,
 * and /free shipped its headings and lists as script. Each page here is a
 * server component; the parts with state live in their own small files.
 */
const ROOT = process.cwd()
const isClient = (rel: string) => /^\s*["']use client["']/.test(readFileSync(join(ROOT, rel), "utf8"))

const SERVER_PAGES = [
  "app/page.tsx",
  "app/pricing/page.tsx",
  "app/buy/page.tsx",
  "app/free/page.tsx",
  "app/compare/page.tsx",
  "app/alternatives/[rival]/page.tsx",
  "app/for/[audience]/page.tsx",
  "app/templates/page.tsx",
  "app/templates/[slug]/page.tsx",
  "app/about/page.tsx",
  "app/not-found.tsx",
  // The site chrome: the nav is drawn on the server, with two client parts.
  "components/site/Nav.tsx",
  "components/site/Footer.tsx",
]

describe("client boundaries on the marketing site", () => {
  for (const rel of SERVER_PAGES) {
    it(`${rel} is a server component`, () => {
      expect(isClient(rel), `${rel} is marked "use client"`).toBe(false)
    })
  }

  it("keeps the interactive parts of /buy and /free in their own client files", () => {
    expect(isClient("app/buy/BuyCheckout.tsx")).toBe(true)
    expect(isClient("app/free/FreeInstall.tsx")).toBe(true)
    expect(isClient("components/site/NavParts.tsx")).toBe(true)
  })
})
