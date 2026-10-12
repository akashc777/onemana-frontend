/**
 * A scene's clock (SceneDirector): time that passes only while the scene is
 * seen (a third of it on screen, its tab shown). Hidden, it stops where it
 * is; seen again, it goes on from there, so a story never jumps ahead while
 * nobody watches it. `read` is the page's clock (performance.now).
 */
export class SceneClock {
  private banked = 0
  private since = 0
  private seen = false

  constructor(private readonly read: () => number) {}

  /** The scene's time, in ms. */
  now(): number {
    return this.banked + (this.seen ? this.read() - this.since : 0)
  }

  get running(): boolean {
    return this.seen
  }

  /** Seen or not; true when it has just started running again. */
  see(on: boolean): boolean {
    if (on === this.seen) return false
    if (on) {
      this.since = this.read()
      this.seen = true
      return true
    }
    this.banked = this.now()
    this.seen = false
    return false
  }
}

/** The script's end, for a reader who asked for less motion: every part's last state, in the order the steps leave them. */
export function endStates(steps: { on?: string[]; off?: string[] }[]): Map<string, "on" | "off"> {
  const out = new Map<string, "on" | "off">()
  for (const s of steps) {
    s.on?.forEach((k) => out.set(k, "on"))
    s.off?.forEach((k) => out.set(k, "off"))
  }
  return out
}
