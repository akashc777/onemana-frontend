/**
 * WHEN THINGS LAND: seeded human timing for the showcase's motion.
 *
 * A person types at an uneven pace: 60 to 180ms between keys inside a word,
 * a longer beat before the next word, longer still after a comma and after
 * a full stop, and now and then a hesitation. A collaborator's keys reach
 * another screen one update per key (the app's Hocuspocus provider sends
 * every Yjs update at once), a few milliseconds of network apart, so two of
 * them sometimes land in the same frame. A model's answer arrives as tokens,
 * word pieces a few characters long, a few tens of milliseconds apart, with
 * the odd stall.
 *
 * Everything here is a pure function of the text and a seed: the server, the
 * tests, a screenshot and every browser get the same times (no
 * Math.random), so a still taken at any moment is reproducible.
 */

/** FNV-1a, 32 bits. */
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** A seeded generator of numbers in [0, 1) (mulberry32). */
export function seeded(seed: string): () => number {
  let a = hash(seed)
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Cadence = "local" | "remote" | "stream"

export type TypingOptions = {
  /** The middle of the gap between two keys inside a word, in ms. */
  pace?: number
  /** "remote": what another screen sees, each key a little late, sometimes two in one frame. */
  remote?: boolean
}

const WORD_END = /\s/
const PAUSE = /[,;:]/
const STOP = /[.?!…]/

/**
 * When each character of `text` lands, in ms from the first (which lands at
 * 0). `times[i]` is when character i appears; the text is whole at the last.
 */
export function keyTimes(text: string, seed: string, { pace = 92, remote = false }: TypingOptions = {}): number[] {
  const r = seeded(`${seed}:${text}`)
  const times: number[] = []
  let t = 0
  for (let i = 0; i < text.length; i++) {
    if (i > 0) {
      const prev = text[i - 1]
      const ch = text[i]
      // Inside a word: 0.65 to 1.45 of the pace, most often near it.
      let gap = pace * (0.65 + 0.4 * (r() + r()))
      if (WORD_END.test(prev)) gap += pace * (0.3 + 0.7 * r())
      if (PAUSE.test(prev)) gap += pace * (1.2 + 1.3 * r())
      if (STOP.test(prev)) gap += pace * (2 + 2 * r())
      if (ch !== ch.toLowerCase()) gap += pace * 0.35 * r()
      if (ch === prev) gap *= 0.8
      if (r() < 0.05) gap += pace * (0.9 + 1.4 * r())
      t += Math.max(48, gap)
    }
    times.push(Math.round(t))
  }
  if (!remote) return times
  // Another screen: each update 4 to 34ms in transit, never overtaking the
  // one before; now and then the connection stalls for a moment and the keys
  // behind the stall land together, two or three in a frame.
  const net = seeded(`${seed}:net:${text}`)
  let last = 0
  return times.map((at) => {
    const late = net() < 0.07 ? 70 + 90 * net() : 4 + 30 * net()
    return (last = Math.max(last, Math.round(at + late)))
  })
}

/**
 * A model's answer streaming in: where each chunk ends (in characters) and
 * when it arrives, in ms from the first. The pieces are token sized (a word
 * with its space, a long word in two, punctuation on its own), most chunks
 * one token and some two or three (the network's batching), about `tokenMs`
 * apart, with a stall now and then.
 */
export function streamTimes(text: string, seed: string, { tokenMs = 38 }: { tokenMs?: number } = {}): { at: number; end: number }[] {
  const r = seeded(`${seed}:stream:${text}`)
  const tokens: number[] = []
  const re = /\s*[\p{L}’'-]+|\s*\d+|\s*[^\s\p{L}\d]|\s+$/gu
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0
    const word = m[0]
    const letters = word.trimStart().length
    if (letters > 7) {
      // A long word is two tokens.
      const cut = start + word.length - letters + 3 + Math.floor(r() * (letters - 5))
      tokens.push(cut, start + word.length)
    } else tokens.push(start + word.length)
  }
  if (tokens.length === 0 || tokens[tokens.length - 1] !== text.length) tokens.push(text.length)
  const out: { at: number; end: number }[] = []
  let t = 0
  for (let i = 0; i < tokens.length; ) {
    const take = Math.min(tokens.length - i, r() < 0.72 ? 1 : r() < 0.7 ? 2 : 3)
    i += take
    out.push({ at: Math.round(t), end: tokens[i - 1] })
    t += tokenMs * take * (0.7 + 0.6 * r())
    if (r() < 0.07) t += 110 + 160 * r()
  }
  return out
}

/** How many characters are in by `t` ms, for times from keyTimes. */
export function typedBy(times: number[], t: number): number {
  let lo = 0
  let hi = times.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (times[mid] <= t) lo = mid + 1
    else hi = mid
  }
  return lo
}

/** How many characters are in by `t` ms, for chunks from streamTimes. */
export function streamedBy(chunks: { at: number; end: number }[], t: number): number {
  let n = 0
  for (const c of chunks) {
    if (c.at > t) break
    n = c.end
  }
  return n
}

/** When the text is whole: the last key's or the last chunk's time. */
export function lastTime(times: number[] | { at: number }[]): number {
  const last = times[times.length - 1]
  return last === undefined ? 0 : typeof last === "number" ? last : last.at
}

/** The schedule a typed element asks for (its data-sc-cadence, data-sc-seed and data-sc-pace), as reveal counts over time. */
export function schedule(text: string, cadence: Cadence, seed: string, pace?: number): { at: number; n: number }[] {
  if (cadence === "stream") return streamTimes(text, seed, pace ? { tokenMs: pace } : {}).map((c) => ({ at: c.at, n: c.end }))
  return keyTimes(text, seed, { pace, remote: cadence === "remote" }).map((at, i) => ({ at, n: i + 1 }))
}
