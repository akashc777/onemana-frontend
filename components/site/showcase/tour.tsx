import type { ReactNode } from "react"

// landing-diet: product-mock
import { TourScene } from "./TourScene"
import { agentsDesktop, agentsPhone } from "./scenes/agents"
import { boardDesktop, boardPhone } from "./scenes/board"
import { calendarDesktop, calendarPhone } from "./scenes/calendar"
import { chatDesktop, chatPhone } from "./scenes/chat"
import { docDesktop, docPhone } from "./scenes/doc"
import { paletteDesktop, palettePhone } from "./scenes/palette"

/** The product tabs' surfaces, in the tour's order (ProductTabs TABS). */
export type TourId = "docs" | "tasks" | "calendar" | "agents" | "ask" | "chat"

/**
 * Every surface's scene, drawn on the server for ProductTabs (a client
 * component), which places only the chosen one in the page.
 */
export function tourScenes(): Record<TourId, ReactNode> {
  return {
    docs: <TourScene desktop={docDesktop} phone={docPhone} />,
    tasks: <TourScene desktop={boardDesktop} phone={boardPhone} />,
    calendar: <TourScene desktop={calendarDesktop} phone={calendarPhone} />,
    agents: <TourScene desktop={agentsDesktop} phone={agentsPhone} />,
    ask: <TourScene desktop={paletteDesktop} phone={palettePhone} />,
    chat: <TourScene desktop={chatDesktop} phone={chatPhone} />,
  }
}
