import type { ReactNode } from "react"

import type { Cadence } from "./cadence"

/**
 * Text a scene types in (motion/engine Typer): drawn whole, so the picture
 * before and after the motion, a reader without JavaScript and a reader who
 * asked for less motion all see the words; while it plays, what isn't typed
 * yet is painted transparent where it will be, so nothing moves.
 *
 * `cadence` is who is typing: "local", the reader at their own keyboard;
 * "remote", a collaborator on another screen (each key a moment late, two now
 * and then in one frame); "stream", a model's tokens. `pace` is the middle
 * of the gap between keys (or tokens), in ms; `seed` makes the timing its own
 * and the same on every screen.
 */
export function TypedText({
  id,
  cadence,
  seed,
  pace,
  mark,
  children,
}: {
  id: string
  cadence: Cadence
  seed?: string
  pace?: number
  /** What the app underlines as understood once it is typed: [from, to, how many of it first]. */
  mark?: [number, number, number]
  children: ReactNode
}) {
  return (
    <span data-sc-type={id} data-sc-cadence={cadence} data-sc-seed={seed ?? id} data-sc-pace={pace} data-sc-mark={mark?.join(":")}>
      {children}
    </span>
  )
}

/** A scene item's attributes (SceneDirector): its name and its state in this picture. */
export function scItem(id: string | undefined, state?: "on" | "off") {
  return { "data-sc-item": id, "data-sc-state": state }
}
