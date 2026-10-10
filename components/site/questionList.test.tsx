import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { QuestionList } from "@/components/site/marketing"

/**
 * Answers are shown, not folded away.
 *
 * Every question used to be a <details> with a rotating plus: the FAQ
 * accordion a template ends on, with each answer a tap away. The answers are
 * short, so they are on the page, each pair on the same hairline grid.
 */
describe("questions and answers", () => {
    const items = [
        { q: "Is there a free trial, or a refund?", a: "Neither. Try the demo and the free plan first." },
        { q: "Do prices include GST?", a: "Yes." },
    ]

    it("shows every answer, with each question as a heading", () => {
        const html = renderToString(<QuestionList items={items} columns={2} />)
        expect(html).not.toMatch(/<details|<summary/)
        expect(html.match(/<h3/g)).toHaveLength(2)
        for (const { a } of items) expect(html).toContain(a)
        expect(html).toContain("md:grid-cols-2")
    })

    it("is what the home page, /pricing and the audience pages use", () => {
        for (const rel of ["app/page.tsx", "app/pricing/page.tsx", "components/site/AudienceView.tsx"]) {
            const src = readFileSync(join(process.cwd(), rel), "utf8")
            expect(src, rel).toContain("<QuestionList")
            expect(src, rel).not.toMatch(/FaqItem|<details/)
        }
    })
})
