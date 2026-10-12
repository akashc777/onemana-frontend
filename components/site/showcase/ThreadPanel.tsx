import "./thread.css"

import type { ReactNode } from "react"
import { ArrowLeft, ArrowUp, ChevronRight, MessageSquare, Mic, Plus, ShieldCheck, Smile, Type, X } from "lucide-react"

import { AgentFace, Face, Ico, Tag } from "./parts"
import type { Agent, Person } from "./data"

/**
 * A THREAD (components/rightPanel/channelComments, design v3 chat C35 and
 * C36): the row under a message that has replies, the panel that opens
 * beside the channel when it is pressed, and the same thread on a phone,
 * where it is a page of its own.
 */

type Author = Person | Agent
const isAgent = (a: Author): a is Agent => (a as Agent).kind === "agent"

function AuthorFace({ by, size }: { by: Author; size: number }) {
  return isAgent(by) ? <AgentFace size={size} /> : <Face person={by} size={size} />
}

/** A scene's handle on a part: its item name and whether it starts out of sight. */
type Part = { id: string; state?: "off" }
const part = (p?: Part) => (p ? { "data-sc-item": p.id, "data-sc-state": p.state } : {})

/**
 * The thread under a message (messageReplyCount, C35): the faces of who
 * replied (20px, a ring of the sheet), "1 reply" in the accent at 590 and
 * when the last came. On a computer the pointer lifts it into a pill on the
 * sheet at e1 with "View thread", and the thread open in the panel keeps the
 * pressed ground; a phone's is a little taller and has neither.
 *
 * It is laid out as its own row under the message (the message's text
 * column), so a scene can bring it in after the message: the app draws it the
 * moment the first reply lands, and the list snaps up by its height.
 */
export function ReplyRow({
  faces,
  count,
  last,
  phone,
  item,
  hover,
  open,
  target,
}: {
  faces: Author[]
  count: number
  last: string
  phone?: boolean
  item?: Part
  hover?: Part
  open?: Part
  /** Where a scene's pointer aims (data-sc-target): the count. */
  target?: string
}) {
  return (
    <div className="sc-reply" data-phone={phone ? "" : undefined} {...part(item)}>
      <span />
      <span className="sc-reply-pill">
        {hover && <span className="sc-reply-hover" {...part(hover)} />}
        {open && <span className="sc-reply-open" {...part(open)} />}
        <span className="sc-reply-faces">
          {faces.map((f) => (
            <span key={f.name}>
              <AuthorFace by={f} size={20} />
            </span>
          ))}
        </span>
        <b className="tnum" data-sc-target={target}>
          {count} {count === 1 ? "reply" : "replies"}
        </b>
        <span className="sc-reply-last tnum">Last reply {last}</span>
        {hover && (
          <span className="sc-reply-view" {...part({ id: `${hover.id}-view`, state: hover.state })}>
            View thread
            <Ico icon={ChevronRight} size={14} />
          </span>
        )}
      </span>
    </div>
  )
}

/** One message in a thread (MessageContent): the face, the name line and the words; an agent's with its tag and, as the panel draws it, its provenance. */
function ThreadMessage({
  by,
  at,
  children,
  root,
  phone,
  provenance,
  item,
  target,
}: {
  by: Author
  at: string
  children: ReactNode
  root?: boolean
  phone?: boolean
  provenance?: boolean
  item?: Part
  /** Where a scene's pointer may aim (data-sc-target): the words. */
  target?: string
}) {
  return (
    <div className="sc-tmsg" data-root={root ? "" : undefined} data-phone={phone ? "" : undefined} {...part(item)}>
      <AuthorFace by={by} size={phone ? 32 : 36} />
      <div className="min-w-0">
        <div className="sc-msg-name">
          <b className="truncate">{by.name}</b>
          {isAgent(by) && !phone && <Tag kind="agent" />}
          <time>{at}</time>
        </div>
        <div className="sc-tmsg-body" data-sc-target={target}>
          {children}
        </div>
        {provenance && isAgent(by) && !phone && (
          <p className="sc-prov">
            <Ico icon={ShieldCheck} size={12} />
            <span className="min-w-0 truncate">Acts only for whoever asks · can do only what they can · on the record</span>
          </p>
        )}
      </div>
    </div>
  )
}

/** "1 reply" and a hairline to the edge (replyDivider). */
function Divider({ count }: { count: number }) {
  return (
    <div className="sc-tdiv">
      <span className="tnum">
        {count} {count === 1 ? "reply" : "replies"}
      </span>
      <i />
    </div>
  )
}

