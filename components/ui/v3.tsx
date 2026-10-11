import { useId, type ReactNode } from "react"

import { APP } from "@/lib/appSystem"
import type { CampHue } from "@/lib/campHue"
import { HUE_CLASS, cx } from "@/components/ui/graphics/hues"
import { SPARK_PATH } from "@/components/ui/graphics/motifs"
import { Ambient } from "@/components/ui/Ambient"
import { CanvasRings } from "@/components/ui/graphics/v3marks"

/**
 * The storefront's v3 parts (design/v3-areas/site.md): the gradient ring,
 * the identity dot, the arrow that moves on hover, the floating chip and the
 * camp canvas. Server components; the only browser part is Ambient, which
 * pauses the canvas's orbit off screen.
 */

/** The logo's ring in the campfire gradient (S1), at any size. Decorative. */
export function LogoRing({ size = 24, stroke = 4, className }: { size?: number; stroke?: number; className?: string }) {
  const id = `ring${useId().replace(/:/g, "")}`
  const [a, b] = APP.logoGradient
  const r = 12 - stroke / 2 - 2
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r={r} stroke={`url(#${id})`} strokeWidth={stroke} />
    </svg>
  )
}

/** Identity as a dot (G7, S8): 7 or 8px in the hue's strong cut. */
export function Dot({ hue, size = 8, className }: { hue: CampHue | "brand" | "agent" | "ink"; size?: 6 | 7 | 8; className?: string }) {
  const fill = hue === "brand" ? "bg-brand" : hue === "agent" ? "bg-agent" : hue === "ink" ? "bg-ink-4" : cx(HUE_CLASS[hue], "bg-hue")
  return <span aria-hidden="true" className={cx("inline-block shrink-0 rounded-full", size === 6 ? "size-1.5" : size === 7 ? "size-[7px]" : "size-2", fill, className)} />
}

/** The 16px arrow on a primary marketing CTA and a standalone link; it moves 2px on hover (.go-arrow). */
export function Arrow({ size = 16 }: { size?: 14 | 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="go-arrow shrink-0">
      <path d="M3.5 8h9M8.5 4l4 4-4 4" />
    </svg>
  )
}

/** The brand spark, one per composition. */
export function SparkMark({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cx("fill-brand", className)}>
      <path d={SPARK_PATH} />
    </svg>
  )
}

/** The agent's mark: an indigo square with the spark (G7: agents are indigo, never dusk). */
export function AgentSquare({ size = 28, dim = false }: { size?: number; dim?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, backgroundImage: "linear-gradient(140deg, rgb(var(--agent-a1)), rgb(var(--agent-a2)))" }}
      className={cx("inline-flex shrink-0 items-center justify-center rounded-[32%] text-white transition-opacity", dim && "opacity-60")}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="currentColor">
        <path d={SPARK_PATH} />
      </svg>
    </span>
  )
}

/** A person drawn on the site: initials on their avatar gradient (the a1/a2 cut). */
export function Face({ initials, hue, size = 28 }: { initials: string; hue: CampHue; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38), backgroundImage: `linear-gradient(140deg, rgb(var(--camp-${hue}-a1)), rgb(var(--camp-${hue}-a2)))` }}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
    >
      {initials}
    </span>
  )
}

/**
 * A floating chip (S19): the pop surface at e3, r12, a 28px mark, a title,
 * an optional tag and a quiet second line. At most two per composition, and
 * each names a real thing in the picture. It springs in on load (in-chip).
 */
export function FloatChip({
  mark,
  title,
  tag,
  line,
  className,
  lineClassName,
}: {
  mark: ReactNode
  title: string
  tag?: string
  line?: string
  className?: string
  lineClassName?: string
}) {
  return (
    <span className={cx("inline-flex items-center gap-2.5 rounded-xl bg-pop py-2 pl-2 pr-3 text-left shadow-e3", className)}>
      {mark}
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-caption text-foreground">
          <span className="font-[590]">{title}</span>
          {tag && <span className="rounded-[5px] bg-agent-muted px-1.5 text-[11px] font-[510] leading-[18px] text-agent-ink">{tag}</span>}
        </span>
        {line && <span className={cx("block text-[12px] leading-4 text-faint", lineClassName)}>{line}</span>}
      </span>
    </span>
  )
}

/**
 * THE CAMP CANVAS (DESIGN_V3 §3.15, site.md G6): the paper with its ember
 * glow, dusk and lake light, white rings and four hue dots, and 2% grain.
 * One per page. The orbit pauses off screen and stands still for reduced
 * motion; on a phone it does not turn at all (G5, under 160px of travel).
 */
export function CampCanvas({
  children,
  className,
  soft = false,
  rings = true,
  drift = false,
  as: Tag = "div",
}: {
  children?: ReactNode
  className?: string
  /** The account page's ground: the glow at 16%, no window. */
  soft?: boolean
  /** The rings and their hue dots; "plain" keeps the rings without dots, for a canvas whose text runs under them. */
  rings?: boolean | "plain"
  /** Let the floating chips lean towards the pointer. */
  drift?: boolean
  as?: "div" | "section"
}) {
  return (
    <Ambient as={Tag} drift={drift} className={cx("camp-canvas", className)} data-soft={soft ? "" : undefined}>
      <span aria-hidden="true" className="camp-grain" />
      {rings && (
        <>
          <span className="hidden sm:contents">
            <CanvasRings dots={rings !== "plain"} />
          </span>
          <span className="contents sm:hidden">
            <CanvasRings still dots={rings !== "plain"} />
          </span>
        </>
      )}
      {children}
    </Ambient>
  )
}
