import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { keyTimes, schedule, streamTimes, typedBy, streamedBy, lastTime } from "@/components/site/showcase/motion/cadence"
import { SceneClock, endStates } from "@/components/site/showcase/motion/clock"
import { pathAt, type PathKey } from "@/components/site/showcase/motion/engine"
import { DECISION, DocScene, docDesktop } from "@/components/site/showcase/scenes/doc"
import { PaletteTour, paletteDesktop } from "@/components/site/showcase/scenes/palette"
import { CalendarTour, calendarDesktop } from "@/components/site/showcase/scenes/calendar"
import { heroDesktop } from "@/components/site/showcase/scenes/hero"
import { ANSWER_TEXT, QUESTION } from "@/components/site/showcase/Palette"

/**
 * THE MOTION PRIMITIVES (owner, 12 Oct 2026: "it should look real"): typing
 * at a person's pace, a remote collaborator's keys, a model's tokens, a hand's
 * path, and the scene's clock. Each is a pure function of its inputs, so the
 * server, the tests and every browser see the same thing at the same moment.
 */

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)]
const gaps = (t: number[]) => t.slice(1).map((v, i) => v - t[i])

describe("typing", () => {
  it("is the same every time for the same words and seed, and its own for another seed", () => {
    expect(keyTimes(DECISION, "maya")).toEqual(keyTimes(DECISION, "maya"))
    expect(keyTimes(DECISION, "maya")).not.toEqual(keyTimes(DECISION, "jonas"))
    expect(streamTimes(ANSWER_TEXT, "ai")).toEqual(streamTimes(ANSWER_TEXT, "ai"))
  })

  it("lands a key at a person's pace: 60 to 180ms in a word, never faster than 48", () => {
    const t = keyTimes(DECISION, "maya", { pace: 92 })
    expect(t[0]).toBe(0)
    expect(t).toHaveLength(DECISION.length)
    const g = gaps(t)
    expect(Math.min(...g)).toBeGreaterThanOrEqual(48)
    const inWord = g.filter((_, i) => /\w/.test(DECISION[i]) && /\w/.test(DECISION[i + 1]))
    expect(median(inWord)).toBeGreaterThanOrEqual(60)
    expect(median(inWord)).toBeLessThanOrEqual(180)
  })

  it("waits longer at a word's end and longer still after punctuation", () => {
    const t = keyTimes(DECISION, "maya", { pace: 92 })
    const g = gaps(t)
    const after = (re: RegExp) => g.filter((_, i) => re.test(DECISION[i]))
    const inWord = median(g.filter((_, i) => /\w/.test(DECISION[i]) && /\w/.test(DECISION[i + 1])))
    expect(median(after(/\s/))).toBeGreaterThan(inWord)
    expect(Math.min(...after(/[,:]/))).toBeGreaterThan(inWord)
  })

  it("reaches another screen a little late, in order, now and then two keys in a frame", () => {
    const local = keyTimes(DECISION, "maya", { pace: 66 })
    const remote = keyTimes(DECISION, "maya", { pace: 66, remote: true })
    remote.forEach((at, i) => expect(at).toBeGreaterThanOrEqual(local[i]))
    expect(gaps(remote).every((d) => d >= 0)).toBe(true)
    expect(gaps(remote).some((d) => d < 17)).toBe(true)
  })

  it("streams a model's answer as tokens: in order, whole at the end, a few letters at a time", () => {
    const chunks = streamTimes(ANSWER_TEXT, "onecamp-ai", { tokenMs: 38 })
    expect(chunks[0].at).toBe(0)
    expect(chunks[chunks.length - 1].end).toBe(ANSWER_TEXT.length)
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i].at).toBeGreaterThan(chunks[i - 1].at)
      expect(chunks[i].end).toBeGreaterThan(chunks[i - 1].end)
      expect(chunks[i].end - chunks[i - 1].end).toBeLessThanOrEqual(24)
    }
    expect(streamedBy(chunks, -1)).toBe(0)
    expect(streamedBy(chunks, lastTime(chunks))).toBe(ANSWER_TEXT.length)
  })

  it("counts what is in at any moment, from nothing to the whole", () => {
    const t = keyTimes(QUESTION, "sam-asks", { pace: 84 })
    expect(typedBy(t, -1)).toBe(0)
    expect(typedBy(t, 0)).toBe(1)
    expect(typedBy(t, lastTime(t))).toBe(QUESTION.length)
    expect(schedule(QUESTION, "local", "sam-asks", 84).map((s) => s.at)).toEqual(t)
  })
})

