import { useId, type ReactNode } from "react"

import { APP } from "@/lib/appSystem"
import { CAMP_HUES } from "@/lib/campHue"

import { HUE_CLASS } from "./hues"

/**
 * The storefront's drawn marks for design v3 (design/v3-areas/site.md):
 * the camp canvas's rings, the close's orbit, the footer's ring and the
 * hero's sun stroke. Like the other motifs here they keep their own line
 * weights (they are drawings, not icons) and are decorative.
 */

/**
 * A layer of dots that turns (G5's ambient motion). The turning element is
 * an HTML box, not an SVG group: a box's transform runs on the compositor,
 * where an SVG group's repaints its whole drawing on the main thread every
 * frame, which cost about 0.7s of blocking time on a throttled phone.
 */
function Turning({ spin, size, children }: { spin?: "spin-40" | "spin-60" | "spin-90r"; size: number; children: ReactNode }) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 ${spin ?? ""}`}>
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full" fill="none">
        {children}
      </svg>
    </div>
  )
}

/** The canvas's rings and hue dots (G6): four rings round a point off the top right, the innermost in the logo gradient. */
export function CanvasRings({ still = false, dots = true }: { still?: boolean; dots?: boolean }) {
  const id = `cr${useId().replace(/:/g, "")}`
  const [a, b] = APP.logoGradient
  const at = (r: number, t: number) => ({ cx: 600 - r * Math.cos(t), cy: 600 + r * Math.sin(t) })
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -right-[420px] -top-[560px] -z-10 h-[1200px] w-[1200px] max-sm:-right-[520px] max-sm:-top-[640px]">
      <svg viewBox="0 0 1200 1200" className="size-full" fill="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
        </defs>
        <g className="stroke-white/75 dark:stroke-white/[0.07]" strokeWidth="1.5">
          <circle cx="600" cy="600" r="310" strokeDasharray="2 8" />
          <circle cx="600" cy="600" r="420" />
          <circle cx="600" cy="600" r="560" strokeDasharray="2 8" />
        </g>
        <circle cx="600" cy="600" r="200" stroke={`url(#${id})`} strokeWidth="3" opacity="0.55" />
      </svg>
      {dots && (
        <Turning spin={still ? undefined : "spin-60"} size={1200}>
          <circle {...at(420, 0.5)} r="6" className="fill-camp-sun" />
          <circle {...at(310, 1.15)} r="5" className="fill-camp-berry" />
        </Turning>
      )}
      {dots && !still && (
        <Turning spin="spin-90r" size={1200}>
          <circle {...at(560, 1.25)} r="5" className="fill-camp-lake" />
          <circle {...at(560, 0.12)} r="6" className="fill-camp-sky" />
        </Turning>
      )}
    </div>
  )
}

/** The close spot's orbit (H11): two rings, one dashed, and the six hues turning at 122px. */
export function CloseOrbit() {
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 280 280" width="280" height="280" fill="none" className="absolute inset-0">
        <circle cx="140" cy="140" r="122" className="stroke-camp-sky/45" strokeWidth="1.5" />
        <circle cx="140" cy="140" r="92" className="stroke-camp-sky/60" strokeWidth="1.5" strokeDasharray="2 6" />
      </svg>
      <Turning spin="spin-40" size={280}>
        {CAMP_HUES.map((hue, i) => {
          const t = (-100 + i * 60 + (i % 2 ? 9 : -6)) * (Math.PI / 180)
          return <circle key={hue} cx={140 + 122 * Math.cos(t)} cy={140 + 122 * Math.sin(t)} r={i % 2 ? 3.5 : 4.5} className={`${HUE_CLASS[hue]} fill-hue`} />
        })}
      </Turning>
    </div>
  )
}

