"use client"

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react"

/**
 * Plays a scene's script (components/site/showcase/Scene).
 *
 * A scene is drawn complete on the server: its own content is never hidden,
 * so a crawler, a link preview, a print and a reader without JavaScript see a
 * finished picture. What a script adds (a message arriving, a refusal on the
 * record) waits in the markup at data-sc-state="off", laid out from the
 * start, and the script turns it on: transform and opacity only, never a
 * layout, so the page cannot shift.
 *
 * It starts after the browser is idle, plays only while at least a third of
 * the scene is on screen and the tab is visible, and pauses otherwise. It
 * plays `plays` times at most, holding the end for `rest` between, and then
 * stays on the end: nothing on the page runs forever (DESIGN.md, Motion).
 * For a reader who asked for less motion it shows the end at once and stops.
 */
export type Step = {
  /** When, in ms from the start of a play. */
  at: number
  /** Items (data-sc-item) to bring in. */
  on?: string[]
  /** Items to take out. */
  off?: string[]
  /** Arrivals whose height the conversation rises by (data-sc-track). */
  rise?: string[]
}

export type Script = {
  steps: Step[]
  /** How long the end holds before the scene plays again. */
  rest?: number
  /** How many times it plays at most (it then stays on the end). */
  plays?: number
  /** A beat after it first comes into view, before the first play. */
  delay?: number
  /** On a scene a reader just chose (a product tab): its [data-sc-enter] parts arrive this far apart. */
  stagger?: number
  /**
   * Parts of the scene drawn outside its window (an annotation hanging off
   * its edge) sit in a [data-sc-scope] box with this name, and play with it.
   */
  scope?: string
}

const IDLE_TIMEOUT = 1500