describe("a hand's path", () => {
  const keys: PathKey[] = [
    { at: 0, x: 0, y: 0 },
    { at: 1000, x: 100, y: 0, ease: "move", arc: 10 },
    { at: 1200, x: 100, y: 50, ease: "drop" },
  ]

  it("starts and ends where it is told, and holds there", () => {
    expect(pathAt(keys, -50)).toEqual({ x: 0, y: 0 })
    expect(pathAt(keys, 1200)).toEqual({ x: 100, y: 50 })
    expect(pathAt(keys, 5000)).toEqual({ x: 100, y: 50 })
  })

  it("gathers speed and settles (minimum jerk), and bows off the straight line at its middle", () => {
    const mid = pathAt(keys, 500)
    expect(mid.x).toBeCloseTo(50, 5)
    expect(Math.abs(mid.y)).toBeCloseTo(10, 5)
    const early = pathAt(keys, 100).x
    const late = pathAt(keys, 900).x
    expect(early).toBeLessThan(10)
    expect(100 - late).toBeCloseTo(early, 5)
  })

  it("drops on dnd-kit's curve: quick, then into place, never past it", () => {
    let last = -1
    for (let t = 1000; t <= 1200; t += 10) {
      const y = pathAt(keys, t).y
      expect(y).toBeGreaterThanOrEqual(last)
      expect(y).toBeLessThanOrEqual(50)
      last = y
    }
    expect(pathAt(keys, 1100).y).toBeGreaterThan(40)
  })
})

describe("the scene's clock", () => {
  it("stops while the scene is off screen or its tab hidden, and goes on from there", () => {
    let page = 0
    const clock = new SceneClock(() => page)
    expect(clock.now()).toBe(0)
    expect(clock.see(true)).toBe(true)
    page = 400
    expect(clock.now()).toBe(400)
    clock.see(false)
    page = 9000
    expect(clock.now()).toBe(400)
    expect(clock.see(true)).toBe(true)
    page = 9100
    expect(clock.now()).toBe(500)
    expect(clock.see(true)).toBe(false)
  })

  it("for a reader who asked for less motion, gives every part its last state at once", () => {
    const end = endStates(docDesktop.script.steps)
    expect(end.get("doc-line")).toBe("on")
    expect(end.get("doc-c0")).toBe("off")
    expect(end.get("doc-flag")).toBe("off")
    expect(end.get("doc-dot")).toBe("on")
    const hero = endStates(heroDesktop.script.steps)
    expect(hero.get("hero-split")).toBe("on")
    expect(hero.get("hero-wide")).toBe("off")
    expect(hero.get("typing-agent")).toBe("off")
    const ask = endStates(paletteDesktop.script.steps)
    expect(ask.get("pal-la")).toBe("on")
    expect(ask.get("pal-src")).toBe("on")
    expect(ask.get("pal-caret")).toBe("off")
  })
})

describe("the stills: each scene's end, drawn without its motion", () => {
  it("the doc: the decision whole, Maya's caret resting after it, folded to its dot", () => {
    const html = renderToString(<DocScene final />)
    expect(html).toContain(DECISION)
    expect(html).toMatch(/data-sc-item="doc-cend"/)
    expect(html).not.toMatch(/data-sc-caret=/)
  })

  it("Ask: the question asked and answered, with its sources", () => {
    const html = renderToString(<PaletteTour at="end" />)
    expect(html).toMatch(/data-sc-item="pal-ask" data-sc-state="on"/)
    expect(html).toMatch(/data-sc-item="pal-la"(?! data-sc-state="off")/)
    expect(html).toContain("Answered from what you can open")
  })

  it("the calendar: the kickoff in the week, no pointer and no card", () => {
    const html = renderToString(<CalendarTour final now={new Date("2026-10-12T09:00:00Z")} />)
    expect(html).toMatch(/data-sc-item="cal-event"(?! data-sc-state="off")/)
    expect(html).not.toMatch(/sc-ptr/)
  })

  it("the hero's channel beside the thread draws only what is in view (its first two messages are above its top)", () => {
    const html = renderToString(<>{heroDesktop.render()}</>)
    expect(html.match(/Release candidate for the Q4/g) ?? []).toHaveLength(1)
    expect(html).toMatch(/data-sc-item="hero-split" data-sc-state="off"/)
  })

  it("the scenes that start out of sight draw their story's start, so a reader without JavaScript sees a whole picture", () => {
    const doc = renderToString(<>{docDesktop.render()}</>)
    expect(doc).toMatch(/data-sc-item="doc-line" data-sc-state="off"/)
    const cal = renderToString(<>{calendarDesktop.render()}</>)
    expect(cal).toMatch(/data-sc-item="cal-event" data-sc-state="off"/)
  })
})