/** /pricing's art (site.md P1): the three plans as dots (moss, sun, sky) orbiting a 96px gradient ring, at 40s. */
export function PlanOrbit() {
  const id = `po${useId().replace(/:/g, "")}`
  const [a, b] = APP.logoGradient
  return (
    <div aria-hidden="true" className="relative size-60">
      <svg viewBox="0 0 240 240" width="240" height="240" fill="none" className="absolute inset-0">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
        </defs>
        <circle cx="120" cy="120" r="104" className="stroke-line-3" strokeWidth="1.5" strokeDasharray="2 7" />
        <circle cx="120" cy="120" r="76" className="stroke-line-2" strokeWidth="1.5" />
        <circle cx="120" cy="120" r="36" stroke={`url(#${id})`} strokeWidth="14" />
      </svg>
      <Turning spin="spin-40" size={240}>
        <circle cx="120" cy="16" r="9" className="hue-moss fill-hue" />
        <circle cx={120 + 76 * Math.cos(0.5)} cy={120 + 76 * Math.sin(0.5)} r="10" className="hue-sun fill-hue" />
        <circle cx={120 - 104 * Math.cos(0.9)} cy={120 + 104 * Math.sin(0.9)} r="8" className="hue-sky fill-hue" />
      </Turning>
    </div>
  )
}

/** /compare's art (site.md C1): two overlapping rings, OneCamp's in the logo gradient and a grey one, the overlap in sun. */
export function OverlapRings() {
  const id = `or${useId().replace(/:/g, "")}`
  const [a, b] = APP.logoGradient
  return (
    <svg aria-hidden="true" viewBox="0 0 260 200" width="260" height="200" fill="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <path d="M130 52a60 60 0 0 1 0 96a60 60 0 0 1 0-96z" className="fill-camp-sun/25" />
      <circle cx="166" cy="100" r="60" className="stroke-ink-4" strokeWidth="12" />
      <circle cx="94" cy="100" r="60" stroke={`url(#${id})`} strokeWidth="12" />
    </svg>
  )
}

/** /templates' art (site.md T1): three tilted cards in template hues, stacked. */
export function StackedCards() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 200" width="240" height="200" fill="none">
      <g transform="rotate(-10 120 100)">
        <rect x="58" y="44" width="124" height="96" rx="14" className="hue-dusk fill-hue-tint stroke-hue" strokeWidth="1.5" />
      </g>
      <g transform="rotate(6 120 100)">
        <rect x="58" y="52" width="124" height="96" rx="14" className="hue-sky fill-hue-tint stroke-hue" strokeWidth="1.5" />
      </g>
      <rect x="58" y="60" width="124" height="96" rx="14" className="fill-card stroke-line-3" strokeWidth="1.5" />
      <rect x="74" y="76" width="22" height="22" rx="6" className="hue-moss fill-hue" />
      <rect x="74" y="112" width="92" height="6" rx="3" className="hue-moss fill-hue" />
      <rect x="74" y="124" width="62" height="6" rx="3" className="hue-moss fill-hue opacity-60" />
      <rect x="74" y="136" width="36" height="6" rx="3" className="hue-moss fill-hue opacity-30" />
    </svg>
  )
}

/** The footer's corner ring (S16), at 10% ink, cropped by the page's edge. */
export function FooterRing() {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 160" className="pointer-events-none absolute -bottom-10 -right-10 hidden h-40 w-40 text-foreground/10 sm:block" fill="none" stroke="currentColor">
      <circle cx="80" cy="80" r="40" strokeWidth="14" />
      <circle cx="80" cy="80" r="62" strokeWidth="1.5" />
      <circle cx="80" cy="80" r="76" strokeWidth="1.5" strokeDasharray="2 6" />
    </svg>
  )
}

/** The hero's hand-drawn sun stroke under "own." (H1): 5px, round caps, drawn once on load. */
export function SunStroke() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 14" preserveAspectRatio="none" className="absolute -bottom-[10px] left-[-2%] h-[12px] w-[104%] overflow-visible" fill="none">
      <path d="M3 9.5C30 4.5 72 3.5 117 7.5" pathLength="240" className="in-draw at-380 stroke-camp-sun" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}
