import { AppFrame, PhoneFrame } from "../AppFrame"
import { AgentRecordView, RecordRow, type RecordEntry } from "../AgentRecord"
import { STORY } from "../data"
import type { Script } from "../SceneDirector"
import { SIZES, type SceneSpec } from "./types"

/**
 * The Agents tab: Jonas's own record on the Inbox's Agents tab, after the
 * hero's story. The hero ends on one refusal; this shows what makes the
 * record evidence rather than a log: Prove it checks every entry against the
 * one before it, the links tick moss in turn, and the result is "Chain
 * intact".
 */
const ENTRIES: RecordEntry[] = [
  { ...STORY.record, why: "you are not a member of this channel" },
  { ...STORY.record, verb: "is about to try", outcome: "attempt", why: "the permission check runs first, and is written down before it" },
  { who: "Release Captain", verb: "acted as you ·", object: "created 2 tasks", outcome: "done", why: "Record the product walkthrough, Update the onboarding checklist", at: "10:15 AM" },
  { who: "Release Captain", verb: "acted as you ·", object: "posted in #engineering", outcome: "done", why: "Checklist status: 11 of 12 items are marked done", at: "9:38 AM" },
]

const RESULT = `Chain intact · ${ENTRIES.length - 1} links between ${ENTRIES.length} entries verified`

export const agentsScript: Script = {
  delay: 700,
  plays: 1,
  stagger: 45,
  steps: [
    ...ENTRIES.map((_, i) => ({ at: i * 90, on: [`link-${i}`] })),
    { at: ENTRIES.length * 90 + 260, off: ["record-line"], on: ["proved"] },
  ],
}

const LABEL =
  "OneCamp's record of what an agent did for Jonas: the Release Captain's attempt to post in #finance and its refusal, and two actions it completed, each entry checked against the one before it and the chain shown intact."

export const agentsDesktop: SceneSpec = {
  ...SIZES.tour,
  label: LABEL,
  script: agentsScript,
  render: () => (
    <AppFrame>
      <AgentRecordView entries={ENTRIES} proving={{ result: RESULT }} />
    </AppFrame>
  ),
}

export const agentsPhone: SceneSpec = {
  ...SIZES.phone,
  label: LABEL,
  // A phone has no toolbar line: the result takes the whole row, and the buttons give way.
  script: { ...agentsScript, steps: agentsScript.steps.map((s) => (s.off ? { ...s, off: s.off.map((k) => (k === "record-line" ? "record-actions" : k)) } : s)) },
  render: () => (
    <PhoneFrame tab="inbox">
      <AgentRecordView entries={ENTRIES} proving={{ result: RESULT }} phone />
    </PhoneFrame>
  ),
}

export { RecordRow }
