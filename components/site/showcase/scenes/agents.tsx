import { AppFrame, PhoneFrame } from "../AppFrame"
import { AgentRecordView, RecordRow, type RecordEntry } from "../AgentRecord"
import { STORY } from "../data"
import { PointerLayer } from "../motion/Pointer"
import type { Script, Step } from "../SceneDirector"
import { SIZES, type SceneSpec } from "./types"

/**
 * The Agents tab: Jonas's own record on the Inbox's Agents tab, after the
 * hero's story. The hero ends on one refusal; this shows what makes the
 * record evidence rather than a log, as Prove it does it in the app
 * (MyAIActivityCard, proveIt): pressed, it is busy ("Checking 4 entries…")
 * and a link appears small in each entry's gutter; each is checked against
 * the one before it and ticks to moss, top to bottom 30ms apart; then the
 * result drops in where the record's line was: "Chain intact".
 */
const ENTRIES: RecordEntry[] = [
  { ...STORY.record, why: "you are not a member of this channel" },
  { ...STORY.record, verb: "is about to try", outcome: "attempt", why: "the permission check runs first, and is written down before it" },
  { who: "Release Captain", verb: "acted as you ·", object: "created 2 tasks", outcome: "done", why: "Record the product walkthrough, Update the onboarding checklist", at: "10:15 AM" },
  { who: "Release Captain", verb: "acted as you ·", object: "posted in #engineering", outcome: "done", why: "Checklist status: 11 of 12 items are marked done", at: "9:38 AM" },
]

/** The result, with when it was checked, as the app writes it. */
const RESULT = `Chain intact · ${ENTRIES.length - 1} links between ${ENTRIES.length} entries verified · 11:21 AM`

/** Prove it, from its press: busy, the links, their ticks 30ms apart after 40ms, and the result once they are all in (proveIt: n × 30 + 220ms). */
function proving(press: number, phone: boolean): Step[] {
  const n = ENTRIES.length
  const done = press + Math.min(n, 20) * 30 + 220
  return [
    { at: press, off: ["prove-rest"], on: ["prove-busy", ...ENTRIES.map((_, i) => `link-${i}`)] },
    ...ENTRIES.map((_, i) => ({ at: press + 40 + i * 30, on: [`link-${i}-ok`] })),
    { at: done, off: ["prove-busy", phone ? "record-actions" : "record-line"], on: ["proved", ...(phone ? [] : ["prove-rest"])] },
  ]
}

/** On a computer the pointer comes to Prove it (a hand over it) and presses. */
const OVER = 640
const PRESS = 820

export const agentsScript: Script = {
  delay: 700,
  plays: 1,
  stagger: 45,
  steps: [{ at: 0, on: ["rec-ptr"] }, { at: OVER, off: ["rec-ptr-arrow"], on: ["rec-ptr-hand"] }, ...proving(PRESS, false)],
  paths: {
    "rec-ptr": [
      { at: 0, x: SIZES.tour.w + 30, y: 260 },
      { at: OVER - 30, to: "prove-btn", fx: 0.55, fy: 0.55, x: 0, y: 0, ease: "move", arc: 30 },
    ],
  },
}

/** On a phone, a tap. */
const agentsPhoneScript: Script = { delay: 700, plays: 1, stagger: 45, steps: proving(400, true) }

const LABEL =
  "OneCamp's record of what an agent did for Jonas: the Release Captain's attempt to post in #finance and its refusal, and two actions it completed. Prove it checks each entry against the one before it, and the chain is shown intact."

export const agentsDesktop: SceneSpec = {
  ...SIZES.tour,
  label: LABEL,
  script: agentsScript,
  render: () => (
    <>
      <AppFrame>
        <AgentRecordView entries={ENTRIES} proving={{ result: RESULT }} />
      </AppFrame>
      <PointerLayer id="rec-ptr" shapes={["arrow", "hand"]} />
    </>
  ),
}

export const agentsPhone: SceneSpec = {
  ...SIZES.phone,
  label: LABEL,
  script: agentsPhoneScript,
  render: () => (
    <PhoneFrame tab="inbox">
      <AgentRecordView entries={ENTRIES} proving={{ result: RESULT }} phone />
    </PhoneFrame>
  ),
}

export { RecordRow }
