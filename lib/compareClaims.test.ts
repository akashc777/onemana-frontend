import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import {
    CLAIMS_CHECKED,
    RECORD_KEEPING_IN_FORCE,
    RECORD_KEEPING_SOURCE,
    killQuestion,
    onecampRow,
    recordKeeping,
    rivals,
} from "@/lib/compare"

/**
 * A page that describes other people's products is the easiest page on this site
 * to be wrong on, and the most expensive one to be wrong on.
 *
 * Two failure modes, both of which have sunk comparison pages elsewhere. The
 * first is the stale claim: a rival's pricing changes, nobody rereads the page,
 * and a prospect who does read it catches the site being wrong about a fact they
 * can check in one click. The second is the page that only ever says "we win",
 * which is the sound every vendor comparison makes, and which a buyer discounts
 * entirely — taking the true claims down with the rest.
 *
 * So: every rival carries a source and a concession, or this fails. Neither is a
 * matter of taste, and neither survives being left to good intentions on the day
 * somebody adds a fifth competitor in a hurry.
 */
const VIEW = readFileSync(resolve(__dirname, "..", "components", "site", "CompareView.tsx"), "utf8")

describe("what the comparison page is allowed to claim", () => {
    it("sources every claim it makes about somebody else", () => {
        for (const r of rivals) {
            expect(r.source, `${r.name} has no source`).toMatch(/^https:\/\//)
        }
    })

    it("names what each rival does better", () => {
        for (const r of rivals) {
            expect(r.theyWin.split(/\s+/).length, `${r.name}'s concession is too thin to be one`).toBeGreaterThan(5)
        }
    })

    it("concedes before it argues", () => {
        // Order on the page, not merely presence. A concession printed below the
        // table is a footnote; printed above it, it is the reason the table gets
        // read at all.
        const concession = VIEW.indexOf("What the others do better")
        const table = VIEW.indexOf("How you pay, and what governs the agents")
        expect(concession).toBeGreaterThan(-1)
        expect(table).toBeGreaterThan(-1)
        expect(concession).toBeLessThan(table)
    })

    it("tells the reader when the claims were checked", () => {
        expect(CLAIMS_CHECKED).toMatch(/\d{4}/)
        expect(VIEW).toContain("CLAIMS_CHECKED")
    })

    it("links each rival to the page its row came from", () => {
        expect(VIEW).toContain("href={r.source}")
    })

    it("does not describe itself in terms it withholds from everyone else", () => {
        // The OneCamp row is deliberately the same shape as a rival's. A field
        // that exists only for us is a column nobody else was scored on.
        for (const field of ["name", "what", "billing", "agents"] as const) {
            expect(onecampRow[field], `the OneCamp row is missing ${field}`).toBeTruthy()
        }
    })

    it("asks something a reader could actually go and check", () => {
        // A governance question phrased as a value ("do you take security
        // seriously") cannot be answered no, which is what makes it worthless.
        expect(killQuestion).toMatch(/\?$/)
        expect(killQuestion.toLowerCase()).toContain("before the side effect")
    })

    it("does not reopen the feature-for-feature fight", () => {
        // The homepage stopped arguing module against category leader. Moving the
        // section to its own page was not permission to start again.
        expect(VIEW).toContain("Not a feature-for-feature swap")
    })
})

/**
 * The record-keeping section is the easiest place on this site to say something
 * that is both persuasive and false.
 *
 * "EU AI Act compliant" is the sentence every vendor reaches for and no vendor
 * can deliver: compliance is a property of a deployment and its use case, not of
 * a tool. Saying it would also be the exact failure this whole page was built to
 * avoid, one page after conceding what four rivals do better.
 */
describe("what the page says about the regulation", () => {
    it("never claims to confer compliance", () => {
        const text = VIEW + JSON.stringify(recordKeeping)
        for (const forbidden of [/\bmakes you compliant\b/i, /\bcompliant out of the box\b/i, /\bguarantees? compliance\b/i, /\bfully compliant\b/i]) {
            expect(forbidden.test(text), `the page claims compliance: ${forbidden}`).toBe(false)
        }
        // And says the opposite, in the place a reader is most likely to assume it.
        expect(VIEW).toContain("No software can make you compliant")
    })

    it("dates the obligation and links the article", () => {
        // A regulatory claim with no date is one nobody can check and one that
        // silently rots. The date is the first thing a sceptical reader looks for.
        expect(RECORD_KEEPING_IN_FORCE).toMatch(/2026/)
        expect(RECORD_KEEPING_SOURCE).toMatch(/^https:\/\//)
        expect(VIEW).toContain("RECORD_KEEPING_SOURCE")
    })

    it("answers each obligation with something checkable, not an adjective", () => {
        for (const r of recordKeeping) {
            expect(r.asked.length, "an obligation with no wording").toBeGreaterThan(20)
            // The right-hand column has to describe a mechanism. A row that reads
            // "enterprise-grade auditing" is the thing this column exists instead of.
            expect(r.produced.split(/\s+/).length, `"${r.asked}" is answered too thinly`).toBeGreaterThan(8)
            expect(/enterprise-grade|best-in-class|robust|world-class/i.test(r.produced),
                `"${r.asked}" is answered with an adjective`).toBe(false)
        }
    })
})