export type ThreadReply = { by: Author; at: string; text: ReactNode; item?: Part; target?: string }

/**
 * The thread panel (rightPanel channelComments, C36), the sheet that opens
 * beside the channel: "Thread" in #channel with its close; the message the
 * thread hangs from on the sunken card; "1 reply" and its line; the replies;
 * and the compact composer with "Also send to #channel". `sheet`, `body` and
 * the replies' items let a scene bring it in as the app does: the sheet
 * slides 16px in from the right as it fades (240ms), and the thread and its
 * first replies each slide in with it.
 */
export function ThreadPanel({
  channel,
  parent,
  replies,
  width,
  sheet,
  body,
}: {
  channel: string
  parent: { by: Author; at: string; text: ReactNode }
  replies: ThreadReply[]
  width: number
  sheet?: Part
  body?: Part
}) {
  return (
    <div className="sc-tpanel" style={{ width }} {...part(sheet)}>
      <div className="sc-thead">
        <Ico icon={MessageSquare} size={16} className="ink-3" />
        <span className="t-heading ink">Thread</span>
        <span className="min-w-0 truncate t-ui-sm ink-3">in #{channel}</span>
        <span className="flex-1" />
        <span className="sc-iconbtn">
          <Ico icon={X} />
        </span>
      </div>
      <div className="sc-tbody" {...part(body)}>
        <ThreadMessage by={parent.by} at={parent.at} root>
          {parent.text}
        </ThreadMessage>
        <Divider count={replies.length} />
        {replies.map((r, i) => (
          <ThreadMessage key={i} by={r.by} at={r.at} provenance item={r.item} target={r.target}>
            {r.text}
          </ThreadMessage>
        ))}
      </div>
      <div className="sc-tfoot">
        <div className="sc-tcomposer">
          <div className="sc-tcomposer-text">Reply…</div>
          <div className="sc-tcomposer-row">
            {[Plus, Type, Smile].map((I, i) => (
              <span key={i} className="sc-tool">
                <Ico icon={I} />
              </span>
            ))}
            <span className="flex-1" />
            <span className="sc-send">
              <Ico icon={ArrowUp} />
            </span>
          </div>
        </div>
        <div className="sc-talso">
          <span className="sc-tcheck" />
          Also send to #{channel}
        </div>
      </div>
    </div>
  )
}

/**
 * The same thread on a phone (app/app/channel/[id]/[post], mobilePost): a
 * page of its own under the bar, which says "Thread" with Back and nothing
 * on its right; the message and its replies as a channel's rows; the phone
 * composer with "Reply…". The page slides 24px in from the right as it
 * comes up from .4 (240ms), and the bar's title 16px with it (PhoneTransition).
 */
export function PhoneThread({ parent, replies, page, title }: { parent: { by: Author; at: string; text: ReactNode }; replies: ThreadReply[]; page?: Part; title?: Part }) {
  return (
    <div className="sc-phone h-full w-full">
      <div className="sc-phone-bar">
        <div className="flex min-w-0 items-center justify-start">
          <span className="sc-iconbtn" style={{ width: 44, height: 44 }}>
            <Ico icon={ArrowLeft} size={16} />
          </span>
        </div>
        <div className="sc-tphone-titlebox flex min-w-0 max-w-full flex-col items-center px-2" {...part(title)}>
          <span className="truncate t-title-3 ink sc-tphone-title">Thread</span>
        </div>
        <div />
      </div>
      <div className="sc-tphone-page" {...part(page)}>
        <ThreadMessage by={parent.by} at={parent.at} phone>
          {parent.text}
        </ThreadMessage>
        <Divider count={replies.length} />
        {replies.map((r, i) => (
          <ThreadMessage key={i} by={r.by} at={r.at} phone>
            {r.text}
          </ThreadMessage>
        ))}
      </div>
      <div className="flex-none px-3 pb-3 pt-1">
        <div className="sc-phone-composer">
          <span className="sc-round">
            <Ico icon={Plus} size={20} />
          </span>
          <span className="min-w-0 flex-1 truncate py-1.5 t-base ink-2">Reply…</span>
          <span className="grid size-8 place-items-center ink-3">
            <Ico icon={Smile} size={20} />
          </span>
          <span className="sc-round">
            <Ico icon={Mic} size={20} />
          </span>
        </div>
      </div>
    </div>
  )
}
