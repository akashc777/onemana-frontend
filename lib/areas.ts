/**
 * The parts of OneCamp, and the colour each one wears (design v3.1, 18 Oct
 * 2026: "a calm frame, coloured areas").
 *
 * Colour names an area. Each part of the product keeps one camp hue
 * wherever it appears: its tab in the product tour, its tile, the stage
 * behind it, the dot beside its name. Seen twice, a hue is learned, so a
 * buyer reads "dusk" as docs before they read the word. Anything that is not
 * an area (installing, updating, backups, security, money, the law) is
 * neutral ink, and the brand's orange is spent only on what you press: the
 * primary button, links, focus and the page you are on.
 *
 * The six camp hues go one to an area, and agents keep the agent's indigo
 * (agents are indigo, never dusk). Plans keep their own dots (free moss,
 * licence sun, cloud sky; components/site/planHues.ts), but only where money
 * is the subject.
 *
 * The same file lives in the workspace (onecamp-fe lib/areas.ts), which
 * names its palette's groups, its Home guide's tiles and its empty states
 * with it, so a part of OneCamp is one colour on the site and in the app.
 * It imports nothing but lib/campHue's type, which both repos share. Change
 * both or neither; lib/areas.test.ts pins the table.
 */

import type { CampHue } from "./campHue"

/** The areas, in the order they are listed: the conversation first, then the work, then the agents. */
export const AREAS = ["chat", "calls", "docs", "projects", "calendar", "tables", "agents"] as const

export type Area = (typeof AREAS)[number]

/** A camp hue, or the agent's indigo for the agents. */
export type AreaHue = CampHue | "agent"

/**
 * Each area's name and hue. `covers` says what belongs to it, so a new
 * feature knows its colour: a feature takes the hue of the area it lives in.
 */
export const AREA: Record<Area, { label: string; hue: AreaHue; covers: string }> = {
  chat: { label: "Chat", hue: "sky", covers: "channels, direct messages, threads, guests, polls, check-ins, the Slack bridge" },
  calls: { label: "Calls", hue: "berry", covers: "calls, huddles, voice, video and screen clips, recordings" },
  docs: { label: "Docs", hue: "dusk", covers: "docs, the page tree, comments, versions, imports" },
  projects: { label: "Projects", hue: "moss", covers: "tasks, boards, lists, timelines, cycles, goals, reports, forms, time" },
  calendar: { label: "Calendar", hue: "sun", covers: "events, booking pages, focus time, Google Calendar" },
  tables: { label: "Tables", hue: "lake", covers: "tables, formulas, linked rows and rollups" },
  agents: { label: "Agents", hue: "agent", covers: "agents, OneCamp AI's answers, the record of what they did" },
}

/** The hue an area wears. */
export function areaHue(area: Area): AreaHue {
  return AREA[area].hue
}

export function isArea(value: unknown): value is Area {
  return typeof value === "string" && (AREAS as readonly string[]).includes(value)
}
