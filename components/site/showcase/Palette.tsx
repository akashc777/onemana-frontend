import "./palette.css"

import { Fragment, type ReactNode } from "react"
import { CheckSquare, FileText, FolderKanban, Hash, MessageSquare, Search, Shield } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { CampHue } from "@/lib/campHue"

import { AgentFace, Ico, Kbd } from "./parts"
import { PROJECTS, SAM } from "./data"

/**
 * ⌘K, the command palette (onecamp-fe components/ui/CommandPalette.tsx and
 * components/ai/PaletteAsk.tsx; design v3, shell P1, P2 and P4): one field
 * to search, jump and ask. Search lists the places that match, then the
 * workspace's messages, docs and tasks, then "Ask OneCamp AI"; Ask answers
 * from what the asker can open, with its sources and the line that says so.
 *
 * Server components with no state. A scene draws both modes at once, laid
 * out from the start, and SceneDirector turns the palette (the "pal-ask"
 * item) from Search to Ask and brings the answer in; palette.css says how.
 */

/** Which picture of a scene is drawn: its first (Search, before the moment) or its last (Ask, answered). */
export type At = "start" | "end"

type State = "on" | "off" | undefined

/** A scene item's attributes (SceneDirector): its id and its state in this picture. */
function item(id: string, state: State) {
  return { "data-sc-item": id, "data-sc-state": state }
}

/* ------------------------------------------------------------------ data */

/** The question the scenes ask. */
export const QUESTION = "What’s left before launch?"

/**
 * #engineering's and #design's hues. A message hit wears its channel's hue
 * (hitHueId), which the app hashes from the channel's id; the demo's ids are
 * not known here, so these stand in.
 */
const ENGINEERING_HUE: CampHue = "sky"
const DESIGN_HUE: CampHue = "dusk"
const Q4 = PROJECTS[0]

/**
 * OneCamp AI's answer, in the parts it streams in. Its facts are the demo's:
 * the checklist post in #engineering, the announcement task (Sam's, due
 * today) and the rollback decision in the Launch sync notes.
 */
const ANSWER: ReactNode[] = [
  "Two things.",
  <>
    The <b>load test</b>: 11 of 12 checklist items are done,
  </>,
  "and Release Captain won’t mark the last one",
  "until Maya posts the numbers in #engineering.",
  <>
    Then the <b>launch announcement</b>,
  </>,
  "which is yours and due today.",
  "The rollback steps are already",
  "in the Launch sync notes.",
]

/** The answer's parts, for a scene's script (pal-a1 to pal-aN, each with its caret pal-c1 to pal-cN). */
export const ANSWER_PARTS = ANSWER.length

/** Its sources as the app labels them (PaletteAsk sourceLabel: a post by its channel, else 27 characters of the snippet). */
const SOURCES: { icon: LucideIcon; label: string }[] = [
  { icon: Hash, label: "engineering" },
  { icon: CheckSquare, label: "Write the launch announceme…" },
  { icon: FileText, label: "Rollback, if Thursday goes…" },
]

/* ----------------------------------------------------------------- parts */

/** What matched, in weight. */
function Hl({ children }: { children: ReactNode }) {
  return <span className="sc-pal-hl">{children}</span>
}

/** A project's 20px tile: its gradient, a white folder. */
function ProjectMark({ hue }: { hue: CampHue }) {
  return (
    <span className="sc-pal-ptile" data-hue={hue}>
      <Ico icon={FolderKanban} size={12} />
    </span>
  )
}

/** A search hit's 20px tile: its identity hue's tint and its kind's glyph. */
function HitMark({ hue, icon }: { hue: CampHue; icon: LucideIcon }) {
  return (
    <span className="sc-pal-tile" data-hue={hue}>
      <Ico icon={icon} size={14} />
    </span>
  )
}

/**
 * One row (PaletteRow): its mark, its title, its meta, its keys, and when it
 * is selected the press fill with the accent tick and ⏎ (not on a phone).
 * `sel` and `lit` are scene items: the selection that moves to a row, and the
 * ⏎ that lights when it is pressed.
 */
