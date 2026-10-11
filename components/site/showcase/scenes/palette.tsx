import { AppFrame, PhoneFrame } from "../AppFrame"
import { ChannelView, Message } from "../ChannelView"
import { ANSWER_PARTS, PaletteOver, QuestionPalette, listCap, type At } from "../Palette"
import type { Step } from "../SceneDirector"
import { ENGINEERING } from "../data"
import { SIZES, type SceneSpec } from "./types"

/**
 * ⌘K, asked (Palette.tsx). Sam has typed a question into the palette over
 * #engineering. The moment: ⏎ on "Ask OneCamp AI" (a tap on a phone), the
 * palette turns to Ask, reads what Sam can open, and answers in place, with
 * its sources and the line that says it answered only from what Sam can
 * open, on the record. Before it plays, and for a reader without
 * JavaScript, the picture is the search, complete; for a reader who asked
 * for less motion it is the answer.
 */

const P = ENGINEERING.posts

/** The answer streaming in: each part with its caret, then the sources, then the shield line last. */
function stream(from: number): Step[] {
  const gap = 170
  const steps: Step[] = []
  for (let i = 1; i <= ANSWER_PARTS; i++) {
    steps.push({ at: from + (i - 1) * gap, on: [`pal-a${i}`, `pal-c${i}`], off: [i === 1 ? "pal-think" : `pal-c${i - 1}`] })
  }
  const done = from + (ANSWER_PARTS - 1) * gap + 280
  steps.push({ at: done, on: ["pal-src"], off: [`pal-c${ANSWER_PARTS}`] })
  steps.push({ at: done + 420, on: ["pal-prov"] })
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
        <QuestionPalette at={at} cap={listCap(h)} />
      </PaletteOver>
    </div>
  )
}

/** The phone: the palette is the whole screen (P4), Search | Ask under the field. */
export function PalettePhone({ at = "start" }: { at?: At }) {
  return (
    <PhoneFrame>
      <QuestionPalette at={at} phone />
    </PhoneFrame>
  )
}

export const paletteDesktop: SceneSpec = {
  ...SIZES.tour,
  label:
    "OneCamp’s ⌘K palette over #engineering: the search “What’s left before launch?” is asked of OneCamp AI, which answers that the load test and the launch announcement are left, cites #engineering, the task and the Launch sync notes, and says it answered only from what you can open, on the record.",
  script: {
    plays: 1,
    delay: 900,
    steps: [
      // ⏎ on the selected "Ask OneCamp AI" row.
      { at: 0, on: ["pal-lit"] },
      // Ask: the knob slides, the field takes the agent's wash, and it reads.
      { at: 260, on: ["pal-ask", "pal-think"], off: ["pal-lit"] },
      ...stream(1100),
    ],
  },
  render: () => <PaletteTour />,
}

export const palettePhone: SceneSpec = {
  ...SIZES.phone,
  label:
    "OneCamp’s search on a phone: “What’s left before launch?” is asked of OneCamp AI, which answers that the load test and the launch announcement are left, cites #engineering, the task and the Launch sync notes, and says it answered only from what you can open, on the record.",
  script: {
    plays: 1,
    delay: 900,
    steps: [
      // A tap on "Ask OneCamp AI" selects it.
      { at: 0, on: ["pal-sel-ask"], off: ["pal-sel-first"] },
      { at: 220, on: ["pal-ask", "pal-think"] },
      ...stream(1060),
    ],
  },
  render: () => <PalettePhone />,
}
