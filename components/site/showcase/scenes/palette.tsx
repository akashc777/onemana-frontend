import { AppFrame, PhoneFrame } from "../AppFrame"
import { ChannelView, Message } from "../ChannelView"
import { ANSWER_STREAM, ANSWER_TEXT, PaletteOver, PlayPalette, QUESTION, QUESTION_TYPING, listCap, type At } from "../Palette"
import type { Step } from "../SceneDirector"
import { ENGINEERING } from "../data"
import { keyTimes, lastTime, streamTimes } from "../motion/cadence"
import { SIZES, type SceneSpec } from "./types"

/**
 * ⌘K, asked (Palette.tsx), as the app answers it. Sam has opened the palette
 * over #engineering: it offers what he was just in. He types "What’s left
 * before launch?": at the first key the empty palette's lists go and Jonas
 * Weber matches by name; from the second the workspace's search is on its
 * way, the last two rows following every key ("Search everything for “…”",
 * "Ask OneCamp AI: “…”"); when his typing pauses it answers, and an older
 * answer dims while the next loads. Then ↑ to Ask and ⏎ (a tap on a phone):
 * the palette turns to Ask, reads what Sam can open, and the answer streams
 * in, token by token, with the line that says it answered only from what he
 * can open, then its sources. Before it plays, and for a reader without
 * JavaScript, the picture is the palette just opened; for a reader who asked
 * for less motion it is the answer.
 */

const P = ENGINEERING.posts

/** When each key of the question lands, from the first. */
const KEYS = keyTimes(QUESTION, QUESTION_TYPING.seed, { pace: QUESTION_TYPING.pace })
/** The workspace's search: 150ms after the keys pause (useSearch's debounce), answered about 130ms later. */
const DEBOUNCE = 150
const ANSWERED = 130

/** The first pause in the typing long enough for the search to go, once "left" is typed (index of the key before it). */
function firstPause(from: number): number {
  for (let i = from; i < KEYS.length - 1; i++) if (KEYS[i + 1] - KEYS[i] >= DEBOUNCE) return i
  return KEYS.length - 1
}
const LEFT = QUESTION.indexOf("left") + 3

/** The answer's tokens. */
const STREAM = streamTimes(ANSWER_TEXT, ANSWER_STREAM.seed, { tokenMs: ANSWER_STREAM.pace })

/** The moment, from the palette just opened; `tap` is how Ask is chosen (a key on a computer, a tap on a phone). */
function moment(tap: boolean): Step[] {
  const type = 500
  const key = (i: number) => type + KEYS[i]
  const pause = firstPause(LEFT)
  const last = KEYS.length - 1
  const found = pause < last ? key(pause) + DEBOUNCE + ANSWERED : -1
  const final = key(last) + DEBOUNCE + ANSWERED
  const steps: Step[] = [
    { at: type, type: ["pal-q"], off: ["pal-ph", "pal-l0"], on: ["pal-qtext", "pal-l1"] },
    { at: key(1), off: ["pal-l1"], on: ["pal-l2"] },
  ]
  if (found > 0) {
    steps.push({ at: found, off: ["pal-l2"], on: ["pal-l3"] })
    // The last search goes out while the older answer is still up: it dims.
    steps.push({ at: key(last) + DEBOUNCE, on: ["pal-dim"] })
    steps.push({ at: final, off: ["pal-l3"], on: ["pal-l4"] })
  } else {
    steps.push({ at: final, off: ["pal-l2"], on: ["pal-l4"] })
  }
  // A beat to read, then the selection goes to Ask (↑, or a tap) and it is asked.
  const choose = final + 650
  const ask = choose + (tap ? 220 : 380 + 160)
  // On a computer the selected row carries ⏎, and it moves with the selection.
  const keys = (id: string) => (tap ? [id] : [id, `${id}-key`])
  steps.push({ at: choose, off: keys("pal-sel-first"), on: keys("pal-sel-ask") })
  if (!tap) steps.push({ at: choose + 380, on: ["pal-lit"] })
  steps.push({ at: ask, off: ["pal-l4"], on: ["pal-ask", "pal-la", "pal-think"] })
  // It reads, then the answer streams; the shield line comes with its first word, the sources once it is whole.
  const stream = ask + 820
  steps.push({ at: stream, type: ["pal-answer"], off: ["pal-think"], on: ["pal-caret", "pal-prov"] })
  steps.push({ at: stream + lastTime(STREAM) + 120, off: ["pal-caret", "pal-prov"], on: ["pal-src", "pal-prov-end"] })
  return steps
}

/**
 * #engineering as it reads under the palette's scrim: its last words, the
 * composer under them. (Jonas's mention of Sam is left out: its accent bar,
 * at the sheet's edge, would show beside the palette as a stray line.)
 */
function Engineering() {
  return (
    <ChannelView
      name="engineering"
      people={ENGINEERING.members}
      count={ENGINEERING.memberCount}
      placeholder="Message #engineering, or ask @Release Captain"
      hint={false}
      items={
        <>
          <Message by={P.loadTest.by} at={P.loadTest.at}>
            {P.loadTest.text}
          </Message>
          <Message by={P.checklist.by} at={P.checklist.at} provenance>
            {P.checklist.text}
          </Message>
          <Message by={P.decisions.by} at={P.decisions.at}>
            {P.decisions.text}
          </Message>
          <Message by={P.announcement.by} at={P.announcement.at}>
            {P.announcement.text}
          </Message>
          {/* The last words end above the palette's lower edge rather than
              under it, so no sliver of a line shows beneath the panel. */}
          <div className="h-4" />
        </>
      }
    />
  )
}

/** The window: #engineering on the sheet, the scrim, and the palette hanging from 14% of the window. */
export function PaletteTour({ at = "start" }: { at?: At }) {
  const { w, h } = SIZES.tour
  return (
    <div className="relative h-full w-full">
      <AppFrame>
        <Engineering />
      </AppFrame>
      <PaletteOver w={w} h={h}>
        <PlayPalette at={at} cap={listCap(h)} />
      </PaletteOver>
    </div>
  )
}

/** The phone: the palette is the whole screen (P4), Search | Ask under the field. */
export function PalettePhone({ at = "start" }: { at?: At }) {
  return (
    <PhoneFrame>
      <PlayPalette at={at} phone />
    </PhoneFrame>
  )
}

export const paletteDesktop: SceneSpec = {
  ...SIZES.tour,
  label:
    "OneCamp’s ⌘K palette over #engineering: “What’s left before launch?” is typed, the results narrowing as it is, and asked of OneCamp AI, which answers that the load test and the launch announcement are left, says it answered only from what you can open, on the record, and cites #engineering, the task and the Launch sync notes.",
  script: { plays: 1, delay: 900, steps: moment(false) },
  render: () => <PaletteTour />,
}

export const palettePhone: SceneSpec = {
  ...SIZES.phone,
  label:
    "OneCamp’s search on a phone: “What’s left before launch?” is typed and asked of OneCamp AI, which answers that the load test and the launch announcement are left, says it answered only from what you can open, on the record, and cites #engineering, the task and the Launch sync notes.",
  script: { plays: 1, delay: 900, steps: moment(true) },
  render: () => <PalettePhone />,
}
