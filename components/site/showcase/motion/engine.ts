import { schedule, type Cadence } from "./cadence"

/**
 * THE MOTION ENGINE's moving parts, driven by SceneDirector's clock (time
 * that only passes while the scene is on screen and the tab is shown), one
 * animation frame at a time. Nothing here re-lays anything out:
 *
 *   - a typed text is laid out whole from the start, and what is not typed
 *     yet is painted transparent through the CSS Custom Highlight API
 *     (::highlight(sc-unshown), showcase.css), so no glyph moves while it
 *     arrives;
 *   - a caret is placed by transform at the end of what is typed, from
 *     places measured once when its typing starts;
 *   - a mirror (the palette's “query” in a row) is a one-line box whose
 *     words follow the typing;
 *   - a path moves an element by transform along eased waypoints (a pointer,
 *     a card in the hand).
 *
 * Every write is to the DOM directly (no React render), and only when the
 * value changes.
 */

/** The highlight that hides what a typed text has not shown yet. */
export const UNSHOWN = "sc-unshown"
/** The highlight that underlines what the app has understood in a typed text (a name after "with"). */
export const PARSED = "sc-parsed"

type Registry = { get(name: string): unknown; set(name: string, h: unknown): unknown }

function registry(): Registry | null {
  if (typeof CSS === "undefined" || !("highlights" in CSS) || typeof (globalThis as { Highlight?: unknown }).Highlight !== "function") return null
  return (CSS as unknown as { highlights: Registry }).highlights
}

type HighlightLike = { add(r: Range): void; delete(r: Range): void }

function highlight(name: string): HighlightLike | null {
  const reg = registry()
  if (!reg) return null
  let h = reg.get(name) as HighlightLike | undefined
  if (!h) {
    const H = (globalThis as unknown as { Highlight: new () => HighlightLike }).Highlight
    h = new H()
    reg.set(name, h)
  }
  return h
}
const unshown = () => highlight(UNSHOWN)

/** The scale a scene is drawn at: its stage's drawn width over its laid-out width. */
function scaleOf(el: HTMLElement): number {
  const w = el.offsetWidth
  return w ? el.getBoundingClientRect().width / w : 1
}

type Place = { x: number; y: number; h: number }

/**
 * One typed text: `[data-sc-type="id"]`, its words already laid out, with
 * `data-sc-cadence` (local, remote or stream), `data-sc-seed` and an
 * optional `data-sc-pace`. Its carets are `[data-sc-caret="id"]` and its
 * mirrors `[data-sc-mirror="id"]` (with what always follows the words, such
 * as a closing quote, in data-sc-after), anywhere in the scene. A box that grows
 * with it as the app's does (a palette's answer) is `[data-sc-rows="id"]`:
 * while it types, that box carries data-rows-live, --sc-rows (the lines
 * shown, 0 before the first character) and --sc-rows-all (the lines of the
 * whole text), for its stylesheet to size it and move what follows by.
 * `data-sc-mark="from:to:min"` underlines the characters from `from` to
 * `to` as they are typed, once `min` of them are (::highlight(sc-parsed)).
 */
export class Typer {
  readonly length: number
  readonly steps: { at: number; n: number }[]
  /** Characters shown, -1 before the first show. */
  shown = -1
  private readonly root: HTMLElement
  private readonly text: string
  private readonly nodes: { node: Text; start: number }[] = []
  private range: Range | null = null
  private places: Place[] | null = null
  private readonly carets: HTMLElement[]
  private readonly mirrors: HTMLElement[]
  private readonly grows: HTMLElement[]
  private readonly mark: [number, number, number] | null
  private marked: Range | null = null
  /** The line each place is on, from 0. */
  private lines: number[] = []

