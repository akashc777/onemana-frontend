import type { ReactNode } from "react"
import { ArrowLeft, ArrowUp, AtSign, Clock, Hash, Headphones, Mic, MoreHorizontal, Plus, Search, ShieldCheck, Smile, Type } from "lucide-react"

import { AgentFace, BotFace, DayPill, Face, Ico, Kbd, Tag } from "./parts"
import type { Agent, Person } from "./data"

/**
 * A channel (components/channel/chanelIdDesktop, design v3 chat C01 to C59):
 * the 52px header on the sheet, the conversation, the typing line and the
 * composer. The conversation is bottom-anchored like the app's: its rows sit
 * on the typing line, and anything a scene adds arrives below them (a
 * story's `arrivals`, laid out from the start and revealed by
 * SceneDirector, so nothing is ever laid out twice).
 */

export function ChannelHeader({ name, people, agents = 1, count, topic = true }: { name: string; people: Person[]; agents?: number; count: number; topic?: boolean }) {
  return (
    <div className="sc-head">
      <div className="-ml-1.5 flex min-w-0 items-center gap-2 px-1.5 py-1">
        <Ico icon={Hash} size={18} className="ink-3" />
        <span className="truncate t-heading ink">{name}</span>
        {topic && <span className="sc-head-topic">Add a topic</span>}
      </div>
      <div className="min-w-0 flex-1" />
      <div className="flex flex-none items-center gap-1">
        <span className="sc-stack">
          <span>
            {people.slice(0, 4 - agents).map((p) => (
              <Face key={p.name} person={p} size={22} />
            ))}
            {Array.from({ length: agents }, (_, i) => (
              <AgentFace key={i} size={22} />
            ))}
          </span>
          <span className="t-meta tnum ink-3">{count}</span>
        </span>
        {/* HuddleButton: a secondary sm, its icon 14px. */}
        <span className="ml-1 sc-btn sc-btn-14" data-variant="secondary">
          <Ico icon={Headphones} size={14} />
          Huddle
        </span>
        <span className="sc-iconbtn">
          <Ico icon={Search} />
        </span>
        <span className="sc-iconbtn">
          <Ico icon={MoreHorizontal} />
        </span>
      </div>
    </div>
  )
}

type Author = Person | Agent

const isAgent = (a: Author): a is Agent => (a as Agent).kind === "agent"

/**
 * One message (baseMessageCard): the 36px face, the name line (name, the
 * Agent tag, the time) and the 15/23 body; under an agent's, the line that
 * says whose behalf it acted on (agentProvenance). A mention of you takes
 * the accent's ground and bar (C14).
 */
