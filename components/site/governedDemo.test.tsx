import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { GovernedDemo, AUDIT_ROW, STEPS, initialStep } from "@/components/site/GovernedDemo"

/**
 * Node, no DOM, in this repo's idiom: the data and the one decision are
 * exported, so what must not drift is asserted directly, and the markup is
 * checked by rendering to a string the way the stat-strip bug was.
 */

describe("the governed walkthrough", () => {
    // A walkthrough showing a row shape the product does not write would be the
    // exact failure it exists to answer. The MCP layer writes ONE row per
    // decision (business/MCPServer/audit.go), carrying the tool, the named
    // agent, the human who authorised it and the reason.
    it("quotes the product's own audit row", () => {
        expect(AUDIT_ROW.action).toBe("mcp.tool_call.refused")
        expect(AUDIT_ROW.fields.map(([k]) => k)).toEqual([
            "tool",
            "agent",
            "authorised by",
            "reason",
        ])
        // One hash on its own demonstrates nothing; the link is the claim.
        expect(AUDIT_ROW.hashes).toMatch(/prev .+→ this .+/)
    })

    it("walks one path and ends on the refusal", () => {
        expect(STEPS).toHaveLength(4)
        expect(STEPS[STEPS.length - 1].call).toBe("refused")
        expect(STEPS[0].call).toBeUndefined()
    })

    // Somebody who asked for less motion gets the point without operating a
    // control to reach it, and a sales link can hand somebody the answer.
    it("opens on the answer for reduced motion or a sales link", () => {
        expect(initialStep({ reduced: true, deepLinked: false })).toBe(STEPS.length - 1)
        expect(initialStep({ reduced: false, deepLinked: true })).toBe(STEPS.length - 1)
    })

    it("otherwise starts at the beginning, so the refusal is watched rather than read", () => {
        expect(initialStep({ reduced: false, deepLinked: false })).toBe(0)
    })

    it("says what it is, and does not claim to be the live app", () => {
        const html = renderToString(<GovernedDemo />)
        expect(html).toContain("Interactive walkthrough")
        expect(html).toContain("same permission rules as production")
        expect(html).not.toMatch(/live app/i)
    })

    // The server render is what a crawler and a no-JS reader get. It must show
    // the thread rather than the conclusion, and it must not be empty.
    it("renders the first step on the server", () => {
        const html = renderToString(<GovernedDemo />)
        expect(html).toContain("#finance")
        expect(html).toContain("Priya N.")
        expect(html).not.toContain(AUDIT_ROW.action)
    })

    it("names every step for a screen reader", () => {
        const html = renderToString(<GovernedDemo />)
        for (const [i, s] of STEPS.entries()) {
            expect(html, `step ${i + 1} has no label`).toContain(`Step ${i + 1}: ${s.label}`)
        }
    })

    // The permission layer's own sentence, quoted rather than paraphrased.
    it("quotes the refusal rather than writing one", () => {
        expect(STEPS.some((s) => s.call === "refused")).toBe(true)
        const html = renderToString(<GovernedDemo />)
        expect(html).not.toContain("denied by policy")
    })
})
