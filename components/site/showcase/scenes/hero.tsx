import { AppFrame, PhoneFrame } from "../AppFrame"
import { ChannelView, PhoneChannel } from "../ChannelView"
import { Later } from "../Later"
import { Sidebar } from "../Sidebar"
import { ENGINEERING, STORY } from "../data"
import type { Script, Step } from "../SceneDirector"
import { arrivals, history, typing } from "./heroParts"
import { SIZES, type SceneSpec } from "./types"

/**
 * THE HERO'S STORY, in #engineering on the demo's own day, as the app shows
 * it to Sam: Jonas is typing; his message lands, asking the Release Captain
 * to post the Q3 numbers in #finance; the agent is working; its answer lands
 * in the thread under Jonas's message (an @mentioned agent replies in the
 * thread: business/AIAgent agentTriggers postAgentReply), so "1 reply" appears
 * under it; Sam opens the thread and reads that it can't, because Jonas isn't
 * in #finance. Beside the window, the record of the attempt arrives with
 * Prove it (the refusal is the record's to show, not chat's).
 *
 * The conversation is complete before anything plays; the story's messages
 * wait under it, laid out, and the list snaps up as each lands
 * (SceneDirector). The channel with the thread open beside it, the pointer
 * and the phone's thread page are the story's alone, so the browser draws
 * them once the page is idle (Later, scenes/heroLater.tsx), out of sight,
 * and the scene swaps the channel for them at the press, as the app snaps
 * the page narrower when the panel opens.
 */

/* The story's beats, in ms from the start of a play. */
/** Jonas has been typing; his message lands. */
const ASK = 2300
/** The agent picks it up. */
const WORK = 2700
/** Its answer lands in the thread: the row appears under Jonas's message. */
const REPLY = 5300
/** The pointer comes in, reaches the row, and presses it. */
const REACH = 5600
const OVER = 6450
const PRESS = 6850
/** Then it moves off, towards the thread. */
const LEAVE = PRESS + 520
/** The record of the attempt, beside the window. */
const RECORD = 7700

const beats: Step[] = [
  { at: 0, on: ["typing-jonas"] },
  { at: ASK, off: ["typing-jonas"], on: ["ask"], rise: ["ask"] },
  { at: WORK, on: ["typing-agent"] },
  { at: REPLY, off: ["typing-agent"], on: ["row"], rise: ["row"] },
]

/** Jonas is typing; his ask lands; the agent works; "1 reply"; Sam opens the thread; the record arrives beside the window. */
export const heroScript: Script = {
  scope: "hero",
  delay: 900,
  plays: 3,
  rest: 7000,
  steps: [
    ...beats,
    { at: REACH, on: ["hero-ptr"] },
    { at: OVER, on: ["row-hover", "row-hover-view", "hero-ptr-hand"], off: ["hero-ptr-arrow"] },
    { at: PRESS, off: ["hero-wide"], on: ["hero-split", "thread-sheet", "thread-body", "thread-reply", "row-open"] },
    // The hand moves off towards the thread, an arrow again once off the row.
    { at: LEAVE + 120, on: ["hero-ptr-arrow"], off: ["hero-ptr-hand"] },
    { at: RECORD, on: ["record"] },
  ],
  paths: {
    "hero-ptr": [
      { at: REACH, x: 1090, y: 470 },
      { at: OVER - 40, to: "hero-row", x: 0, y: 1, ease: "move", arc: -38 },
      { at: OVER + 220, to: "hero-row", x: 3, y: 2, ease: "move" },
      { at: LEAVE, to: "hero-row", x: 3, y: 2, ease: "jump" },
      { at: LEAVE + 760, to: "hero-reply", fx: 0.42, fy: 1, x: 0, y: 34, ease: "move", arc: 22 },
    ],
  },
}

/** On a phone: the same beats, then a tap on the row opens the thread's own page. */
const TAP = 6200
export const heroPhoneScript: Script = {
  delay: 900,
  plays: 3,
  rest: 7000,
  steps: [...beats, { at: TAP, off: ["phone-channel"], on: ["phone-thread", "thread-page", "thread-title"] }],
}

const LABEL =
  "OneCamp's #engineering channel: the team readies the Q4 launch, then Jonas asks the Release Captain agent to post the Q3 numbers in #finance. The agent answers in the thread that it can't, because Jonas isn't a member of #finance, and the attempt is on the record."

const PHONE_LABEL =
  "OneCamp's #engineering channel on a phone: Jonas asks the Release Captain agent to post the Q3 numbers in #finance, and in the thread the agent answers that it can't, because Jonas isn't a member of #finance."

export const heroDesktop: SceneSpec = {
  ...SIZES.hero,
  label: LABEL,
  script: heroScript,
  render: () => (
    <>
      <AppFrame sidebar={<Sidebar place="channel:engineering" compact />} sheetItem="hero-wide" over={<Later part="hero-split" />}>
        <ChannelView
          name="engineering"
          people={ENGINEERING.members}
          count={ENGINEERING.memberCount}
          items={history(false)}
          arrivals={arrivals(false, "hover", <Later part="hero-row" />)}
          typing={typing(<Later part="hero-agent-typing" />)}
          placeholder="Message #engineering, or ask @Release Captain"
        />
      </AppFrame>
      <Later part="hero-pointer" />
    </>
  ),
}

export const heroPhone: SceneSpec = {
  ...SIZES.phone,
  label: PHONE_LABEL,
  script: heroPhoneScript,
  render: () => (
    <PhoneFrame>
      <div className="relative h-full w-full">
        <div className="sc absolute inset-0" data-sc-item="phone-channel" data-sc-swap="">
          <PhoneChannel
            name="engineering"
            subtitle="4 members · 1 agent"
            items={history(true)}
            arrivals={arrivals(true, undefined, <Later part="hero-phone-row" />)}
            typing={typing(<Later part="hero-agent-typing" />)}
            placeholder="Message or ask @Release"
          />
        </div>
        <Later part="hero-phone-thread" />
      </div>
    </PhoneFrame>
  ),
}

/** The record of the attempt, for the card beside the window. */
export const heroRecord = { ...STORY.record }