  constructor(root: HTMLElement, scope: ParentNode) {
    this.root = root
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let at = 0
    let text = ""
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n as Text
      this.nodes.push({ node: t, start: at })
      at += t.data.length
      text += t.data
    }
    this.text = text
    this.length = text.length
    const id = root.dataset.scType ?? ""
    const cadence = (root.dataset.scCadence ?? "local") as Cadence
    const pace = root.dataset.scPace ? Number(root.dataset.scPace) : undefined
    this.steps = schedule(text, cadence, root.dataset.scSeed ?? id, pace)
    this.carets = Array.from(scope.querySelectorAll<HTMLElement>(`[data-sc-caret="${id}"]`))
    this.mirrors = Array.from(scope.querySelectorAll<HTMLElement>(`[data-sc-mirror="${id}"]`))
    this.grows = Array.from(scope.querySelectorAll<HTMLElement>(`[data-sc-rows="${id}"]`))
    const m = root.dataset.scMark?.split(":").map(Number)
    this.mark = m && m.length === 3 && m.every((v) => Number.isFinite(v)) ? [m[0], m[1], m[2]] : null
  }

  /** When the text is whole, in ms from its start. */
  get duration(): number {
    return this.steps.length ? this.steps[this.steps.length - 1].at : 0
  }

  /** When, after `t` ms from its start, the next character lands (Infinity once it is whole). */
  nextAt(t: number): number {
    for (const s of this.steps) if (s.at > t) return s.at
    return Infinity
  }

  /** How many characters are in at `t` ms after its start. */
  countAt(t: number): number {
    let n = 0
    for (const s of this.steps) {
      if (s.at > t) break
      n = s.n
    }
    return n
  }

  /**
   * Shows what is typed `t` ms after its start; true once it is whole. A
   * browser without highlights cannot hide letters without moving them, so
   * there the text is whole from its start.
   */
  render(t: number): boolean {
    this.show(registry() ? this.countAt(t) : this.length)
    return this.shown >= this.length
  }

  /** Shows the first `n` characters (and moves the carets and mirrors there). */
  show(n: number): void {
    n = Math.max(0, Math.min(this.length, n))
    if (n === this.shown) return
    this.shown = n
    this.hideFrom(n)
    if (this.carets.length) {
      const p = this.place(n)
      for (const c of this.carets) c.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
    }
    if (this.mark) this.underline(n)
    const words = this.text.slice(0, n)
    for (const m of this.mirrors) {
      const shown = words + (m.dataset.scAfter ?? "")
      if (m.textContent !== shown) m.textContent = shown
    }
    if (this.grows.length) {
      this.place(n)
      const rows = n === 0 ? 0 : this.lines[n] + 1
      const all = this.lines[this.length] + 1
      for (const g of this.grows) {
        g.dataset.rowsLive = ""
        g.style.setProperty("--sc-rows", String(rows))
        g.style.setProperty("--sc-rows-all", String(all))
      }
    }
  }

  /** Whole, as drawn, its carets at the end (a reset, the end for a reader who asked for less motion, or the scene going away). */
  release(): void {
    this.show(this.length)
    if (this.range) unshown()?.delete(this.range)
    this.range = null
    if (this.marked) highlight(PARSED)?.delete(this.marked)
    this.marked = null
    for (const g of this.grows) {
      delete g.dataset.rowsLive
      g.style.removeProperty("--sc-rows")
      g.style.removeProperty("--sc-rows-all")
    }
  }

  private underline(n: number): void {
    const h = highlight(PARSED)
    if (!h || !this.mark) return
    const [from, to, min] = this.mark
    const end = Math.min(n, to)
    if (end - from < min) {
      if (this.marked) h.delete(this.marked)
      this.marked = null
      return
    }
    if (!this.marked) {
      this.marked = document.createRange()
      h.add(this.marked)
    }
    const [a, ao] = this.at(from)
    const [b, bo] = this.at(end)
    this.marked.setStart(a, ao)
    this.marked.setEnd(b, bo)
  }

  private hideFrom(n: number): void {
    const h = unshown()
    if (!h) return
    if (n >= this.length) {
      if (this.range) h.delete(this.range)
      this.range = null
      return
    }
    if (!this.range) {
      const last = this.nodes[this.nodes.length - 1]
      if (!last) return
      this.range = document.createRange()
      this.range.setEnd(last.node, last.node.data.length)
      h.add(this.range)
    }
    const [node, offset] = this.at(n)
    this.range.setStart(node, offset)
  }

  /** The text node and offset of character `n`. */
  private at(n: number): [Text, number] {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const s = this.nodes[i]
      if (n >= s.start) return [s.node, Math.min(n - s.start, s.node.data.length)]
    }
    return [this.nodes[0].node, 0]
  }

  /** Where a caret goes after `n` characters, in its frame's own (unscaled) px. */
  private place(n: number): Place {
    if (!this.places) this.places = this.measure()
    return this.places[Math.min(n, this.places.length - 1)]
  }

  private measure(): Place[] {
    const frame = (this.carets[0]?.offsetParent as HTMLElement | null) ?? this.root
    const box = frame.getBoundingClientRect()
    const k = scaleOf(frame)
    const r = document.createRange()
    const rectOf = (i: number): DOMRect | null => {
      const [a, ao] = this.at(i)
      const [b, bo] = this.at(i + 1)
      r.setStart(a, ao)
      r.setEnd(b, bo)
      const rects = r.getClientRects()
      return rects.length ? rects[rects.length - 1] : null
    }
    const local = (x: number, y: number, h: number): Place => ({ x: (x - box.left) / k, y: (y - box.top) / k, h: h / k })
    const out: Place[] = []
    const first = this.length ? rectOf(0) : null
    const rootBox = this.root.getBoundingClientRect()
    out.push(first ? local(first.left, first.top, first.height) : local(rootBox.left, rootBox.top, rootBox.height))
    for (let i = 1; i <= this.length; i++) {
      const c = rectOf(i - 1)
      out.push(c ? local(c.right, c.top, c.height) : out[i - 1])
    }
    // A new line starts where a place sits lower than the one before.
    let line = 0
    this.lines = out.map((p, i) => (i > 0 && p.y > out[i - 1].y + p.h / 2 ? ++line : line))
    return out
  }
}

/* ------------------------------------------------------------------ paths */

