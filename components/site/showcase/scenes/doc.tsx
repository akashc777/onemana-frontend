import { AppFrame, PhoneFrame } from "../AppFrame"
import { Caret, DocH2, DocItem, DocList, DocP, DocPage, PhoneDocPage, type Here } from "../DocPage"
import { MAYA, SAM } from "../data"
import { keyTimes, lastTime } from "../motion/cadence"
import { TypedText } from "../motion/parts"
import type { Script, Step } from "../SceneDirector"
import { SIZES, type SceneSpec } from "./types"

/**
 * The Docs tab: the demo's "Launch sync notes" (DemoSeed workspace.go
 * CuratedDocs), open for Sam, while Maya adds the rollback steps under
 * Decisions, live. The demo's #engineering says the same: Jonas asked for
 * the rollback steps in these notes, and Maya "added them under Decisions".
 *
 * As the app shows another person typing (y-prosemirror over Hocuspocus, one
 * update per key): her caret rests at the end of the last decision, its flag
 * folded to the dot; she presses Enter, and a new bullet appears with her
 * caret on it and her name on its flag; then the words arrive a key at a
 * time at her pace, the caret jumping with each. The flag folds to the dot
 * 3.2s after the caret was made, while she is still typing (the app reuses
 * the caret's element within a block, so its one fold animation is not
 * replayed). Sam's save dot never moves: it follows only his own edits.
 *
 * The new decision is the doc's last block, laid out whole from the start and
 * typed in by paint (motion/engine), so nothing moves while it arrives. The
 * doc's Actions section, which the seed has after Decisions, is not written
 * yet.
 */
const EDITOR = MAYA

const DOC = { title: "Launch sync notes", meta: ["Sam Rivera", "Edited 6 hours ago", "1 min read"] }

/** Sam reads; the editor is here too. Each in the hue their name gives them, as everywhere on the site. */
const HERE: Here[] = [{ person: SAM }, { person: EDITOR }]

/**
 * The new decision. Its first words are what Ask's source chip quotes from
 * the notes ("Rollback, if Thursday goes…", Palette.tsx).
 */
export const DECISION = "Rollback, if Thursday goes wrong: redeploy the last tag, then restore the backup."

/** Maya's pace: a quick typist, 66ms between keys in a word. */
const PACE = 66
const KEYS = keyTimes(DECISION, "maya", { pace: PACE, remote: true })

/** Enter, then her first key a beat later. */
const FIRST_KEY = 300
/** The app's flag: 160ms in, 3s held, then 400ms out to the dot, from when the caret is made. */
const FOLD = 3160

const steps: Step[] = [
  // Enter at the end of the last decision: the new bullet at once, the
  // caret on it, its flag up.
  { at: 0, off: ["doc-c0"], on: ["doc-line", "doc-cf", "doc-flag"] },
  { at: FIRST_KEY, type: ["doc-type"] },
  { at: FOLD, off: ["doc-flag"], on: ["doc-dot"] },
]

const SCRIPT: Script = { steps, plays: 1, delay: 700, stagger: 40 }

/** How long the moment lasts, from Enter to her last key. */
export const DOC_MOMENT = FIRST_KEY + lastTime(KEYS)

type State = "off" | "on" | undefined

function Body({ final }: { final: boolean }) {
  // Before the moment her caret has idled at the end of the last decision,
  // its flag folded: a first paint where nothing covers the words. The end
  // (a still of it) is the decision whole with her caret resting after it.
  const st = (start: State, end: State) => (final ? end : start)
  return (
    <>
      <DocP>
        <b>Attendees:</b> Sam, Maya, Jonas
      </DocP>
      <DocH2>Decisions</DocH2>
      <DocList>
        <DocItem>Business tier is on the pricing page at launch, not a week later.</DocItem>
        <DocItem>
          The walkthrough is one take, five minutes, no voiceover script.
          <Caret person={EDITOR} item="doc-c0" state={st(undefined, "off")} fold={{ flag: "doc-flag0", flagState: "off", dot: "doc-dot0" }} />
        </DocItem>
        <DocItem item="doc-line" state={st("off", "on")}>
          <TypedText id="doc-type" cadence="remote" seed="maya" pace={PACE}>
            {DECISION}
          </TypedText>
          {final ? (
            <Caret person={EDITOR} item="doc-cend" fold={{ flag: "doc-flagend", flagState: "off", dot: "doc-dotend" }} />
          ) : (
            <Caret person={EDITOR} item="doc-cf" state="off" follows="doc-type" fold={{ flag: "doc-flag", flagState: "off", dot: "doc-dot", dotState: "off" }} />
          )}
        </DocItem>
      </DocList>
    </>
  )
}

/** The scene's drawing, at its start or (`final`) at its end. */
export function DocScene({ phone = false, final = false }: { phone?: boolean; final?: boolean }) {
  if (phone) {
    return (
      <PhoneFrame>
        <PhoneDocPage title={DOC.title} meta={DOC.meta} here={HERE}>
          <Body final={final} />
        </PhoneDocPage>
      </PhoneFrame>
    )
  }
  return (
    <AppFrame>
      <DocPage title={DOC.title} meta={DOC.meta} here={HERE}>
        <Body final={final} />
      </DocPage>
    </AppFrame>
  )
}

const first = EDITOR.name.split(" ")[0]

export const docDesktop: SceneSpec = {
  ...SIZES.tour,
  label: `A OneCamp doc, the Launch sync notes, where ${EDITOR.name}'s live caret and name flag type the rollback steps under Decisions while ${SAM.name} reads.`,
  script: SCRIPT,
  render: () => <DocScene />,
}

export const docPhone: SceneSpec = {
  ...SIZES.phone,
  label: `The Launch sync notes on a phone, where ${first}'s live caret types the rollback steps under Decisions.`,
  script: SCRIPT,
  render: () => <DocScene phone />,
}
