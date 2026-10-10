"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { hueFor, type CampHue } from "@/lib/campHue"

import { HUE_CLASS, cx } from "./hues"
import { IdentityMark } from "./IdentityMark"

/** A real thing on the hero's orbit: a channel, a person or an agent. */
export interface OrbitThing {
  /** As the app shows it: "#engineering", "Maya Chen", "Release Captain". */
  label: string
  kind: "channel" | "person" | "agent"
  /** Its hue; by default the one the app gives it (hueFor of the label). */
  hue?: CampHue
}

/** Where up to three things sit: in the canvas's top and bottom margins, clear of the shot. */
const PLACES = [
  "left-4 top-3 sm:left-8 sm:top-4",
  "right-4 top-3 sm:right-8 sm:top-4",
  "bottom-3 left-1/2 -translate-x-1/2 sm:bottom-4",
]

const DOT_HUES: CampHue[] = ["sky", "moss", "sun", "dusk", "berry", "lake"]

/**
 * The storefront hero's frame (the playful layer, "Storefront hero"): the
 * product shot on a hued canvas, with the ring and the dotted orbit round it
 * and coloured dots that are real things (channels, people, agents), never an
 * abstract blob.
 *
 * The orbit turns slowly (a turn in 160s), pauses while the hero is off
 * screen, and stands still for prefers-reduced-motion (globals.css,
 * .orbit-turn). Everything but the shot and the labels is decorative.
 *
 *   <HeroOrbit things={[{ label: "#engineering", kind: "channel" }, ...]}>
 *     <HeroShot ... />
 *   </HeroOrbit>
 */
export function HeroOrbit({
  children,
  things = [],
  hue = "sky",
  className,
}: {
  children: ReactNode
  things?: OrbitThing[]
  hue?: CampHue
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-paused={paused ? "" : undefined}
      className={cx(
        HUE_CLASS[hue],
        "relative isolate overflow-hidden rounded-2xl bg-hue-tint px-4 py-12 sm:px-10 sm:py-16",
        className,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          strokeLinecap="round"
          className="orbit-turn absolute left-1/2 top-1/2 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 stroke-hue sm:w-[92%]"
        >
          <circle cx="100" cy="100" r="97" strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.22" />
          <circle cx="100" cy="100" r="66" strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.32" />
          <circle cx="100" cy="100" r="82" strokeWidth="0.6" strokeDasharray="0 3.6" opacity="0.7" />
          {DOT_HUES.map((h, i) => {
            const a = ((-80 + i * 60 + (i % 2 ? 11 : -7)) * Math.PI) / 180
            return (
              <circle
                key={h}
                cx={(100 + 82 * Math.cos(a)).toFixed(1)}
                cy={(100 + 82 * Math.sin(a)).toFixed(1)}
                r={i % 3 === 1 ? 1.8 : 2.4}
                className={cx(HUE_CLASS[h], "fill-hue")}
                stroke="none"
              />
            )
          })}
        </svg>
      </div>

      {things.slice(0, PLACES.length).map((t, i) => (
        <span
          key={t.label}
          className={cx(
            "absolute z-10 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground",
            PLACES[i],
          )}
        >
          {t.kind === "person" ? (
            <IdentityMark variant="avatar" id={t.label} hue={t.hue} label={t.label} size={18} />
          ) : t.kind === "agent" ? (
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-agent" />
          ) : (
            <IdentityMark id={t.label} hue={t.hue ?? hueFor(t.label)} size={8} />
          )}
          {t.label}
          {t.kind === "agent" && <span className="text-agent">Agent</span>}
        </span>
      ))}

      <div className="relative">{children}</div>
    </div>
  )
}
