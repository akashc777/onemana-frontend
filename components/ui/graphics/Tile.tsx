import type { HTMLAttributes, ReactNode } from "react"

import type { CampHue } from "@/lib/campHue"

import { HUE_CLASS, cx } from "./hues"

/**
 * Three sizes on the 4-pt scale. 32 and 40 take the card radius (10); at 24 a
 * 10px corner would read as a circle, so the small tile takes the control
 * radius (6).
 */
const SIZES = {
  sm: "size-6 rounded-md [&>svg]:size-3.5",
  md: "size-8 rounded-lg [&>svg]:size-4",
  lg: "size-10 rounded-lg [&>svg]:size-5",
} as const

export type TileSize = keyof typeof SIZES

export interface TileProps extends HTMLAttributes<HTMLSpanElement> {
  hue: CampHue
  size?: TileSize
  children?: ReactNode
}

/**
 * A hued tint tile holding an icon (the playful layer, "Tiles"): the icon
 * draws in the strong cut through currentColor, which holds 3:1 on its own
 * tint; a letter takes the ink, because text needs 4.5:1. Decorative by
 * default, since a tile sits beside the words it illustrates.
 *
 *   <Tile hue="moss"><svg>...</svg></Tile>
 */
export function Tile({ hue, size = "md", className, children, ...rest }: TileProps) {
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={cx(
        HUE_CLASS[hue],
        "inline-flex shrink-0 items-center justify-center bg-hue-tint text-hue",
        SIZES[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