function Row({
  mark,
  children,
  meta,
  keys,
  ask,
  selected,
  sel,
  lit,
  phone,
}: {
  mark: ReactNode
  children: ReactNode
  meta?: ReactNode
  keys?: string
  ask?: boolean
  selected?: boolean
  sel?: { id: string; state: State }
  lit?: { id: string; state: State }
  phone?: boolean
}) {
  return (
    <div className="sc-pal-row" data-ask={ask ? "" : undefined}>
      {(selected || sel) && <span className="sc-pal-sel" {...(sel ? item(sel.id, sel.state) : {})} />}
      <span className="sc-pal-mark">{mark}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {meta ? <span className="sc-pal-meta">{meta}</span> : null}
      {keys ? (
        <span className="sc-pal-keys">
          <Kbd>{keys}</Kbd>
        </span>
      ) : null}
      {selected && !phone ? (
        <span className="sc-pal-enter">
          <Kbd>⏎</Kbd>
          {lit ? (
            <span className="sc-pal-lit" {...item(lit.id, lit.state)}>
              ⏎
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}

function Group({ children }: { children: ReactNode }) {
  return <div className="sc-pal-group">{children}</div>
}

/** Search | Ask: the knob under the chosen word. Ask's Tab key only where there is a keyboard. */
function Segmented({ phone }: { phone?: boolean }) {
  return (
    <span className="sc-pal-seg">
      <span className="sc-pal-knob" />
      <span data-seg="search">Search</span>
      <span data-seg="ask">
        Ask
        {!phone && <Kbd>Tab</Kbd>}
      </span>
    </span>
  )
}

/** The field's row: what leads it (the search glyph, or in Ask the agent), the words with the caret, and Search | Ask (Cancel on a phone). */
function Field({ query, phone }: { query: string; phone?: boolean }) {
  return (
    <div className="sc-pal-input">
      <span className="sc-pal-lead">
        <span data-lead="search" className="flex">
          <Ico icon={Search} size={18} />
        </span>
        <span data-lead="ask" className="flex">
          <AgentFace size={20} />
        </span>
      </span>
      <span className="sc-pal-field">
        <span className="min-w-0 truncate">{query}</span>
        <span className="sc-pal-tcaret" />
      </span>
      {phone ? <span className="sc-pal-cancel">Cancel</span> : <Segmented />}
    </div>
  )
}

/** The hints under the list, each mode's laid out in place (the palette shows one). */
function Foot() {
  return (
    <div className="sc-pal-foot">
      <div data-for="search">
        <span>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> move
        </span>
        <span>
          <Kbd>⏎</Kbd> open
        </span>
        <span>
          <Kbd>⌘</Kbd>
          <Kbd>⏎</Kbd> open beside
        </span>
        <span className="ml-auto">
          <Kbd>Esc</Kbd> close
        </span>
      </div>
      <div data-for="ask">
        <span>
          <Kbd>⏎</Kbd> ask
        </span>
        <span>
          <Kbd>⌘</Kbd>
          <Kbd>⏎</Kbd> continue in the AI panel
        </span>
        <span className="ml-auto">
          <Kbd>Tab</Kbd> back to search
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- palettes */

/**
 * The palette (.palette): the field, Search | Ask under it on a phone, the
 * list, and on a computer the hints. `mode` is the item a scene turns from
 * Search to Ask (a still of Ask passes "on"); `cap` is the list's most,
 * min(60% of the window, 440px), which a phone's palette does not have.
 */
function Panel({
  phone,
  query,
  mode,
  cap,
  children,
}: {
  phone?: boolean
  query: string
  mode?: { id?: string; state: State }
  cap?: number
  children: ReactNode
}) {
  return (
    <div className="sc-pal" data-phone={phone ? "" : undefined} data-sc-item={mode?.id} data-sc-state={mode?.state}>
      <Field query={query} phone={phone} />
      {phone && (
        <div className="sc-pal-phone-seg">
          <Segmented phone />
        </div>
      )}
      <div className="sc-pal-list" style={cap && !phone ? { maxHeight: cap } : undefined}>
        {children}
      </div>
      {!phone && <Foot />}
    </div>
  )
}

/** The list's most in a window `h` tall (.palette-list max-height). */
export const listCap = (h: number) => Math.min(Math.round(h * 0.6), 440)

/**
 * Search for "launch" on a computer, as the demo answers it: the places
 * whose names match first (Jump to), then the workspace's messages and
 * tasks with the word in weight, then Search everything and Ask, cut by the
 * list's edge. The first row is selected, as it is while typing.
 */
export function LaunchSearch({ cap }: { cap?: number }) {
  const query = "launch"
  return (
    <Panel query={query} cap={cap}>
      <Group>Jump to</Group>
      <Row mark={<Ico icon={FileText} />} meta="Doc" selected>
        <Hl>Launch</Hl> sync notes
      </Row>
      <Row mark={<ProjectMark hue={Q4.hue} />} meta="Project">
        Q4 <Hl>launch</Hl>
      </Row>
      <Row mark={<Ico icon={FileText} />} meta="Doc">
        Q4 <Hl>launch</Hl> plan
      </Row>
      <Group>Messages, docs and tasks</Group>
      <Row mark={<HitMark hue={Q4.hue} icon={CheckSquare} />} meta={`Q4 launch · ${SAM.name}`}>
        Write the <Hl>launch</Hl> announcement
      </Row>
      <Row mark={<HitMark hue={ENGINEERING_HUE} icon={MessageSquare} />} meta={`#engineering · ${SAM.name}`}>
        Release candidate for the Q4 <Hl>launch</Hl> is up on staging. Everything on the checklist in the Q4 <Hl>launch</Hl> plan is green except the
        load test.
      </Row>
      <Row mark={<HitMark hue={Q4.hue} icon={CheckSquare} />} meta={`Q4 launch · ${SAM.name}`}>
        Book the <Hl>launch</Hl> retro
      </Row>
      <Row mark={<HitMark hue={DESIGN_HUE} icon={MessageSquare} />} meta="#design · Maya Chen">
        Final hero for the <Hl>launch</Hl> page is in. The dark version finally passes contrast on the small text.
      </Row>
      <Row mark={<Ico icon={Search} />}>Search everything for “{query}”</Row>
      <Row mark={<AgentFace size={20} />} keys="Tab" ask>
        Ask OneCamp AI: “{query}”
      </Row>
    </Panel>
  )
}

/**
 * The question, answered (PaletteAsk): the answer at 15/23 in the parts it
 * streams in, each with the caret that follows it, then the sources and the
 * shield line. Before the first word, the thinking line holds its place.
 */
function Answer({ at }: { at: At }) {
  const s = (id: string, end: State) => item(id, at === "end" ? end : "off")
  return (
    <div className="sc-pal-answer">
      <div className="sc-pal-think" {...s("pal-think", "off")}>
        <span className="sc-pal-dots">
          <i />
          <i />
          <i />
        </span>
        Reading what you can open…
      </div>
      <p>
        {ANSWER.map((part, i) => (
          <Fragment key={i}>
            <span {...s(`pal-a${i + 1}`, "on")}>{part}</span>
            <span className="sc-pal-caret-at">
              <span className="sc-pal-caret" {...s(`pal-c${i + 1}`, "off")} />
            </span>
            {i < ANSWER.length - 1 ? " " : null}
          </Fragment>
        ))}
      </p>
      <div className="sc-pal-sources sc-pal-rise" {...s("pal-src", "on")}>
        {SOURCES.map((src) => (
          <span key={src.label} className="sc-pal-source">
            <Ico icon={src.icon} size={14} />
            <span className="truncate">{src.label}</span>
          </span>
        ))}
      </div>
      <div className="sc-pal-prov sc-pal-rise" {...s("pal-prov", "on")}>
        <Ico icon={Shield} size={12} />
        Answered from what you can open · on the record
      </div>
    </div>
  )
}

/**
 * The question typed into Search: the messages and tasks that hold its
 * words, Search everything, and Ask OneCamp AI with the question. On a
 * computer the Ask row is the selected one (one ↑ from the top, as the list
 * loops); on a phone the first row is, until a tap selects Ask.
 */
function QuestionResults({ phone, at }: { phone?: boolean; at: At }) {
  const end = at === "end"
  return (
    <>
      <Group>Messages, docs and tasks</Group>
      <Row
        mark={<HitMark hue={ENGINEERING_HUE} icon={MessageSquare} />}
        meta="#engineering · Release Captain"
        phone={phone}
        sel={phone ? { id: "pal-sel-first", state: end ? "off" : undefined } : undefined}
      >
        …The load test is the one <Hl>left</Hl>, and I will not mark it until someone posts the numbers here.
      </Row>
      <Row mark={<HitMark hue={Q4.hue} icon={CheckSquare} />} meta={`Q4 launch · ${SAM.name}`} phone={phone}>
        Write the <Hl>launch</Hl> announcement
      </Row>
      {phone && (
        <>
          <Row mark={<HitMark hue={ENGINEERING_HUE} icon={MessageSquare} />} meta="#engineering · Jonas Weber" phone>
            @Sam Rivera can we get the rollback steps into the <Hl>Launch</Hl> sync notes <Hl>before</Hl> Thursday?
          </Row>
          <Row mark={<HitMark hue={ENGINEERING_HUE} icon={MessageSquare} />} meta={`#engineering · ${SAM.name}`} phone>
            Release candidate for the Q4 <Hl>launch</Hl> is up on staging.
          </Row>
        </>
      )}
      <Row mark={<Ico icon={Search} />} phone={phone}>
        Search everything for “{QUESTION}”
      </Row>
      <Row
        mark={<AgentFace size={20} />}
        keys={phone ? undefined : "Tab"}
        ask
        phone={phone}
        selected={!phone}
        sel={phone ? { id: "pal-sel-ask", state: end ? "on" : "off" } : undefined}
        lit={phone ? undefined : { id: "pal-lit", state: "off" }}
      >
        Ask OneCamp AI: “{QUESTION}”
      </Row>
    </>
  )
}

/**
 * The question, as a scene draws it: Search with the question typed and Ask
 * answered, both laid out in one cell. At "start" it is Search (what a
 * reader without JavaScript sees, complete); at "end" it is Ask, answered.
 * `only` draws one mode alone, at that mode's own height, as a still.
 */
export function QuestionPalette({ at = "start", phone, only, cap }: { at?: At; phone?: boolean; only?: "search" | "ask"; cap?: number }) {
  if (only) {
    return (
      <Panel phone={phone} query={QUESTION} cap={cap} mode={{ state: only === "ask" ? "on" : undefined }}>
        {only === "ask" ? (
          <div data-layer="ask">
            <Answer at="end" />
          </div>
        ) : (
          <QuestionResults phone={phone} at="start" />
        )}
      </Panel>
    )
  }
  return (
    <Panel phone={phone} query={QUESTION} cap={cap} mode={{ id: "pal-ask", state: at === "end" ? "on" : undefined }}>
      <div className="sc-pal-stack">
        <div data-layer="search">
          <QuestionResults phone={phone} at={at} />
        </div>
        <div data-layer="ask">
          <Answer at={at} />
        </div>
      </div>
    </Panel>
  )
}

/**
 * The palette over the app (the dialog's overlay and content): the scrim
 * over the whole window, and the panel hanging from 14% of its height,
 * min(640px, the window less 32px) wide.
 */
export function PaletteOver({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  return (
    <div className="sc sc-pal-over">
      <div className="sc-pal-scrim" />
      <div className="sc-pal-slot" style={{ top: Math.round(h * 0.14), width: Math.min(640, w - 32) }}>
        {children}
      </div>
    </div>
  )
}
