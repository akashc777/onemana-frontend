import { ChannelView } from "../ChannelView"
import { PhoneThread, ThreadPanel } from "../ThreadPanel"
import { ENGINEERING, STORY } from "../data"
import { PointerLayer } from "../motion/Pointer"
import { PANEL, REPLIES, agentTyping, arrivals, askText, history, replyRow, typing } from "./heroParts"

/**
 * The hero's parts that only its story shows, drawn by the browser once the
 * page is idle (Later.tsx), not sent in the page: the channel with the
 * thread open beside it, the pointer that opens the thread, and on a phone
 * the thread's own page. Each starts out of sight (data-sc-state="off"), so
 * the first frame is the same before and after they arrive.
 */

/**
 * The channel with the thread open beside it (AppFrame's main area: its
 * padding, the frame's 8px between the two sheets), laid out whole over the
 * channel alone; the scene swaps the two at the press, as the app snaps the
 * page narrower when the panel opens.
 */
export function HeroSplit() {
  return (
    <div className="sc-split" data-sc-item="hero-split" data-sc-state="off" data-sc-swap="">
      <div className="sc-sheet flex h-full min-w-0 flex-1 flex-col">
        <ChannelView
          name="engineering"
          people={ENGINEERING.members}
          count={ENGINEERING.memberCount}
          items={history(false, true)}
          arrivals={arrivals(false, "open")}
          typing={typing()}
          placeholder="Message #engineering, or ask @Release Captain"
          narrow
        />
      </div>
      <ThreadPanel
        channel="engineering"
        width={PANEL}
        parent={{ by: STORY.ask.by, at: STORY.ask.at, text: askText(false) }}
        replies={REPLIES}
        sheet={{ id: "thread-sheet", state: "off" }}
        body={{ id: "thread-body", state: "off" }}
      />
    </div>
  )
}

/** The row the agent's reply makes under Jonas's ask, in the channel alone (the pointer presses it). */
export function HeroRow() {
  return replyRow(false, "hover")
}

/** The same row on a phone. */
export function HeroPhoneRow() {
  return replyRow(true)
}

/** The agent at work, on the typing line. */
export function HeroAgentTyping() {
  return agentTyping()
}

/** The hand that opens the thread. */
export function HeroPointer() {
  return <PointerLayer id="hero-ptr" shapes={["arrow", "hand"]} />
}

/** On a phone, the thread's own page, over the channel until the tap. */
export function HeroPhoneThread() {
  return (
    <div className="sc absolute inset-0" data-sc-item="phone-thread" data-sc-state="off" data-sc-swap="">
      <PhoneThread
        parent={{ by: STORY.ask.by, at: STORY.ask.at, text: askText(true) }}
        replies={REPLIES.map((r) => ({ ...r, item: undefined }))}
        page={{ id: "thread-page", state: "off" }}
        title={{ id: "thread-title", state: "off" }}
      />
    </div>
  )
}
