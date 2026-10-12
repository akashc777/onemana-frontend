"use client"

import { startTransition, useEffect, useState, type ReactNode } from "react"

/**
 * A part of a scene that only its story shows, drawn by the browser once the
 * page is idle rather than sent in the page (the hero's channel beside the
 * thread, its pointer, the phone's thread page): the page's HTML and the
 * work of hydrating it stay as they were, and the part is in place, out of
 * sight, long before the story needs it.
 *
 * Until it is drawn it is a hidden marker (data-sc-later), which
 * SceneDirector waits for to go before a play starts. Each part starts out of
 * sight, so the first frame is the same before and after it arrives. It is
 * drawn in a transition, a little at a time, so it never holds up the page.
 */
const PARTS = {
  "hero-split": () => import("./scenes/heroLater").then((m) => <m.HeroSplit />),
  "hero-pointer": () => import("./scenes/heroLater").then((m) => <m.HeroPointer />),
  "hero-phone-thread": () => import("./scenes/heroLater").then((m) => <m.HeroPhoneThread />),
  "hero-row": () => import("./scenes/heroLater").then((m) => <m.HeroRow />),
  "hero-phone-row": () => import("./scenes/heroLater").then((m) => <m.HeroPhoneRow />),
  "hero-agent-typing": () => import("./scenes/heroLater").then((m) => <m.HeroAgentTyping />),
} satisfies Record<string, () => Promise<ReactNode>>

export type LaterPart = keyof typeof PARTS

export function Later({ part }: { part: LaterPart }) {
  const [drawn, setDrawn] = useState<ReactNode>(null)
  useEffect(() => {
    let gone = false
    const draw = () => {
      void PARTS[part]().then(
        (node) => {
          if (!gone) startTransition(() => setDrawn(node))
        },
        () => {},
      )
    }
    // Safari has no requestIdleCallback: a timer stands in.
    if (typeof window.requestIdleCallback === "function") {
      const idle = window.requestIdleCallback(draw, { timeout: 1500 })
      return () => {
        gone = true
        window.cancelIdleCallback(idle)
      }
    }
    const timer = window.setTimeout(draw, 1500)
    return () => {
      gone = true
      window.clearTimeout(timer)
    }
  }, [part])
  return drawn ?? <span hidden data-sc-later={part} />
}