export function Message({
  by,
  at,
  children,
  forMe,
  provenance,
  after,
  phone,
  id,
  state,
}: {
  by: Author
  at: string
  children: ReactNode
  forMe?: boolean
  /** The agent's provenance line: who it acted for, or the general line. */
  provenance?: { for?: string } | true
  /** Anything under the body, before the provenance (a refusal tag). */
  after?: ReactNode
  phone?: boolean
  /** A scene's handle on it (data-sc-item), and whether it starts out of sight. */
  id?: string
  state?: "off"
}) {
  const size = phone ? 32 : 36
  return (
    <div className={phone ? "sc-msg sc-msg-phone" : "sc-msg"} data-for-me={forMe ? "" : undefined} data-sc-item={id} data-sc-state={state}>
      <div style={{ width: size, height: size }}>{isAgent(by) ? <AgentFace size={size} /> : <Face person={by} size={size} />}</div>
      <div className="min-w-0">
        <div className="sc-msg-name">
          <b className="truncate">{by.name}</b>
          {isAgent(by) && <Tag kind="agent" />}
          <time>{at}</time>
        </div>
        <div className="sc-msg-body">{children}</div>
        {after}
        {provenance && isAgent(by) && (
          <p className="sc-prov">
            <Ico icon={ShieldCheck} size={12} />
            <span className="min-w-0 truncate">
              {provenance === true || !provenance.for ? (
                "Acts only for whoever asks · can do only what they can · on the record"
              ) : (
                <>
                  Acting for <span className="ink-2">{provenance.for}</span> · can do only what {provenance.for.split(" ")[0]} can · on the record
                </>
              )}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

/** The Check-in's question as a prompt card (C13), with who answered and Answer. */
export function CheckinMessage({ question, answered, at, faces }: { question: string; answered: number; at: string; faces: Person[] }) {
  return (
    <div className="sc-msg">
      <div style={{ width: 36, height: 36 }}>
        <BotFace size={36}>
          <Clock size={20} strokeWidth={1.25} absoluteStrokeWidth aria-hidden="true" />
        </BotFace>
      </div>
      <div className="min-w-0">
        <div className="sc-msg-name">
          <b>Check-in</b>
          <Tag kind="bot" />
          <time>{at}</time>
        </div>
        <div className="sc-checkin">
          <p className="t-body w-semibold">{question}</p>
          <div className="sc-checkin-foot">
            {faces.length > 0 && (
              <span className="flex">
                {faces.map((p, i) => (
                  <span key={p.name} className="rounded-full" style={{ marginLeft: i ? -6 : 0, boxShadow: "0 0 0 2px var(--sc-sunken)" }}>
                    <Face person={p} size={20} />
                  </span>
                ))}
              </span>
            )}
            <span className="t-meta tnum ink-3">{answered} answered</span>
            <span className="ml-auto sc-btn" data-variant="primary">
              Answer
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Two typing lines in the one place, one shown at a time (a person typing, then an agent at work). */
export function TypingStack({ children }: { children: ReactNode }) {
  return <div className="sc-typing-stack">{children}</div>
}

/** Who is typing (C59): a 22px line that is always there; an agent at work in its own ink. */
export function TypingLine({ who, agent, id, state }: { who: string; agent?: boolean; id?: string; state?: "off" }) {
  return (
    <div className="sc-typing" data-agent={agent ? "" : undefined} data-sc-item={id} data-sc-state={state}>
      <span>
        <i className="sc-bob" />
        <i className="sc-bob" style={{ animationDelay: "0.15s" }} />
        <i className="sc-bob" style={{ animationDelay: "0.3s" }} />
      </span>
      <span className="truncate">{agent ? `${who} is working` : `${who} is typing`}</span>
    </div>
  )
}

/** The composer (chatComposerShell, C38): the words, then +, Aa, emoji, @ and Record, the send hint and Send. */
export function Composer({ placeholder, hint = true }: { placeholder: string; hint?: boolean }) {
  return (
    <div className="sc-composer">
      <div className="sc-composer-text truncate">{placeholder}</div>
      <div className="sc-composer-row">
        {[Plus, Type, Smile, AtSign, Mic].map((I, i) => (
          // The emoji picker's trigger sits in a wrapper 2px wider each side.
          <span key={i} className="sc-tool" style={I === Smile ? { margin: "0 2px" } : undefined}>
            <Ico icon={I} />
          </span>
        ))}
        <div className="min-w-0 flex-1" />
        {hint && (
          <span className="mr-2 flex items-center gap-1 whitespace-nowrap t-meta ink-3">
            <Kbd>⏎</Kbd> send <span className="ml-1.5">
              <Kbd>⇧⏎</Kbd>
            </span>{" "}
            new line
          </span>
        )}
        {/* SendSplit: Send, and Send later's chevron, which keeps its 20px while there is nothing to send. */}
        <span className="flex flex-none items-center">
          <span className="sc-send">
            <Ico icon={ArrowUp} />
          </span>
          <span aria-hidden="true" className="w-5 flex-none" />
        </span>
      </div>
    </div>
  )
}

/**
 * The conversation between the header and the composer. `items` sit on the
 * typing line; `arrivals` are laid out under them, out of sight, for a scene
 * to bring up (SceneDirector moves the track by their measured height).
 */
export function Conversation({ items, arrivals, typing, phone }: { items: ReactNode; arrivals?: ReactNode; typing?: ReactNode; phone?: boolean }) {
  return (
    <>
      <div className="sc-list" data-sc-list="">
        <div className="sc-track" data-sc-track="">
          {items}
          {arrivals && (
            <div className="sc-arrivals" data-sc-arrivals="">
              {arrivals}
            </div>
          )}
        </div>
      </div>
      <div className={phone ? "flex-none px-4" : "w-full max-w-[840px] flex-none px-5"}>{typing ?? <div className="sc-typing" />}</div>
    </>
  )
}

/** A whole channel on the sheet: header, conversation, typing line and composer. */
export function ChannelView({
  name,
  people,
  count,
  agents = 1,
  items,
  arrivals,
  typing,
  placeholder,
  hint = true,
  narrow = false,
}: {
  name: string
  people: Person[]
  count: number
  /** The channel's agents, drawn as squares at the end of its member stack. */
  agents?: number
  items: ReactNode
  arrivals?: ReactNode
  typing?: ReactNode
  placeholder: string
  hint?: boolean
  /** Beside an open panel: the header keeps the channel's name, not "Add a topic", and the composer drops its hint. */
  narrow?: boolean
}) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      <ChannelHeader name={name} people={people} agents={agents} count={count} topic={!narrow} />
      <Conversation items={items} arrivals={arrivals} typing={typing} />
      <div className="flex-none bg-sheet px-5 pb-[18px]">
        <div className="w-full max-w-[800px]">
          <Composer placeholder={placeholder} hint={hint && !narrow} />
        </div>
      </div>
    </div>
  )
}

/**
 * The same channel on a phone (channelIdMobile, C62): the 52px bar with the
 * centred title and its line, the conversation at 16/24 with 32px faces,
 * and the phone composer: a 36px +, the words, the smile and the mic.
 */
export function PhoneChannel({
  name,
  subtitle,
  items,
  arrivals,
  typing,
  placeholder,
}: {
  name: string
  subtitle: string
  items: ReactNode
  arrivals?: ReactNode
  typing?: ReactNode
  placeholder: string
}) {
  return (
    <div className="sc-phone h-full w-full">
      {/* The shell's phone bar: equal sides (1fr each), so the title sits in
          the bar's middle whatever each side holds; no hairline, as the page
          itself doesn't scroll in a conversation. */}
      <div className="sc-phone-bar">
        <div className="flex min-w-0 items-center justify-start">
          {/* A 44px button, its icon 16px (the Button's [&_svg]:size-4 wins over the icon's own size). */}
          <span className="sc-iconbtn" style={{ width: 44, height: 44 }}>
            <Ico icon={ArrowLeft} size={16} />
          </span>
        </div>
        <div className="flex min-w-0 max-w-full flex-col items-center px-2">
          <span className="flex min-w-0 max-w-full items-center gap-1.5 t-title-3 ink" style={{ lineHeight: "22px" }}>
            <span className="ink-3">#</span>
            <span className="truncate">{name}</span>
          </span>
          <span className="max-w-full truncate t-meta ink-3">{subtitle}</span>
        </div>
        <div className="flex min-w-0 items-center justify-end">
          {/* The huddle: a 32px moss circle in a 44px target. */}
          <span className="grid size-11 place-items-center">
            <span className="grid size-8 place-items-center rounded-full" data-hue="moss" style={{ background: "var(--hue-tint)", color: "var(--hue-ink)" }}>
              <Ico icon={Headphones} size={16} />
            </span>
          </span>
          <span className="sc-iconbtn" style={{ width: 44, height: 44 }}>
            <Ico icon={MoreHorizontal} size={16} />
          </span>
        </div>
      </div>
      <Conversation items={items} arrivals={arrivals} typing={typing} phone />
      <div className="flex-none px-3 pb-3 pt-1">
        <div className="sc-phone-composer">
          <span className="sc-round">
            <Ico icon={Plus} size={20} />
          </span>
          <span className="min-w-0 flex-1 truncate py-1.5 t-base ink-3">{placeholder}</span>
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
