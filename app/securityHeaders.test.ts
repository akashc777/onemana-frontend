import { describe, expect, it } from "vitest"

import nextConfig from "../next.config.mjs"

/**
 * The content security policy may only hold directives that cannot block
 * anything the site loads. next.config.mjs says why: a policy for scripts,
 * frames or connections can break Razorpay Checkout, which cannot be tested
 * without paying. Widening it means trying it in a browser as
 * Content-Security-Policy-Report-Only first, then changing this test.
 */
async function headersFor(source: string): Promise<Record<string, string>> {
  const rules = (await nextConfig.headers?.()) ?? []
  const rule = rules.find((r) => r.source === source)
  return Object.fromEntries((rule?.headers ?? []).map((h) => [h.key, h.value]))
}

describe("the security headers on every page", () => {
  it("include a content security policy with only the directives that cannot break checkout", async () => {
    const csp = (await headersFor("/:path*"))["Content-Security-Policy"] ?? ""
    const directives = Object.fromEntries(
      csp
        .split(";")
        .map((d) => d.trim().split(/\s+/))
        .map(([name, ...values]) => [name, values.join(" ")]),
    )
    expect(directives).toEqual({ "base-uri": "'self'", "object-src": "'none'", "frame-ancestors": "'self'" })
  })

  it("keep the headers that were already there", async () => {
    const h = await headersFor("/:path*")
    expect(h["X-Content-Type-Options"]).toBe("nosniff")
    expect(h["X-Frame-Options"]).toBe("SAMEORIGIN")
    expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin")
  })
})