export function SceneDirector({ script, children }: { script: Script; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)

  // A scene a reader just chose arrives in a stagger: hidden before the first
  // paint, then each part in turn. Never on the page's first paint (the
  // server's picture stays as drawn).
  useLayoutEffect(() => {
    const el = root.current
    if (!el || !el.closest("[data-sc-entering]") || reducedMotion()) return
    const parts = Array.from(el.querySelectorAll<HTMLElement>("[data-sc-enter]"))
    parts.forEach((p, i) => {
      p.style.setProperty("--sc-delay", `${Math.min(i * (script.stagger ?? 40), 480)}ms`)
      p.dataset.scState = "off"
    })
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => parts.forEach((p) => (p.dataset.scState = "on"))))
    return () => cancelAnimationFrame(raf)
  }, [script.stagger])

  // The scale is CSS (showcase.css .sc-stage); a browser without
  // trigonometric functions gets the same number from here.
  useEffect(() => {
    const fit = root.current?.closest<HTMLElement>("[data-scene]")
    const stage = root.current?.querySelector<HTMLElement>(".sc-stage")
    if (!fit || !stage || typeof ResizeObserver === "undefined" || CSS.supports?.("transform", "scale(tan(atan2(1px, 1px)))")) return
    const w = parseFloat(getComputedStyle(fit).getPropertyValue("--sc-w"))
    if (!w) return
    const ro = new ResizeObserver(() => stage.style.setProperty("--sc-k", String(fit.clientWidth / w)))
    ro.observe(fit)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const roots: ParentNode[] = [el, ...(script.scope ? Array.from(document.querySelectorAll(`[data-sc-scope="${script.scope}"]`)) : [])]
    const items = (keys: string[] = []) => keys.flatMap((k) => roots.flatMap((r) => Array.from(r.querySelectorAll<HTMLElement>(`[data-sc-item="${k}"]`))))
    const track = el.querySelector<HTMLElement>("[data-sc-track]")
    const list = track?.closest<HTMLElement>("[data-sc-list]")
    let shift = 0
    let still = 0
    // The conversation's top edge fades while it moves. At rest it stays only
    // if a row is left cut through at the top, as a scrolled chat shows it;
    // with every row whole there is no fade.
    const cut = () => {
      if (!list || !track) return false
      const top = list.getBoundingClientRect().top
      const rows = Array.from(track.querySelectorAll<HTMLElement>(":scope > *:not([data-sc-arrivals]), [data-sc-arrivals] > *"))
      return rows.some((r) => {
        const b = r.getBoundingClientRect()
        return b.top < top - 4 && b.bottom > top + 4
      })
    }
    const moving = () => {
      if (!list) return
      list.dataset.moving = ""
      window.clearTimeout(still)
      still = window.setTimeout(() => {
        if (!cut()) delete list.dataset.moving
      }, 900)
    }
    const apply = (s: Step) => {
      items(s.on).forEach((i) => (i.dataset.scState = "on"))
      items(s.off).forEach((i) => (i.dataset.scState = "off"))
      if (s.rise?.length && track) {
        shift += items(s.rise).reduce((n, i) => n + i.offsetHeight, 0)
        track.style.setProperty("--sc-shift", `${-shift}px`)
        moving()
      }
    }
    const touched = Array.from(new Set(script.steps.flatMap((s) => s.on ?? [])))
    const reset = () => {
      items(touched).forEach((i) => (i.dataset.scState = "fade"))
      shift = 0
      track?.style.setProperty("--sc-shift", "0px")
      moving()
    }
    const settle = () => items(touched).forEach((i) => (i.dataset.scState = "off"))

    if (reducedMotion()) {
      script.steps.forEach(apply)
      return
    }

    // Time that only passes while the scene is on screen and the tab is shown.
    let visible = false
    let stopped = false
    let pending: { left: number; done: () => void; started: number; timer?: number } | null = null
    const arm = () => {
      if (!pending || !visible || pending.timer !== undefined) return
      pending.started = performance.now()
      pending.timer = window.setTimeout(() => {
        const p = pending
        pending = null
        p?.done()
      }, pending.left)
    }
    const hold = () => {
      if (!pending || pending.timer === undefined) return
      window.clearTimeout(pending.timer)
      pending.left = Math.max(0, pending.left - (performance.now() - pending.started))
      pending.timer = undefined
    }
    const wait = (ms: number) =>
      new Promise<void>((done) => {
        pending = { left: ms, done, started: 0 }
        arm()
      })
    const see = (on: boolean) => {
      visible = on && document.visibilityState === "visible"
      if (visible) arm()
      else hold()
    }

    const io = new IntersectionObserver(([e]) => see(e.isIntersecting), { threshold: 0.35 })
    const onVisibility = () => see(visible || isOnScreen(el))
    let idle = 0
    const start = () => {
      io.observe(el)
      document.addEventListener("visibilitychange", onVisibility)
      void (async () => {
        const plays = Math.max(1, Math.min(script.plays ?? 1, 5))
        for (let play = 0; play < plays && !stopped; play++) {
          await wait(play === 0 ? (script.delay ?? 600) : 900)
          let t = 0
          for (const s of script.steps) {
            if (stopped) return
            await wait(Math.max(0, s.at - t))
            t = s.at
            if (!stopped) apply(s)
          }
          if (play === plays - 1 || stopped) break
          await wait(script.rest ?? 6000)
          if (stopped) return
          reset()
          await wait(600)
          if (!stopped) settle()
        }
      })()
    }
    // Safari has no requestIdleCallback: a timer stands in.
    const hasIdle = typeof window.requestIdleCallback === "function"
    idle = hasIdle ? window.requestIdleCallback(start, { timeout: IDLE_TIMEOUT }) : window.setTimeout(start, IDLE_TIMEOUT)

    return () => {
      stopped = true
      window.clearTimeout(still)
      if (pending?.timer !== undefined) window.clearTimeout(pending.timer)
      if (hasIdle) window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [script])

  return (
    <div ref={root} className="absolute inset-0">
      {children}
    </div>
  )
}

function reducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

function isOnScreen(el: Element): boolean {
  const r = el.getBoundingClientRect()
  return r.bottom > 0 && r.top < window.innerHeight
}
