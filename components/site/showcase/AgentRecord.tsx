import type { ReactNode } from "react"
import { Download, Inbox, Link2, LoaderCircle, Shield, ShieldCheck, SlidersHorizontal } from "lucide-react"

import "./record.css"
import { AgentFace, Ico, Spark } from "./parts"

/**
 * The agents record (components/ai/aiActivityFeedRow, hub.md AI14), as the
 * Inbox's Agents tab shows it: every attempt an agent makes is written down
 * before it acts, and a refusal is the permission system answering, in the
 * agent's tint with a shield.
 */
export type Outcome = "refused" | "attempt" | "done"

export type RecordEntry = {
  /** The agent, or "The governance drill". */
  who: string
  /** "tried to", "is about to try". */
  verb: string
  /** "post in #finance". */
  object: string
  outcome: Outcome
  /** Why, or what the check does. */
  why: string
  at: string
  /** A practice run carries a neutral Drill tag. */
  drill?: boolean
}

const OUTCOME: Record<Outcome, string> = { refused: "Refused by permissions", attempt: "Attempt recorded", done: "Done" }

/** The outcome tag (aiActivityFeedRow OutcomeTag). */
function OutcomeTag({ outcome }: { outcome: Outcome }) {
  return (
    <span className="sc-outcome" data-outcome={outcome}>
      {outcome === "refused" && <Ico icon={Shield} size={12} />}
      {OUTCOME[outcome]}
    </span>
  )
}

/** One entry (a feed HubRow): the agent's square with its kind badge, the sentence and its outcome, why, and when. */
export function RecordRow({ e, item, state, meta = true, link }: { e: RecordEntry; item?: string; state?: "off" | "on"; meta?: boolean; link?: string }) {
  return (
    <div className="sc-feedrow" data-sc-item={item} data-sc-state={state} data-sc-enter={item ? undefined : ""}>
      <span aria-hidden="true" className="relative">
        {/* The chain link in the gutter (aiActivityFeedRow): Prove it puts it
            there small while it checks, then ticks it to moss. */}
        {link && (
          <span className="sc-chain" data-sc-item={link} data-sc-state="off">
            <span className="sc-chain-wait">
              <Ico icon={Link2} size={14} />
            </span>
            <span className="sc-chain-ok" data-sc-item={`${link}-ok`} data-sc-state="off">
              <Ico icon={Link2} size={14} />
            </span>
          </span>
        )}
      </span>
      <span className="sc-feedrow-lead">
        <AgentFace size={32} />
        <span className="sc-kind">{e.outcome === "refused" ? <Ico icon={Shield} size={10} /> : <Spark size={10} />}</span>
      </span>
      <span className="min-w-0">
        <span className="block min-w-0 truncate t-ui ink-2">
          <b className="w-medium ink">{e.who}</b> {e.verb} <b className="w-medium ink">{e.object}</b>
          {e.drill && (
            <span className="ml-1.5 sc-outcome" data-outcome="drill">
              Drill
            </span>
          )}
          <span className="ml-1.5">
            <OutcomeTag outcome={e.outcome} />
          </span>
        </span>
        <span className="mt-px block min-w-0 truncate t-ui-sm ink-2" style={{ lineHeight: "20px" }}>
          {e.why}
        </span>
      </span>
      {meta ? <span className="sc-feedrow-meta">{e.at}</span> : <span />}
    </div>
  )
}

/** A secondary sm button (components/ui/button); `busy` turns its icon into the spinner. */
export function Btn({ icon, children, busy, target }: { icon?: typeof Download; children: ReactNode; busy?: boolean; target?: string }) {
  return (
    <span className="sc-btn" data-variant="secondary" data-sc-target={target}>
      {busy ? <Ico icon={LoaderCircle} size={16} className="sc-spin" /> : icon && <Ico icon={icon} size={16} />}
      {children}
    </span>
  )
}

