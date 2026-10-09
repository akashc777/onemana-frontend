import { describe, expect, it } from "vitest"

import nextConfig from "../next.config.mjs"

/**
 * Addresses emails have linked to keep working.
 *
 * The "choose a name" reminder sent Cloud subscribers to onemana.dev/portal, a
 * page that never existed: every reminder ended at a 404 while the workspace
 * waited on them. The emails now link to the account page, and the ones
 * already in inboxes are sent there by this.
 */
async function redirectFor(source: string) {
  const rules = (await nextConfig.redirects?.()) ?? []
  return rules.find((r) => r.source === source)
}

describe("addresses people were sent to", () => {
  it("take an old reminder's /portal link to the account page", async () => {
    for (const source of ["/portal", "/portal/:path*"]) {
      const r = await redirectFor(source)
      expect(r?.destination, source).toBe("/account")
      // Not permanent: a browser caches a permanent redirect for good, and the
      // account page may yet live somewhere else.
      expect(r?.permanent, source).toBe(false)
    }
  })
})
