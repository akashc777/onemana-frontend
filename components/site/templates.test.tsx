import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import TemplatesPage from "@/app/templates/page"
import { TemplateView } from "@/components/site/TemplateView"
import { hueFor } from "@/lib/campHue"
import { templates } from "@/lib/templates"

/**
 * The template gallery: each template in its identity colour, as a project is
 * in the app, cards that answer the pointer because the whole card is the
 * link, and the site's own focus ring rather than one of the card's.
 */
describe("the template gallery", () => {
    const html = renderToString(<TemplatesPage />)
    const cards = html.match(/<a[^>]*href="\/templates\/[^"]+"[^>]*>/g) ?? []

    it("lifts a card under the pointer and keeps the site's focus ring", () => {
        expect(cards.length).toBe(templates.length)
        for (const a of cards) {
            expect(a).toContain("hover:-translate-y-px")
            expect(a).not.toMatch(/outline-none|focus-visible:ring/)
        }
    })

    it("marks each template with its identity colour", () => {
        for (const t of templates) expect(html).toContain(`data-hue="${hueFor(t.id)}"`)
    })
})

describe("a template's page", () => {
    it("names its weeks in sentence case, not as uppercase eyebrows", () => {
        const html = renderToString(<TemplateView t={templates[0]} />)
        expect(html).toMatch(/>Week (<!-- -->)?1</)
        expect(html).not.toMatch(/uppercase/)
    })
})
