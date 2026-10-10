import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { SubscribeForm } from "@/components/site/SubscribeForm"

/**
 * The email form behaves like the site's other forms.
 *
 * It had no name or autocomplete (so no autofill), a custom focus ring with
 * the global one switched off, a 10 px input unlike every other field, and a
 * filled black button that competed with the page's one orange action.
 */
describe("the email form", () => {
    const html = renderToString(<SubscribeForm source="pricing" cta="Email me updates" hint="A few times a year." />)
    const input = html.match(/<input\b[^>]*>/)?.[0] ?? ""
    const button = html.match(/<button\b[^>]*>/)?.[0] ?? ""

    it("can be filled in by the browser, and is not spell-checked", () => {
        expect(input).toContain('name="email"')
        expect(input).toContain('autoComplete="email"')
        expect(input).toMatch(/spell[cC]heck="false"/)
    })

    it("keeps the site's focus ring and field shape", () => {
        expect(input).not.toMatch(/outline-none|focus:ring/)
        expect(input).toContain("ui-field")
    })

    it("asks with an outline button, not a second filled one", () => {
        expect(button).not.toContain("btn-primary")
        expect(button).toContain("border-border-strong")
    })

    it("announces its answer where it appears", () => {
        expect(html).toMatch(/<p aria-live="polite"/)
    })
})
