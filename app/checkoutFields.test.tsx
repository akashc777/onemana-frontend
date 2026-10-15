import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "",
}))

import { BuyCheckout } from "@/app/buy/BuyCheckout"
import { WorkspaceAddressField } from "@/components/site/WorkspaceAddressField"
import { Field } from "@/components/ui/Field"
import { defaultPricing } from "@/lib/pricing"
import { motionCss } from "@/lib/tailwindAppSystem"

/**
 * The checkout's fields, the money path's weakest part in the storefront
 * audit (§7 row 3).
 */
const css = readFileSync(resolve(__dirname, "globals.css"), "utf8")
const cloud = renderToString(<BuyCheckout initialPlan="cloud" initialBilling="monthly" initialPricing={defaultPricing} initialCountry="US" />)

describe("the checkout's fields", () => {
  // K8: under a keyboard that resizes the page, the sticky pay bar covered
  // the field being typed into.
  it("the pay bar lets go of the foot while a field has focus, and fields stop clear of it", () => {
    const rule = /@media \(max-width: 767\.98px\) \{([\s\S]*?)\n {2}\}/.exec(css.slice(css.indexOf("THE CHECKOUT'S PAY BAR")))?.[1] ?? ""
    expect(rule).toMatch(/\.pay-form :is\(input, textarea, select, \[role="combobox"\]\) \{\s*scroll-margin-bottom: 6rem;/)
    expect(rule).toMatch(/\.pay-form:has\(:is\(input, textarea, select, \[role="combobox"\]\):focus\) \.pay-bar \{\s*position: static;/)
    expect(cloud).toMatch(/<form[^>]*class="pay-form /)
    expect(cloud).toMatch(/<div class="pay-bar sticky bottom-3/)
  })

  // K7: a taken name set aria-invalid, and the field shook while the buyer
  // was still typing.
  it("a field shakes only when a submit is refused, never because a live check marked it", () => {
    const shake = motionCss() as Record<string, unknown>
    expect(shake[".ui-field[aria-invalid='true']"]).toBeUndefined()
    expect(String((shake[".ui-field[aria-invalid='true'][data-shake]"] as { animation: string }).animation)).toMatch(/^v3-shake /)
    const marked = renderToString(<WorkspaceAddressField value="taken" onChange={() => {}} onVerdict={() => {}} inputClassName="ui-field" />)
    expect(marked).not.toContain("data-shake")
    const refused = renderToString(<WorkspaceAddressField value="taken" onChange={() => {}} onVerdict={() => {}} inputClassName="ui-field" refused />)
    expect(refused).toMatch(/<input[^>]*aria-invalid="true"[^>]*data-shake="true"/)
  })

  // K4: the required "*" was danger red at rest, and read as an error.
  it("marks a required field in ink-3, not in danger red", () => {
    const html = renderToString(<Field label="Email" required><input /></Field>)
    expect(html).toContain('<span aria-hidden="true" class="text-faint">*</span>')
    expect(cloud).not.toMatch(/text-danger-ink">\*/)
  })

  // K9: 12 px terms links, in a third link look.
  it("the terms links are the site's links, at 13 px", () => {
    const terms = cloud.slice(cloud.indexOf("you agree to our") - 200, cloud.indexOf("refund policy</a>") + 20)
    expect(terms).toContain('<p class="text-caption text-muted-foreground">')
    // Each named as its page is (lib/legalPages.test.tsx, one name per page).
    expect(terms).toContain('<a href="/terms-of-service" class="link">terms of service</a>')
    expect(terms).toContain('<a href="/refund-policy" class="link">refund policy</a>')
  })
})
