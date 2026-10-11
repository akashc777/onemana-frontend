"use client"

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react"

/**
 * Ambient motion's off switch (site.md G5): a wrapper that sets data-paused
 * while it is off screen or the tab is hidden, and the motion classes
 * (spin-40, spin-60, spin-90r, bob) pause under it. With `drift`, it also
 * hands the pointer's position to the floating chips.
 */
export function Ambient({
  as: Tag = "div",
  children,
  drift = false,
  ...rest
}: HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "span"; children?: ReactNode; "data-soft"?: string; drift?: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let onScreen = true
    const sync = () => setPaused(!onScreen || document.visibilityState === "hidden")
    const io = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting
      sync()
    })
    io?.observe(el)
    document.addEventListener("visibilitychange", sync)
    // The floating chips lean at most 2px towards the pointer (site.md S19):
    // a fine pointer only, never under reduced motion. .drift reads --px/--py.
    const lean = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(2))
      el.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(2))
    }
    const canLean = drift && matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches
    if (canLean) el.addEventListener("pointermove", lean)
    return () => {
      io?.disconnect()
      document.removeEventListener("visibilitychange", sync)
      if (canLean) el.removeEventListener("pointermove", lean)
    }
  }, [drift])

  return (
    <Tag ref={ref as never} data-paused={paused ? "" : undefined} {...rest}>
      {children}
    </Tag>
  )
}
