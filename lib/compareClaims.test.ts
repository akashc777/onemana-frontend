import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import {
    AGENTS_CHECKED,
    CLAIMS_CHECKED,
    RECORD_KEEPING_IN_FORCE,
    agentsYouBring,
    RECORD_KEEPING_SOURCE,
    countWord,
    killQuestion,
    onecampRow,
    recordKeeping,
    rivalNames,
    rivals,
    rivalsLine,
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
        // The agents table carries the date it was read, not the rivals' date.
        expect(AGENTS_CHECKED).toMatch(/\d{4}/)
        expect(VIEW).toContain("AGENTS_CHECKED")
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

    it("does not say every claim links, when the concessions carry no link", () => {
        expect(VIEW).not.toMatch(/every claim/i)
    })
})

/**
 * The page said "five open-source alternatives" over six rivals, one of them
 * closed, and "ask all five of us" over a table of seven products. Each number
 * was typed into the copy while the list grew. Now every count is worked out
 * from the list, and a typed one fails here.
 */
describe("the counts the page prints", () => {
    it("works them out from the list rather than typing them", () => {
        expect(VIEW).toContain("rivalsLine()")
        expect(VIEW).not.toMatch(/\b(?:two|three|four|five|six|seven|eight|nine|ten)\s+(?:open|alternatives|of us)\b/i)
    })

    it("says how many rivals there are, and how many publish their code", () => {
        const open = rivals.filter((r) => r.openSource).length
        const line = rivalsLine()
        expect(line.toLowerCase().startsWith(`${countWord(rivals.length)} `)).toBe(true)
        if (open > 0 && open < rivals.length) expect(line).toContain(`${countWord(open)} of them open source`)
    })

    it("words every mix of open and closed rivals", () => {
        const as = (openSource: boolean) => ({ ...rivals[0], openSource })
        expect(rivalsLine([as(true), as(true)])).toBe("Two open-source alternatives")
        expect(rivalsLine([as(false), as(false)])).toBe("Two alternatives")
        expect(rivalsLine([as(true), as(false), as(true)])).toBe("Three alternatives, two of them open source")
    })

    it("does not count a hosted product with no licence or repository as open source", () => {
        expect(rivals.find((r) => r.name === "Ando")?.openSource).toBe(false)
    })

    it("names every rival in the page's search description", () => {
        const page = readFileSync(resolve(__dirname, "..", "app", "compare", "page.tsx"), "utf8")
        expect(page).toContain("rivalNames()")
        for (const r of rivals) expect(rivalNames()).toContain(r.name)
    })
})

/**
 * Two rows said more than the pages they link to (10 October 2026 review).
 * Ando's announcement says agents are members that choose their channels; it
 * says nothing of an identity, an inbox or permissions. Plane's pricing page
 * marks its AI "Cloud only" and names no local model.
 */
describe("rows that once said more than their source", () => {
    const row = (name: string) => {
        const r = rivals.find((x) => x.name === name)
        expect(r, `${name} is not in the list`).toBeTruthy()
        return r!
    }

    it("keeps Ando's row to its announcement", () => {
        const ando = row("Ando")
        expect(`${ando.agents} ${ando.theyWin}`).not.toMatch(/inbox|identity|permission|hosted harness/i)
    })

    it("keeps Plane's row to its pricing page", () => {
        const plane = row("Plane")
        expect(`${plane.what} ${plane.agents}`).not.toMatch(/local model/i)
        expect(plane.agents).toMatch(/cloud only/i)
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
        expect(VIEW).toContain("No software meets a regulation for you")
        // The site's word for what it offers is "recorded", never "compliant"
        // or "compliance", not even to disclaim it (owner rule, 13 Oct 2026).
        const words = (VIEW.match(/>[^<{}]*</g) ?? []).join(" ") + JSON.stringify(recordKeeping)
        expect(words).not.toMatch(/complian/i)
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

describe("the agents a buyer already pays for", () => {
    it("sources how each one bills and connects", () => {
        expect(agentsYouBring.length).toBeGreaterThan(0)
        for (const a of agentsYouBring) {
            expect(a.source, `${a.name} has no source`).toMatch(/^https:\/\//)
            expect(a.billing.length, `${a.name} has no billing line`).toBeGreaterThan(10)
            expect(a.connects.length, `${a.name} has no connection line`).toBeGreaterThan(10)
        }
    })

    it("never tells a buyer to paste a token", () => {
        for (const a of agentsYouBring) {
            expect(a.connects).not.toMatch(/token|bearer|api key/i)
        }
    })

    it("is rendered on the page", () => {
        expect(VIEW).toContain("agentsYouBring")
    })
})
