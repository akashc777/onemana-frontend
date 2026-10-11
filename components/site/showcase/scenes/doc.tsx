import { AppFrame, PhoneFrame } from "../AppFrame"
import { Caret, DocH2, DocItem, DocList, DocP, DocPage, PhoneDocPage, Typed, type Here } from "../DocPage"
import { MAYA, SAM } from "../data"
import type { Script, Step } from "../SceneDirector"
import { SIZES, type SceneSpec } from "./types"

/**
 * The Docs tab: the demo's "Launch sync notes" (DemoSeed workspace.go
 * CuratedDocs), open for Sam, while Maya adds the rollback steps under
 * Decisions, live: Maya's caret and name flag end the last decision, a new
 * one starts, and its words arrive as they are typed. The demo's
 * #engineering says the same: Jonas asked for the rollback steps in these
 * notes, and Maya "added them under Decisions".
 *
 * The new decision is the doc's last block, laid out from the start and
 * revealed (SceneDirector), so nothing moves while it arrives. The doc's
 * Actions section, which the seed has after Decisions, is not written yet.
 */
const EDITOR = MAYA

const DOC = { title: "Launch sync notes", meta: ["Sam Rivera", "Edited 6 hours ago", "1 min read"] }

/** Sam reads; the editor is here too. Each in the hue their name gives them, as everywhere on the site. */
const HERE: Here[] = [{ person: SAM }, { person: EDITOR }]

/** The new decision, in the pieces it arrives in, with the caret after each. */
const WORDS = ["Rollback, if Thursday goes wrong:", " first redeploy the previous release tag,", " then restore the pre-release backup.", " Both steps tried on staging."]

/** The last caret, after the last words. */
const LAST = `doc-c${WORDS.length + 1}`

const steps: Step[] = [
  // Enter at the end of the last decision: a new bullet, the caret on it,
  // its flag up again now the caret moves.
  { at: 0, off: ["doc-c0"], on: ["doc-line"] },
  ...WORDS.map((_, i) => ({ at: 700 + i * 520, off: [`doc-c${i + 1}`], on: [`doc-w${i + 1}`, `doc-c${i + 2}`] })),
  // Typing stops: the flag folds to the dot (the app holds it 3s).
  { at: 700 + (WORDS.length - 1) * 520 + 2000, off: ["doc-flag"], on: ["doc-dot"] },
]

const SCRIPT: Script = { steps, plays: 1, delay: 700, stagger: 40 }

type State = "off" | "on" | undefined

/** What each piece shows before the moment, and after it (for a still of its end). */
function states(final: boolean): (item: string) => State {
  // Before the moment the caret has idled at the end of the last decision,
  // its flag folded: a first paint where nothing covers the words.
  const at: Record<string, State> = { "doc-line": "off", "doc-flag0": "off", "doc-dot": "off" }
  WORDS.forEach((_, i) => {
    at[`doc-w${i + 1}`] = "off"
    at[`doc-c${i + 2}`] = "off"
  })
  if (final) {
    for (const s of steps) {
      s.on?.forEach((k) => (at[k] = "on"))
      s.off?.forEach((k) => (at[k] = "off"))
    }
  }
  return (item) => at[item]
}

function Body({ final }: { final: boolean }) {
  const st = states(final)
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
          <Caret person={EDITOR} item="doc-c0" state={st("doc-c0")} fold={{ flag: "doc-flag0", flagState: st("doc-flag0"), dot: "doc-dot0" }} />
        </DocItem>
        <DocItem item="doc-line" state={st("doc-line")}>
          <Caret person={EDITOR} item="doc-c1" state={st("doc-c1")} />
          {WORDS.map((w, i) => (
            <span key={w} className="contents">
              <Typed item={`doc-w${i + 1}`} state={st(`doc-w${i + 1}`)}>
                {w}
              </Typed>
              <Caret
                person={EDITOR}
                item={`doc-c${i + 2}`}
                state={st(`doc-c${i + 2}`)}
                fold={`doc-c${i + 2}` === LAST ? { flag: "doc-flag", flagState: st("doc-flag"), dot: "doc-dot", dotState: st("doc-dot") } : undefined}
              />
            </span>
          ))}
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
  label: `A OneCamp doc, the Launch sync notes, where ${EDITOR.name}'s live caret and name flag add the rollback steps under Decisions while ${SAM.name} reads.`,
  script: SCRIPT,
  render: () => <DocScene />,
}

export const docPhone: SceneSpec = {
  ...SIZES.phone,
  label: `The Launch sync notes on a phone, where ${first}'s live caret adds the rollback steps under Decisions.`,
  script: SCRIPT,
  render: () => <DocScene phone />,
}
