import type { ReactNode } from "react"

import { hueFor, type CampHue } from "@/lib/campHue"

import { HUE_CLASS, avatarHueClass, cx } from "./hues"
import { Tile } from "./Tile"

export type IdentityMarkVariant = "dot" | "square" | "tile" | "avatar"

export interface IdentityMarkProps {
  /** What the mark stands for, hashed onto a hue: a uuid is best, any stable key works. */
  id?: string | null
  /** A colour the owner picked (a camp hue, a palette name or a hex). It wins over the id. */
  chosen?: string | null
  /** A hue outright, for a fixed category or the showcase. It wins over both. */
  hue?: CampHue
  variant?: IdentityMarkVariant
  /** In px. Defaults: dot 8, square 10, tile 32, avatar 32. */
  size?: number
  /** The name: the avatar's initials, and the tile's letter when it has no icon. */
  label?: string
  /** The tile's glyph, an inline svg drawn in the strong cut. */
  icon?: ReactNode
  /** Gives the mark a name of its own, for one that stands alone. */
  "aria-label"?: string
  className?: string
}

const DEFAULT_SIZE: Record<IdentityMarkVariant, number> = { dot: 8, square: 10, tile: 32, avatar: 32 }

function initials(name: string | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  const first = parts[0][0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : ""
  return (first + last).toUpperCase()
}

/**
 * A thing's colour, as a mark beside its name (the playful layer, "Identity").
 * The workspace has the same component; here the avatar has no photo, because
 * the site draws people only as names.
 *
 *   dot     a channel or calendar in a list
 *   square  a project, beside its name
 *   tile    a tint tile holding an icon, or the name's first letter
 *   avatar  a person: tint, ink initials, a hairline of the strong cut
 *
 *   <IdentityMark id="#engineering" variant="dot" />
 *   <IdentityMark id="Maya Chen" label="Maya Chen" variant="avatar" />
 *
 * Decorative unless given an aria-label: the name beside it already says what
 * it is, and colour never carries meaning alone.
 */
export function IdentityMark({
  id,
  chosen,
  hue,
  variant = "dot",
  size,
  label,
  icon,
  className,
  "aria-label": ariaLabel,
}: IdentityMarkProps) {
  const h = hue ?? hueFor(id, chosen)
  const px = size ?? DEFAULT_SIZE[variant]
  const a11y = ariaLabel ? { role: "img", "aria-label": ariaLabel } : { "aria-hidden": true as const }

  if (variant === "avatar") {
    return (
      <span
        {...a11y}
        data-hue={h}
        style={{ width: px, height: px, fontSize: Math.max(9, Math.round(px * 0.38)) }}
        className={cx(
          avatarHueClass(h),
          "inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium leading-none",
          className,
        )}
      >
        {initials(label)}
      </span>
    )
  }

  if (variant === "tile") {
    const tileSize = px <= 24 ? "sm" : px <= 32 ? "md" : "lg"
    return (
      <Tile hue={h} size={tileSize} className={className} data-hue={h} {...a11y}>
        {icon ?? <span className="text-xs font-semibold text-hue-ink">{initials(label).slice(0, 1)}</span>}
      </Tile>
    )
  }

  // A dot and a square are drawn, not boxed: crisp at any size.
  return (
    <svg
      {...a11y}
      width={px}
      height={px}
      viewBox="0 0 10 10"
      data-hue={h}
      className={cx(HUE_CLASS[h], "shrink-0 fill-hue", className)}
    >
      {variant === "square" ? <rect width="10" height="10" rx="2.5" /> : <circle cx="5" cy="5" r="5" />}
    </svg>
  )
}
