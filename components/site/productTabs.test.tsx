import { readFileSync } from "node:fs"
import path from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ProductTabs } from "@/components/site/ProductTabs"
import { firstTourScene } from "@/components/site/showcase/tour"
import { LATER_SCENES } from "@/components/site/showcase/tourLater"
import { agentsDesktop, agentsPhone } from "@/components/site/showcase/scenes/agents"
import { boardDesktop, boardPhone } from "@/components/site/showcase/scenes/board"
import { calendarDesktop, calendarPhone } from "@/components/site/showcase/scenes/calendar"
import { chatDesktop, chatPhone } from "@/components/site/showcase/scenes/chat"
import { paletteDesktop, palettePhone } from "@/components/site/showcase/scenes/palette"

/**
 * Each surface wears its hue from its chip to its stage (site.md H4, G7):
 * Docs dusk, Tasks moss, Calendar sun, Agents the agent's indigo (never
 * dusk), Ask lake, Chat sky. The tabs never move on their own, only the chosen panel
 * renders, and the surface is OneCamp drawn by its own components
 * (components/site/showcase), never a screenshot.
 */
describe("the product tabs", () => {
    const html = renderToString(<ProductTabs first={firstTourScene()} />)
    const panel = html.slice(html.indexOf('role="tabpanel"'))

    it("gives every chip a dot in its own hue, in the tour's order", () => {
        const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*class="([^"]*)"/g)].map((m) => m[1]!.split(" ")[0])
        expect(tabs).toEqual(["hue-dusk", "hue-moss", "hue-sun", "[--hue:var(--agent)]", "hue-lake", "hue-sky"])
    })

    it("sets the chosen surface on that hue's stage", () => {
        expect(panel).toMatch(/class="hue-dusk relative isolate overflow-hidden rounded-3xl bg-hue-tint/)
    })

    it("draws the surface as a scene, one picture with words for a screen reader, and no image", () => {
        expect(panel).not.toMatch(/<img\b/)
        const scenes = [...panel.matchAll(/<div role="img" aria-label="([^"]+)" data-scene=""/g)].map((m) => m[1])
        // The desktop scene and the phone's own; CSS shows one.
        expect(scenes).toHaveLength(2)
        for (const label of scenes) expect(label!.length).toBeGreaterThan(40)
    })

    it("renders only the chosen panel's scenes", () => {
        expect(html.match(/data-scene=""/g)).toHaveLength(2)
    })

    it("draws the page's first surface as it is: no stagger until a reader chooses", () => {
        expect(panel).not.toContain("data-sc-entering")
    })
})

/**
 * Only the first surface comes with the page. Drawn on the server and handed
 * to ProductTabs, all six were 197 KB of home's 605 KB of HTML on 12 Oct 2026,
 * though only one was ever on screen; the rest are fetched near the tour.
 */
describe("the tour's later surfaces", () => {
    const read = (file: string) => readFileSync(path.resolve(__dirname, "../..", file), "utf8")
    const staticScene = /^import [^;]*from "[^"]*\/scenes\/(?!types")[^"]+"/m

    it("leaves the page's payload: the page hands over the first scene only", () => {
        expect(read("app/page.tsx")).toContain("<ProductTabs first={firstTourScene()} />")
        const tour = read("components/site/showcase/tour.tsx")
        expect([...tour.matchAll(/from "\.\/scenes\/([^"]+)"/g)].map((m) => m[1])).toEqual(["doc"])
    })

    it("are fetched, never imported, by the tabs", () => {
        expect(read("components/site/ProductTabs.tsx")).not.toMatch(staticScene)
        const later = read("components/site/showcase/tourLater.ts")
        expect(later).not.toMatch(staticScene)
        expect([...later.matchAll(/import\("\.\/scenes\/([^"]+)"\)/g)].map((m) => m[1]).sort()).toEqual(["agents", "board", "calendar", "chat", "palette"])
    })

    it("bring their markup and code later, but their styles with the page", () => {
        // Every stylesheet a later surface reaches by static imports is reached
        // from the page's own static imports too, so none is added to the page
        // when its surface arrives (which would change the cascade's order).
        const resolve = (from: string, spec: string) => {
            const base = spec.startsWith("@/") ? path.resolve(__dirname, "../..", spec.slice(2)) : path.resolve(path.dirname(from), spec)
            for (const ext of ["", ".tsx", ".ts"]) {
                try {
                    readFileSync(base + ext)
                    return base + ext
                } catch {}
            }
            return null
        }
        const styles = (entry: string, seen = new Set<string>()): Set<string> => {
            const found = new Set<string>()
            const walk = (file: string) => {
                if (seen.has(file)) return
                seen.add(file)
                if (file.endsWith(".css")) return void found.add(path.basename(file))
                const src = readFileSync(file, "utf8")
                for (const m of src.matchAll(/^import (?!type )[^;]*?["']([^"']+)["']/gm)) {
                    const spec = m[1]!
                    if (!spec.startsWith(".") && !spec.startsWith("@/")) continue
                    const next = resolve(file, spec)
                    if (next) walk(next)
                }
            }
            walk(entry)
            return found
        }
        const root = path.resolve(__dirname, "../..")
        const page = styles(path.join(root, "app/page.tsx"))
        const later = new Set<string>()
        for (const scene of ["board", "calendar", "agents", "palette", "chat"]) {
            for (const css of styles(path.join(root, `components/site/showcase/scenes/${scene}.tsx`))) later.add(css)
        }
        expect([...later].sort()).toEqual(["board.css", "calendar.css", "palette.css", "record.css"])
        for (const css of later) expect(page.has(css), css).toBe(true)
    })

    it("each bring their own surface's scenes", async () => {
        const want = {
            tasks: [boardDesktop, boardPhone],
            calendar: [calendarDesktop, calendarPhone],
            agents: [agentsDesktop, agentsPhone],
            ask: [paletteDesktop, palettePhone],
            chat: [chatDesktop, chatPhone],
        }
        expect(Object.keys(LATER_SCENES).sort()).toEqual(Object.keys(want).sort())
        for (const [id, [desktop, phone]] of Object.entries(want)) {
            const scene = await LATER_SCENES[id as keyof typeof want]()
            expect(scene.desktop, id).toBe(desktop)
            expect(scene.phone, id).toBe(phone)
        }
    })
})
