import type { ReactNode } from "react"

// landing-diet: product-mock
import { TourScene } from "./TourScene"
import { docDesktop, docPhone } from "./scenes/doc"

/** The product tabs' surfaces, in the tour's order (ProductTabs TABS). */
export type TourId = "docs" | "tasks" | "calendar" | "agents" | "ask" | "chat"

/** The surfaces after the first, which the browser fetches (tourLater.ts). */
export type LaterTourId = Exclude<TourId, "docs">

/**
 * The tour's first surface, drawn on the server for ProductTabs (a client
 * component): the page's first frame, and the only scene in its payload. The
 * others arrive as the reader nears the tour (tourLater.ts).
 */
export function firstTourScene(): ReactNode {
  return <TourScene desktop={docDesktop} phone={docPhone} />
}