/**
 * The Inbox on its Agents tab (activityListTabs, hubFrame, activityFeedFrame):
 * the header with the tabs, the record's own line with Download and Prove it,
 * and the entries in a 760px column.
 */
export function AgentRecordView({
  entries,
  arrivals,
  proving,
  phone,
}: {
  entries: RecordEntry[]
  arrivals?: ReactNode
  /** Prove it, played: each entry's link ticks moss in turn (link-0, link-1...), and the toolbar's line gives way to the result. */
  proving?: { result: string }
  /** On a phone the header is the tabs alone and the toolbar's line is hidden (hubFrame, activityFeedFrame). */
  phone?: boolean
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sc-hubhead" style={phone ? { paddingLeft: 16, paddingRight: 12 } : undefined}>
        {!phone && (
          <span className="flex flex-none items-center gap-2 t-heading ink">
            <Ico icon={Inbox} size={16} className="ink-2" />
            Inbox
          </span>
        )}
        <div className="sc-hubtabs">
          <span>Priority</span>
          <span>All</span>
          <span>Mentions</span>
          <span data-on="">Agents</span>
        </div>
        <span className="sc-iconbtn">
          <Ico icon={SlidersHorizontal} />
        </span>
      </div>
      <div className="flex min-h-0 w-full max-w-[760px] flex-1 flex-col">
        <div className={`relative flex h-11 flex-none items-center justify-between gap-2 ${phone ? "px-4" : "px-6"}`}>
          <div className={`min-w-0 flex-1 self-stretch ${phone ? "" : "relative"}`}>
            {!phone && (
              <p className="absolute inset-0 flex items-center t-ui-sm ink-2" data-sc-item={proving ? "record-line" : undefined}>
                <span className="truncate">Your own record: what agents did as you, and what they were refused.</span>
              </p>
            )}
            {proving && (
              <p className="sc-proved" data-sc-item="proved" data-sc-state="off" data-wide={phone ? "" : undefined}>
                <Ico icon={ShieldCheck} size={16} />
                <span className="truncate tnum">{proving.result}</span>
              </p>
            )}
          </div>
          {/* On a phone the result takes the whole row, and the buttons give way
              to it. While it checks, Prove it is busy (MyAIActivityCard): its
              spinner and "Checking 4 entries…", drawn as a row of its own over
              the resting one, so the buttons never move. */}
          <span className="sc-actions" data-sc-item={proving && phone ? "record-actions" : undefined}>
            <span data-sc-item={proving ? "prove-rest" : undefined}>
              <Btn icon={Download}>Download the record</Btn>
              <Btn icon={ShieldCheck} target={proving ? "prove-btn" : undefined}>
                Prove it
              </Btn>
            </span>
            {proving && (
              <span data-sc-item="prove-busy" data-sc-state="off">
                <Btn icon={Download}>Download the record</Btn>
                <Btn busy>Checking {entries.length} entries…</Btn>
              </span>
            )}
          </span>
        </div>
        {/* px-3 on a phone too: at the app's px-1 the chain links Prove it ticks sit off the sheet's edge. */}
        <div className="relative min-h-0 flex-1 px-3">
          {arrivals}
          {entries.map((e, i) => (
            <RecordRow key={i} e={e} link={proving ? `link-${i}` : undefined} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * One entry on its own, on the floating surface: the hero's annotation, the
 * record that the refusal it shows was written.
 */
export function RecordCard({ e }: { e: RecordEntry }) {
  return (
    <div className="sc sc-recordcard">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5" style={{ borderColor: "var(--sc-line)" }}>
        <span className="flex min-w-0 items-center gap-1.5 t-meta ink-3">
          <Ico icon={ShieldCheck} size={12} style={{ color: "var(--sc-agent)" }} />
          <span className="truncate">On the record, before it acted</span>
        </span>
        <Btn icon={ShieldCheck}>Prove it</Btn>
      </div>
      <div className="px-1">
        <RecordRow e={e} meta={false} />
      </div>
    </div>
  )
}
