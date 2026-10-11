import type { ReactNode } from "react"

import type { Script } from "../SceneDirector"

/**
 * One scene as the page places it (components/site/showcase/Scene): its
 * design size, what it shows in words, its script and its drawing. A
 * surface has a desktop scene and a phone scene; the page shows one.
 */
export type SceneSpec = {
  w: number
  h: number
  /** What a sighted reader takes from it, for a screen reader (role="img"). */
  label: string
  script: Script
  render: () => ReactNode
}

/** The design sizes (CSS px at 1:1). */
export const SIZES = {
  /** The hero's window: the content column at 1184px and wider. */
  hero: { w: 1056, h: 644 },
  /** A product tab's window: the stage's 716px less 32px each side. */
  tour: { w: 652, h: 520 },
  /** Any phone scene. */
  phone: { w: 360, h: 600 },
} as const
