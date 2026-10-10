import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import TemplatesPage from "@/app/templates/page"
import { gallerySpans } from "@/components/site/gallery"
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


/**
 * Every row of the gallery is full. Seven templates in rows of three left one
 * card alone in the last row; the spans now make 3 + 4 on a wide screen and a
 * wide first card in two columns, for any count.
 */
describe("the gallery's rows", () => {
    // Auto-placement: a card that does not fit the rest of a row starts a new one.
    function rows(spans: number[], cols: number): number[] {
        const out: number[] = []
        let used = 0
        for (const s of spans) {
            if (used + s > cols) {
                out.push(used)
                used = 0
            }
            used += s
        }
        out.push(used)
        return out
    }
    const span = (cls: string, prefix: string, fallback: number) => Number(cls.match(new RegExp(`${prefix}:col-span-(\\d+)`))?.[1] ?? fallback)

    for (let n = 2; n <= 10; n++) {
        it(`fills every row with ${n} templates`, () => {
            const spans = gallerySpans(n)
            expect(rows(spans.map((c) => span(c, "lg", 4)), 12).every((r) => r === 12)).toBe(true)
            expect(rows(spans.map((c) => span(c, "sm", 1)), 2).every((r) => r === 2)).toBe(true)
        })
    }
})
