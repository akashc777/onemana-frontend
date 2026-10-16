import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { BOX } from "@/components/site/AlsoInTheBox"
import CostCalculator from "@/components/site/CostCalculator"
import { HomeComparison } from "@/components/site/HomeComparison"
import { RunSpec } from "@/components/site/RunSpec"
import type { Audience } from "@/lib/audiences"
import { alternativeBySlug, alternatives } from "@/lib/alternatives"
import { cancels, rivals } from "@/lib/compare"
import { defaultPricing } from "@/lib/pricing"
import { SEAT_COSTS, SEAT_COST_SOURCES } from "@/lib/teamCost"

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

/** The words a reader sees in a render: markup gone, apostrophes back. */
const text = (html: string) =>
    html
        .replace(/<!--[\s\S]*?-->/g, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")

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

/**
 * The Slack importer and the Slack bridge exist, and the site says so. A
 * sentence about either says that it exists and what it is for, never how a
 * move goes: what comes across, that nothing is missed, one conversation
 * carried both ways, or an undo afterwards.
 *
 * This also keeps the importer from being denied, as it once was. The FAQ
 * answered "Can we import Slack data? Not at this time" while the backend held
 * a whole Slack import (lib/featureClaims.test.ts guarded that, in a page
 * export no route renders).
 */
describe("how the site offers the Slack importer and the bridge", () => {
    const runSpec = text(renderToString(<RunSpec />))
    const docsIndex = readFileSync(resolve(__dirname, "..", "app", "docs", "page.tsx"), "utf8")
    const slack = page("slack")
    const lines: [string, string][] = [
        // The page's questions may ask what a buyer asks; its answers are held.
        ...shown(slack)
            .filter((s) => !s.endsWith("?"))
            .map((s): [string, string] => ["/alternatives/slack", s]),
        ["/compare, the cancels list", cancels.find((c) => c.tool === "Slack")?.surface ?? ""],
        ["the home page's also-in-the-box", BOX.find((b) => b.slug === "slack-bridge")?.line ?? ""],
        ["the home page's run spec", runSpec.slice(runSpec.indexOf("Moving from Slack"), runSpec.indexOf("Who runs it"))],
        ["the docs index", docsIndex.split("\n").find((l) => l.includes('slug: "slack-bridge"')) ?? ""],
    ]

    it("finds every place that offers them", () => {
        for (const [where, line] of lines.slice(-4)) expect(line, where).toMatch(/Slack/)
    })

    it("promises nothing about how a move goes", () => {
        const promises = [
            /nothing is missed/i,
            /one conversation/i,
            /both ways/i,
            /\bcomes? across\b/i,
            /who said what/i,
            /side by side/i,
            /carried in/i,
            /keep both running/i,
            /\bbring (?:your|our) (?:Slack )?history\b/i,
            /\broll(?:ed)? ?back\b|\brollback\b/i,
            /\buntested\b/i,
        ]
        const found = lines.flatMap(([where, line]) => promises.filter((p) => p.test(line)).map((p) => `${where}: ${p} in "${line.trim()}"`))
        expect(found).toEqual([])
    })

    it("still says the importer and the bridge are there, and never denies either", () => {
        const answer = slack.faqs.find((f) => /Slack history/.test(f.q))?.a ?? ""
        expect(answer).toMatch(/importer for Slack exports/)
        expect(lines.some(([, line]) => /\bbridge\b/.test(line))).toBe(true)
        const all = lines.map(([, line]) => line).join(" ")
        expect(all).not.toMatch(/not at this time|can(?:no|')t import|no Slack import|no (?:Slack )?bridge/i)
    })
})

/**
 * /compare's "subscriptions this usually cancels" lists only tools a team can
 * really stop paying for. Zoom and Google Calendar came off it on 16 October
 * 2026: Zoom wins on webinars, a waiting room and host controls, and Google
 * Calendar on repeating events, RSVP and reminders. Take one off NOT_YET only
 * when OneCamp has those.
 */
const NOT_YET = ["Zoom", "Google Calendar"]

describe("the subscriptions a buyer is told they can cancel", () => {
    it("hold no tool OneCamp doesn't match yet", () => {
        for (const c of cancels) {
            for (const tool of NOT_YET) expect(`${c.tool} ${c.surface}`, c.tool).not.toContain(tool)
        }
    })
})

/**
 * What the per-seat stack costs is what a buyer stops paying, so it counts
 * only tools on that cancels list: the calculator on /compare sits directly
 * above the list, and the home page prices the same stack. Zoom Pro was in it
 * until Zoom came off the list.
 */
describe("the per-seat stack the site prices OneCamp against", () => {
    it("counts only tools a buyer is told they can cancel", () => {
        const cancelled = cancels.flatMap((c) => c.tool.split(" or "))
        for (const line of SEAT_COSTS) {
            expect(cancelled.some((tool) => line.name.startsWith(`${tool} `)), line.name).toBe(true)
        }
        for (const source of SEAT_COST_SOURCES) expect(cancelled, source.name).toContain(source.name)
    })

    it("names no tool OneCamp doesn't match yet, in the calculator or the home page's stack", () => {
        const calc = text(renderToString(<CostCalculator lifetimeUsd={defaultPricing.lifetime_usd} pricing={defaultPricing} />))
        const home = renderToString(<HomeComparison pricing={defaultPricing} />)
        const head = text(home.slice(home.indexOf("<thead"), home.indexOf("</thead>")))
        const caption = text(home.slice(home.indexOf("<caption"), home.indexOf("</caption>")))
        const basis = text(home).match(/The stack is [^.]*\./)?.[0] ?? ""
        expect(basis).toMatch(/^The stack is Slack Pro/)
        const heading = readFileSync(resolve(__dirname, "..", "app", "page.tsx"), "utf8").match(/title="(Against [^"]*)"/)?.[1] ?? ""
        expect(heading).toMatch(/Slack/)
        for (const [where, words] of [["the calculator", calc], ["the table's columns", head], ["the table's caption", caption], ["the stack's basis", basis], ["the home page's heading", heading]] as const) {
            for (const tool of NOT_YET) expect(words, `${where} names ${tool}`).not.toContain(tool)
        }
    })
})
