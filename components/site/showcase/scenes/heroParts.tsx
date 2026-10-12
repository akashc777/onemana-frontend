import type { ReactNode } from "react"

import { Message, TypingLine, TypingStack } from "../ChannelView"
import { ReplyRow, type ThreadReply } from "../ThreadPanel"
import { Mention } from "../parts"
import { CAPTAIN, ENGINEERING, JONAS, SAM, STORY } from "../data"

/**
 * The hero's conversation, its parts shared by what the server draws (the
 * channel alone, scenes/hero.tsx) and what the browser draws once the page
 * is idle (the channel beside the thread, scenes/heroLater.tsx).
 */

const P = ENGINEERING.posts

/** The thread panel's width: the app's narrowest (360 of 360 to 560). */
export const PANEL = 360

/**
 * The conversation before the story. Sized with the window so that both of
 * its states are whole: before, every row sits under the header; after the
 * story's message and its reply row rise, the agent's checklist is the first
 * row in view. Beside the thread the channel's lines are longer and its
 * first two messages are above its top, so `narrow` leaves them out.
 */
export function history(phone: boolean, narrow = false) {
  return (
    <>
      {!phone && !narrow && (
        <>
          <Message by={P.rc.by} at={P.rc.at}>
            {P.rc.text}
          </Message>
          <Message by={P.loadTest.by} at={P.loadTest.at}>
            {P.loadTest.text}
          </Message>
        </>
      )}
      <Message by={P.checklist.by} at={P.checklist.at} provenance phone={phone}>
        {P.checklist.text}
      </Message>
      <Message by={P.rollback.by} at={P.rollback.at} forMe phone={phone}>
        <Mention kind="me">{SAM.name}</Mention> {P.rollback.text}
      </Message>
      <Message by={P.decisions.by} at={P.decisions.at} phone={phone}>
        {P.decisions.text}
      </Message>
      <Message by={P.announcement.by} at={P.announcement.at} phone={phone}>
        {P.announcement.text}
      </Message>
    </>
  )
}

export const askText = (phone: boolean) => (
  <>
    <Mention kind="agent">{CAPTAIN.name}</Mention> {phone ? STORY.ask.phoneText : STORY.ask.text}
  </>
)

/**
 * The row the thread's first reply makes under the ask. `row` is its part in
 * the story: pressed by the pointer in the channel alone ("hover"), kept
 * pressed in the channel the thread opens beside ("open").
 */
export function replyRow(phone: boolean, row?: "hover" | "open") {
  return (
    <ReplyRow
      faces={[CAPTAIN]}
      count={1}
      last={STORY.reply.at}
      phone={phone}
      item={{ id: "row", state: "off" }}
      hover={row === "hover" ? { id: "row-hover", state: "off" } : undefined}
      open={row === "open" ? { id: "row-open", state: "off" } : undefined}
      target={row === "hover" ? "hero-row" : undefined}
    />
  )
}

/**
 * The ask, and under it the row its thread's first reply makes. `later` is
 * where the row is drawn when the browser draws it (Later), so the page
 * doesn't carry it.
 */
export function arrivals(phone: boolean, row?: "hover" | "open", later?: ReactNode) {
  return (
    <>
      <Message id="ask" state="off" by={STORY.ask.by} at={STORY.ask.at} phone={phone}>
        {askText(phone)}
      </Message>
      {later ?? replyRow(phone, row)}
    </>
  )
}

/** The agent at work, on the typing line. */
export function agentTyping() {
  return <TypingLine id="typing-agent" state="off" who={CAPTAIN.name} agent />
}

/** Jonas typing, then the agent at work, in the one typing line (`later`: where the agent's line is drawn when the browser draws it). */
export function typing(later?: ReactNode) {
  return (
    <TypingStack>
      <TypingLine id="typing-jonas" state="off" who={JONAS.name} />
      {later ?? agentTyping()}
    </TypingStack>
  )
}

export const REPLIES: ThreadReply[] = [{ by: CAPTAIN, at: STORY.reply.at, text: STORY.reply.text, item: { id: "thread-reply", state: "off" }, target: "hero-reply" }]
