import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { RecordRows } from "@/components/site/RecordRows"
import { attemptAndRefusal } from "@/lib/recordExcerpt"

/**
 * The record rows are the site's evidence, so a screen reader has to get the
 * same evidence a sighted reader does: which hash is which, and that the
 * marked one is the hash the neighbouring row carries. "prev 9f2c…41ab" said
 * neither. And the marks are only drawn where the chain actually holds.
 */
describe("the record rows", () => {
    it("names each hash, and says which neighbour shares the marked one", () => {
        const html = renderToString(<RecordRows rows={attemptAndRefusal} />)
        expect(html.match(/Hash of the row before: /g)).toHaveLength(2)
        expect(html.match(/This row&#x27;s hash: /g)).toHaveLength(2)
        // Oldest first: the attempt's own hash is the refusal's prev.
        expect(html).toContain(" (matches the row below)")
        expect(html).toContain(" (matches the row above)")
    })

    it("marks no chain between rows that do not chain", () => {
        const [attempt, refusal] = attemptAndRefusal
        const html = renderToString(<RecordRows rows={[attempt, { ...refusal, prev: "0".repeat(64) }]} />)
        expect(html).not.toContain("matches the row")
        expect(html).not.toContain("bg-muted-foreground/70")
    })
})
