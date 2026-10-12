import type { LaterTourId } from "./tour"
import type { SceneSpec } from "./scenes/types"

export type ScenePair = { desktop: SceneSpec; phone: SceneSpec }

/**
 * The tour's surfaces after the first, each in a chunk of its own that the
 * browser fetches when the reader nears the tour or reaches for a tab
 * (ProductTabs). Drawn on the server and handed to ProductTabs, all six were
 * 197 KB of home's 605 KB of HTML (12 Oct 2026), though one is on screen.
 * Only dynamic imports here: a static one would put its scene back in the
 * page's first load.
 */
export const LATER_SCENES: Record<LaterTourId, () => Promise<ScenePair>> = {
  tasks: () => import("./scenes/board").then((m) => ({ desktop: m.boardDesktop, phone: m.boardPhone })),
  calendar: () => import("./scenes/calendar").then((m) => ({ desktop: m.calendarDesktop, phone: m.calendarPhone })),
  agents: () => import("./scenes/agents").then((m) => ({ desktop: m.agentsDesktop, phone: m.agentsPhone })),
  ask: () => import("./scenes/palette").then((m) => ({ desktop: m.paletteDesktop, phone: m.palettePhone })),
  chat: () => import("./scenes/chat").then((m) => ({ desktop: m.chatDesktop, phone: m.chatPhone })),
}

/**
 * Runs `run` when the browser is next idle (Safari has no
 * requestIdleCallback: a timer stands in), and returns how to call it off.
 * It only fetches; the tabs never move on their own (landingDiet.test.ts).
 */
export function whenIdle(run: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const idle = window.requestIdleCallback(run, { timeout: 3000 })
    return () => window.cancelIdleCallback(idle)
  }
  const timer = window.setTimeout(run, 1500)
  return () => window.clearTimeout(timer)
}