export type PathKey = {
  /** When, in ms from the start of a play. */
  at: number
  x: number
  y: number
  /**
   * How it gets here from the key before: "move", a hand's reach (minimum
   * jerk: it gathers speed and settles); "drop", dnd-kit's drop (200ms on
   * cubic-bezier(0.2, 0, 0, 1)); "linear"; or "jump", there at once.
   */
  ease?: "move" | "drop" | "linear" | "jump"
  /** A hand's path bows: px off the straight line at its middle (signed). */
  arc?: number
  /**
   * Somewhere drawn in the scene instead of x and y: the [data-sc-target]
   * of that name, measured when the path sets off towards it (so it is
   * where it has moved to by then), at `fx` and `fy` across it (0.5 each by
   * default), plus x and y.
   */
  to?: string
  fx?: number
  fy?: number
}

/** cubic-bezier(x1, y1, x2, y2) at progress x, by bisection. */
function bezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3
  let lo = 0
  let hi = 1
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2
    if (at(x1, x2, mid) < x) lo = mid
    else hi = mid
  }
  return at(y1, y2, (lo + hi) / 2)
}

function eased(kind: PathKey["ease"], u: number): number {
  if (kind === "jump") return u < 1 ? 0 : 1
  if (kind === "linear") return u
  if (kind === "drop") return bezier(0.2, 0, 0, 1, u)
  return u * u * u * (10 - 15 * u + 6 * u * u)
}

/** Where a path is at `t` ms. */
export function pathAt(keys: PathKey[], t: number): { x: number; y: number } {
  if (!keys.length) return { x: 0, y: 0 }
  if (t <= keys[0].at) return { x: keys[0].x, y: keys[0].y }
  for (let i = 1; i < keys.length; i++) {
    const b = keys[i]
    if (t >= b.at) continue
    const a = keys[i - 1]
    const u = (t - a.at) / Math.max(1, b.at - a.at)
    const e = eased(b.ease, u)
    let x = a.x + (b.x - a.x) * e
    let y = a.y + (b.y - a.y) * e
    if (b.arc) {
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
      const bow = b.arc * Math.sin(Math.PI * e)
      x += (-(b.y - a.y) / len) * bow
      y += ((b.x - a.x) / len) * bow
    }
    return { x, y }
  }
  const last = keys[keys.length - 1]
  return { x: last.x, y: last.y }
}

/** The elements a path moves: `[data-sc-path="id"]`. */
export class Mover {
  private last = ""
  private placed: PathKey[]
  constructor(
    private readonly els: HTMLElement[],
    readonly keys: PathKey[],
    private readonly scope: ParentNode,
  ) {
    this.placed = keys.map((k) => ({ ...k }))
  }

  get end(): number {
    return this.keys.length ? this.keys[this.keys.length - 1].at : 0
  }

  /**
   * Whether it is moving at `t` (between two different places), and when it
   * next changes: a held place, or a path not yet begun, needs no frames
   * until then.
   */
  next(t: number): { moving: boolean; at: number } {
    const k = this.placed
    if (!k.length || t >= this.end) return { moving: false, at: Infinity }
    if (t < k[0].at) return { moving: false, at: k[0].at }
    for (let i = 1; i < k.length; i++) {
      if (t >= k[i].at) continue
      const a = k[i - 1]
      const b = k[i]
      const still = b.ease === "jump" || (!b.to && !a.to && a.x === b.x && a.y === b.y && !b.arc)
      return { moving: !still, at: b.at }
    }
    return { moving: false, at: Infinity }
  }

  /** Forgets where its targets were (a new play measures them again). */
  reset(): void {
    this.placed = this.keys.map((k) => ({ ...k }))
    this.last = ""
  }

  /** A key's target, measured now, in the moved element's frame. */
  private resolve(i: number): void {
    const k = this.keys[i]
    const el = this.els[0]
    if (!k.to || !el) return
    const target = this.scope.querySelector<HTMLElement>(`[data-sc-target="${k.to}"]`)
    const frame = (el.offsetParent as HTMLElement | null) ?? el.parentElement
    if (!target || !frame) return
    const f = frame.getBoundingClientRect()
    const r = target.getBoundingClientRect()
    const scale = frame.offsetWidth ? f.width / frame.offsetWidth : 1
    this.placed[i] = {
      ...k,
      to: undefined,
      x: (r.left - f.left + r.width * (k.fx ?? 0.5)) / scale + k.x,
      y: (r.top - f.top + r.height * (k.fy ?? 0.5)) / scale + k.y,
    }
  }

  render(t: number): void {
    // Measure a target as the path sets off towards it.
    for (let i = 0; i < this.keys.length; i++) {
      if (!this.placed[i].to) continue
      const from = i === 0 ? -Infinity : this.keys[i - 1].at
      if (t >= from) this.resolve(i)
    }
    const p = pathAt(this.placed, t)
    const v = `translate3d(${Math.round(p.x * 10) / 10}px, ${Math.round(p.y * 10) / 10}px, 0)`
    if (v === this.last) return
    this.last = v
    for (const el of this.els) el.style.transform = v
  }
}
