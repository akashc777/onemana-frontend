"use client"

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react"

import { SceneClock, endStates } from "./motion/clock"
import type { Mover, PathKey, Typer } from "./motion/engine"

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
 * The script runs on the scene's own clock: time that passes only while at
 * least a third of the scene is on screen and the tab is shown, ticked by
 * animation frames while a play is under way. On that clock it flips data
 * attributes, types words in (motion/engine Typer: a person's keys, or a
 * model's tokens, at a seeded human pace) and moves a pointer or a card along
 * eased paths (Mover). It starts after the browser is idle, plays `plays`
 * times at most, holding the end for `rest` between, and then stays on the
 * end: nothing on the page runs forever (DESIGN.md, Motion). For a reader who
 * asked for less motion it shows the end at once and stops.
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
  /** Typed texts (data-sc-type) that start typing now. */
  type?: string[]
}

export type Script = {
  steps: Step[]
  /** Elements moved along eased waypoints: data-sc-path="id" follows paths[id]. */
  paths?: Record<string, PathKey[]>
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
    const all = (sel: string) => roots.flatMap((r) => Array.from(r.querySelectorAll<HTMLElement>(sel)))
    const items = (keys: string[] = []) => keys.flatMap((k) => all(`[data-sc-item="${k}"]`))
    let stopped = false
    const cleanups: (() => void)[] = []

    // The parts of the scene the browser draws once the page is idle
    // (Later.tsx) are hidden markers until they are drawn: a play waits for
    // them, so everything it moves is in place.
    const ready = () =>
      new Promise<void>((done) => {
        const waiting = () => roots.some((r) => r.querySelector("[data-sc-later]"))
        if (!waiting()) return done()
        const mo = new MutationObserver(() => {
          if (waiting()) return
          mo.disconnect()
          done()
        })
        roots.forEach((r) => mo.observe(r as Node, { childList: true, subtree: true }))
        cleanups.push(() => mo.disconnect())
      })

    // The conversations (a scene may draw one twice: a channel before and
    // after a panel narrows it; each rises by its own arrivals), and every
    // part's state as drawn, for going back to the start between plays: read
    // once the scene is whole.
    let tracks: { track: HTMLElement; list: HTMLElement | null; shift: number }[] = []
    let drawn = new Map<HTMLElement, string | undefined>()
    const whole = () => {
      tracks = Array.from(el.querySelectorAll<HTMLElement>("[data-sc-track]")).map((track) => ({
        track,
        list: track.closest<HTMLElement>("[data-sc-list]"),
        shift: 0,
      }))
      drawn = new Map(all("[data-sc-item]").map((i) => [i, i.dataset.scState] as const))
    }
    // A conversation's top edge fades only where a row is left cut through
    // at the top, as a scrolled chat shows it; with every row whole there is
    // no fade. It is read again whenever the track moves (at once: it snaps).
    const edge = () => {
      for (const { list, track } of tracks) {
        if (!list) continue
        const top = list.getBoundingClientRect().top
        const rows = Array.from(track.querySelectorAll<HTMLElement>(":scope > *:not([data-sc-arrivals]), [data-sc-arrivals] > *"))
        const cut = rows.some((r) => {
          const b = r.getBoundingClientRect()
          return b.top < top - 4 && b.bottom > top + 4
        })
        if (cut) list.dataset.cut = ""
        else delete list.dataset.cut
      }
    }

    // The engine (typing, paths) is fetched when the scene is about to play:
    // the page's first load doesn't carry it.
    let engine: typeof import("./motion/engine") | null = null
    let movers: Mover[] = []
    const load = async () => {
      if (engine) return
      const e = await import("./motion/engine")
      engine = e
      movers = Object.entries(script.paths ?? {}).map(([id, keys]) => new e.Mover(all(`[data-sc-path="${id}"]`), keys, el))
    }
    // Typed texts, made when their typing starts (their words are measured then).
    const typers = new Map<string, Typer[]>()
    const typerFor = (id: string): Typer[] => {
      const e = engine
      if (!e) return []
      let t = typers.get(id)
      if (!t) {
        t = all(`[data-sc-type="${id}"]`).map((r) => new e.Typer(r, el))
        typers.set(id, t)
      }
      return t
    }
    // Every text the script types, and what is typing now and since when (ms into the play).
    const typed = Array.from(new Set(script.steps.flatMap((s) => s.type ?? [])))
    let typing: { since: number; typers: Typer[] }[] = []

    const apply = (s: Step) => {
      for (const id of s.type ?? []) {
        const ts = typerFor(id)
        ts.forEach((t) => t.show(0))
        typing.push({ since: s.at, typers: ts })
      }
      items(s.on).forEach((i) => (i.dataset.scState = "on"))
      items(s.off).forEach((i) => (i.dataset.scState = "off"))
      if (s.rise?.length) {
        const risers = items(s.rise)
        for (const t of tracks) {
          t.shift += risers.filter((i) => t.track.contains(i)).reduce((n, i) => n + room(i), 0)
          t.track.style.setProperty("--sc-shift", `${-t.shift}px`)
        }
        edge()
      }
    }
    const restore = (i: HTMLElement) => {
      const s = drawn.get(i)
      if (s === undefined) delete i.dataset.scState
      else i.dataset.scState = s
    }
    const touched = Array.from(new Set(script.steps.flatMap((s) => s.on ?? [])))
    // Between plays: what the play brought in fades, and what it took away
    // comes back under it (a page a panel replaced, a caret that moved on).
    const reset = () => {
      drawn.forEach((s, i) => {
        if (s !== "off" && i.dataset.scState === "off") restore(i)
      })
      items(touched).forEach((i) => (i.dataset.scState = "fade"))
      for (const t of tracks) {
        t.shift = 0
        t.track.style.setProperty("--sc-shift", "0px")
      }
      edge()
    }
    const settle = () => {
      drawn.forEach((_, i) => restore(i))
      typers.forEach((ts) => ts.forEach((t) => t.release()))
      movers.forEach((m) => {
        m.reset()
        m.render(0)
      })
    }
    const stop = () => {
      stopped = true
      cleanups.forEach((c) => c())
      typers.forEach((ts) => ts.forEach((t) => t.release()))
    }

    if (reducedMotion()) {
      // The end at once, once the scene is whole: the conversations risen,
      // every part in its last state; the texts are whole as drawn, and their
      // carets go to their ends once the engine is here.
      void (async () => {
        await ready()
        if (stopped) return
        whole()
        script.steps.forEach((s) => s.rise && apply({ at: s.at, rise: s.rise }))
        endStates(script.steps).forEach((state, k) => items([k]).forEach((i) => (i.dataset.scState = state)))
        await load()
        if (stopped) return
        typed.forEach((id) => typerFor(id).forEach((t) => t.release()))
        movers.forEach((m) => m.render(m.end))
      })()
      return stop
    }

    // The scene's clock: it runs only while the scene is seen.
    const clock = new SceneClock(() => performance.now())
    const now = () => clock.now()
    let wake: (() => void) | null = null
    const see = (on: boolean) => {
      if (clock.see(on && document.visibilityState === "visible")) wake?.()
    }

    // Waits `ms` of the scene's time (a timer, not frames: nothing moves).
    const wait = (ms: number) =>
      new Promise<void>((done) => {
        const until = now() + ms
        let timer = 0
        const arm = () => {
          window.clearTimeout(timer)
          if (stopped) return
          if (!clock.running) {
            wake = arm
            return
          }
          const left = until - now()
          if (left <= 0) {
            wake = null
            done()
            return
          }
          timer = window.setTimeout(arm, left)
        }
        cleanups.push(() => window.clearTimeout(timer))
        arm()
      })

    // One play: its steps and each typed key on timers, and animation frames
    // only while a path is moving (a pointer, a card in the hand).
    let raf = 0
    let timer = 0
    cleanups.push(() => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
    })
    const play = () =>
      new Promise<void>((done) => {
        typed.forEach((id) => typerFor(id).forEach((t) => t.show(0)))
        movers.forEach((m) => m.reset())
        const start = now()
        let next = 0
        typing = []
        const tick = () => {
          raf = 0
          window.clearTimeout(timer)
          if (stopped) return
          if (!clock.running) {
            wake = () => {
              wake = null
              tick()
            }
            return
          }
          const t = now() - start
          while (next < script.steps.length && script.steps[next].at <= t) apply(script.steps[next++])
          let soon = next < script.steps.length ? script.steps[next].at : Infinity
          for (const k of typing)
            for (const ty of k.typers) {
              ty.render(t - k.since)
              soon = Math.min(soon, k.since + ty.nextAt(t - k.since))
            }
          let moving = false
          for (const m of movers) {
            m.render(t)
            const n = m.next(t)
            if (n.moving) moving = true
            else soon = Math.min(soon, n.at)
          }
          if (moving) raf = requestAnimationFrame(tick)
          else if (soon < Infinity) timer = window.setTimeout(tick, Math.max(0, soon - t))
          else done()
        }
        tick()
      })

    let seen = false
    const io = new IntersectionObserver(
      ([e]) => {
        seen = e.isIntersecting
        see(seen)
      },
      { threshold: 0.35 },
    )
    const onVisibility = () => see(seen)
    cleanups.push(() => {
      io.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    })
    const start = () => {
      io.observe(el)
      document.addEventListener("visibilitychange", onVisibility)
      void (async () => {
        await ready()
        if (stopped) return
        whole()
        await load()
        if (stopped) return
        const plays = Math.max(1, Math.min(script.plays ?? 1, 5))
        for (let n = 0; n < plays && !stopped; n++) {
          await wait(n === 0 ? (script.delay ?? 600) : 900)
          if (stopped) return
          await play()
          if (n === plays - 1 || stopped) break
          await wait(script.rest ?? 6000)
          if (stopped) return
          reset()
          await wait(600)
          if (!stopped) settle()
        }
      })()
    }
    // Safari has no requestIdleCallback: a timer stands in.
    if (typeof window.requestIdleCallback === "function") {
      const idle = window.requestIdleCallback(start, { timeout: IDLE_TIMEOUT })
      cleanups.push(() => window.cancelIdleCallback(idle))
    } else {
      const idle = window.setTimeout(start, IDLE_TIMEOUT)
      cleanups.push(() => window.clearTimeout(idle))
    }
    return stop
  }, [script])

  return (
    <div ref={root} className="absolute inset-0">
      {children}
    </div>
  )
}

/** The height an arrival adds to a conversation: its box and its margins (a row tucked under a message has a negative one). */
function room(el: HTMLElement): number {
  const cs = getComputedStyle(el)
  return el.offsetHeight + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0)
}

function reducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}
