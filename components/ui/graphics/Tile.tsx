import type { HTMLAttributes, ReactNode } from "react"

import type { CampHue } from "@/lib/campHue"

import { cx, hueOrAgent } from "./hues"

/**
 * THE ICON TILE: one shape at four sizes (site.md S8, DESIGN_V3 §3.5 "tile
 * for a feature or step"), each with its own radius and icon so a tile is
 * the same object at every size: 28 at r8 holding a 16px icon, 32 at r9 with
 * 18, 36 at r10 with 20 and 44 at r12 with 24. Call sites pick a size and
 * never set their own (app/tileSizes.test.ts): before, a 28px tile at r12
 * read as a pill on one page and a squircle on the next.
 */
export const TILE_SIZES = {
  sm: "size-7 rounded-md [&>svg]:size-4",
  md: "size-8 rounded-[9px] [&>svg]:size-[18px]",
  lg: "size-9 rounded-ctl [&>svg]:size-5",
  xl: "size-11 rounded-xl [&>svg]:size-6",
} as const

export type TileSize = keyof typeof TILE_SIZES

export interface TileProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * A camp hue, the agent's indigo (agents are indigo, never dusk), the brand
   * for the product itself, or neutral ink for what names no area (v3.1),
   * which draws a hairline round its sunken ground so it holds its shape.
   */
  hue: CampHue | "agent" | "brand" | "ink"
  size?: TileSize
  /**
   * The ground: the hue's tint (the default), or the raised surface at e1
   * for a tile that stands on its own hue's tint already (an area panel's
   * stage), where a tint on the same tint would vanish.
   */
  surface?: "tint" | "raised"
  children?: ReactNode
}

/**
 * A hued tint tile holding an icon (the playful layer, "Tiles"): the icon
 * draws in the strong cut through currentColor, which holds 3:1 on its own
 * tint; a letter takes the ink, because text needs 4.5:1. Decorative by
 * default, since a tile sits beside the words it illustrates.
 *
 *   <Tile hue="moss"><Icon name="check" /></Tile>
 */
export function Tile({ hue, size = "md", surface = "tint", className, children, ...rest }: TileProps) {
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={cx(
        hueOrAgent(hue),
        "inline-flex shrink-0 items-center justify-center",
        surface === "raised" ? "bg-card shadow-e1" : "bg-hue-tint",
        "text-hue",
        hue === "ink" && surface === "tint" && "ring-1 ring-inset ring-line-2",
        TILE_SIZES[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
