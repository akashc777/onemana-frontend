import { describe, expect, it } from "vitest"

import type { Audience } from "@/lib/audiences"
import { alternativeBySlug, alternatives } from "@/lib/alternatives"
import { rivals } from "@/lib/compare"

/**
 * What the site says OneCamp matches, held to what the code does.
 *
 * On 16 October 2026 the product was checked against Slack, Notion, Zoom,
 * Asana, Jira and Google Calendar, feature by feature, in the code. Several
 * lines here said more than the code does: "Everything you use in Slack",
 * an offline concession that handed Notion a Linux app it does not have, and
 * a rival we were sure "never added" read receipts. Each test below keeps one
 * of them from coming back.
 */

/** Every sentence an alternatives page shows. */
function shown(a: Audience): string[] {
    return [
        a.eyebrow,
        a.title,
        a.subtitle,
        a.seoTitle,
        a.seoDescription,
        a.priceNote,
        ...a.points.flatMap((p) => [p.title, p.body]),
        ...a.faqs.flatMap((f) => [f.q, f.a]),
        ...(a.rival ? [a.rival.billing, ...a.rival.theyWin] : []),
        ...(a.move ? [a.move.title, ...a.move.steps] : []),
    ]
}

const page = (slug: string) => {
    const a = alternativeBySlug(slug)
    expect(a, `no /alternatives/${slug}`).toBeTruthy()
    return a!
}

describe("what the alternatives pages say OneCamp matches", () => {
    it("never says OneCamp has everything a rival has", () => {
        for (const a of alternatives) {
            for (const s of shown(a)) {
                expect(s, a.slug).not.toMatch(/\beverything (?:you|we|a team|your team|teams) (?:use|uses|need|needs|get|gets)\b/i)
            }
        }
    })

    it("says the Slack page covers most of what a team uses, and names what Slack does that OneCamp doesn't", () => {
        const slack = page("slack")
        expect(slack.points[0]!.title).toBe("Most of what a team uses in Slack")
        const theyWin = slack.rival!.theyWin.join(" ")
        for (const gap of [
            /Threads view/,
            /following a thread/,
            /@channel/,
            /@here/,
            /@everyone/,
            /user groups/i,
            /keywords/,
            /more than one reaction/i,
            /pinned messages/,
            /custom emoji/,
            /link previews/,
            /search you can narrow/i,
            /Slack Connect/,
        ]) {
            expect(theyWin, `Slack's concessions no longer name ${gap}`).toMatch(gap)
        }
    })

    it("says what a rival doesn't have, never that it never added it", () => {
        // An absence can be read on a rival's pages today; that it never
        // existed cannot be proven, so the site doesn't say it.
        const text = [...alternatives.flatMap(shown), ...rivals.map((r) => r.theyWin)]
        expect(text.filter((s) => /\bnever (?:added|had|built|shipped)\b/i.test(s))).toEqual([])
        expect(page("slack").points[0]!.body).toContain("read receipts in DMs, which Slack doesn't have")
    })

    it("concedes Notion's offline pages without giving it a platform it lacks", () => {
        const theyWin = page("notion").rival!.theyWin
        expect(theyWin).toContain("Offline pages in its Mac, Windows and phone apps.")
        // Notion has no Linux app, and none of its apps is "every platform".
        expect(theyWin.join(" ")).not.toMatch(/every platform|linux/i)
    })
})
