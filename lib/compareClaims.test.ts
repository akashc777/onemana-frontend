import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import { CLAIMS_CHECKED, killQuestion, onecampRow, rivals } from "@/lib/compare"

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
