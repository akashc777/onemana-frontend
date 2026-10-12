import "./palette.css"

import { Fragment, type ReactNode } from "react"
import { BellOff, CheckSquare, FileText, FolderKanban, Hash, MessageSquare, MessageSquarePlus, Moon, Plus, Search, Shield } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { CampHue } from "@/lib/campHue"

import { AgentFace, Face, Ico, Kbd } from "./parts"
import { JONAS, MAYA, PROJECTS, SAM } from "./data"
import { TypedText } from "./motion/parts"

/**
 * ⌘K, the command palette (onecamp-fe components/ui/CommandPalette.tsx and
 * components/ai/PaletteAsk.tsx; design v3, shell P1, P2 and P4): one field
 * to search, jump and ask. Empty, it offers what you were just in and the
 * few things people start from; as you type, the places that match answer at
 * once, the workspace's messages, docs and tasks a moment later, and the last
 * two rows always offer to search everything and to ask; Ask answers from
 * what the asker can open, streaming, with the line that says so and then its
 * sources.
 *
 * Server components with no state. A scene draws every list the palette
 * shows on the way (PlayPalette), each a whole panel laid out once and
 * stacked where the palette hangs, so the panel's height jumps with its
 * list as the app's does without anything re-laid out; the field is drawn
 * once over them, typed into by the scene (motion/engine), and the answer
 * streams in place.
 */

/** Which picture of a scene is drawn: its first (the palette just opened) or its last (asked and answered). */
export type At = "start" | "end"

type State = "on" | "off" | undefined

/** A scene item's attributes (SceneDirector): its id and its state in this picture. */
function item(id: string, state: State) {
  return { "data-sc-item": id, "data-sc-state": state }
}

/* ------------------------------------------------------------------ data */

/** The question the scenes ask. */
export const QUESTION = "What’s left before launch?"
/** How Sam types it: his own keyboard, 84ms between keys in a word. */
export const QUESTION_TYPING = { seed: "sam-asks", pace: 84 }

/**
 * #engineering's and #design's hues. A message hit wears its channel's hue
 * (hitHueId), which the app hashes from the channel's id; the demo's ids are
 * not known here, so these stand in.
 */
const ENGINEERING_HUE: CampHue = "sky"
const DESIGN_HUE: CampHue = "dusk"
const Q4 = PROJECTS[0]

/**
 * OneCamp AI's answer, its words and what is in weight. Its facts are the
 * demo's: the checklist post in #engineering, the announcement task (Sam's,
 * due today) and the rollback decision in the Launch sync notes.
 */
const ANSWER: [string, boolean][] = [
  ["Two things. The ", false],
  ["load test", true],
  [": 11 of 12 checklist items are done, and Release Captain won’t mark the last one until Maya posts the numbers in #engineering. Then the ", false],
  ["launch announcement", true],
  [", which is yours and due today. The rollback steps are already in the Launch sync notes.", false],
]
/** The answer as it streams (its characters, for the scene's timing). */
export const ANSWER_TEXT = ANSWER.map(([t]) => t).join("")
/** How it streams: a model's tokens, about 38ms apart. */
export const ANSWER_STREAM = { seed: "onecamp-ai", pace: 38 }

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
 * `sel` is the selection as a scene item (one that moves to or from the
 * row), `lit` the ⏎ that lights when it is pressed.
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
  const enter = !phone && (selected || sel)
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
      {enter ? (
        <span className="sc-pal-enter" {...(sel ? item(`${sel.id}-key`, sel.state) : {})}>
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

/**
 * The field's row: what leads it (the search glyph, or in Ask the agent),
 * the words with the caret, and Search | Ask (Cancel on a phone). In a scene
 * the words are typed (`typed`): the placeholder until the first key, then
 * the question a key at a time with the caret after it.
 */
function Field({ query, phone, typed }: { query: string; phone?: boolean; typed?: { start: boolean } }) {
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
      {typed ? (
        <span className="sc-pal-field" data-typed="">
          <span className="sc-pal-ph" {...item("pal-ph", typed.start ? undefined : "off")}>
            Search, jump, or ask…
          </span>
          <span className="min-w-0 truncate" {...item("pal-qtext", typed.start ? "off" : undefined)}>
            <TypedText id="pal-q" cadence="local" seed={QUESTION_TYPING.seed} pace={QUESTION_TYPING.pace}>
              {query}
            </TypedText>
          </span>
          <span className="sc-pal-tcaret" data-sc-caret="pal-q" />
        </span>
      ) : (
        <span className="sc-pal-field">
          <span className="min-w-0 truncate">{query}</span>
          <span className="sc-pal-tcaret" />
        </span>
      )}
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

/** The answer's words, with what is in weight. */
function AnswerWords() {
  return (
    <>
      {ANSWER.map(([t, b], i) => (
        <Fragment key={i}>{b ? <b>{t}</b> : t}</Fragment>
      ))}
    </>
  )
}

/**
 * The question, answered (PaletteAsk): the answer at 15/23, then its
 * sources and the shield line. In a scene (`play`) the answer streams in: the
 * thinking line holds the first line's place, the words arrive as a model's
 * tokens with the 7x16 caret after them, the shield line comes with the first
 * of them, and the sources once the answer is whole.
 */
function Answer({ play, at = "end" }: { play?: boolean; at?: At }) {
  const s = (id: string, start: State, end: State) => (play ? item(id, at === "end" ? end : start) : {})
  return (
    <div className="sc-pal-answer">
      {play && (
        <div className="sc-pal-think" {...s("pal-think", "off", "off")}>
          <span className="sc-pal-dots">
            <i />
            <i />
            <i />
          </span>
          Reading what you can open…
        </div>
      )}
      <div className="sc-pal-textbox">
        <p>
          {play ? (
            <TypedText id="pal-answer" cadence="stream" seed={ANSWER_STREAM.seed} pace={ANSWER_STREAM.pace}>
              <AnswerWords />
            </TypedText>
          ) : (
            <AnswerWords />
          )}
          {play && <span className="sc-pal-caret" data-sc-caret="pal-answer" {...item("pal-caret", "off")} />}
        </p>
        {/* While it streams the shield line rides under the words that are in. */}
        {play && (
          <div className="sc-pal-prov sc-pal-prov-live" {...item("pal-prov", "off")}>
            <Ico icon={Shield} size={12} />
            Answered from what you can open · on the record
          </div>
        )}
      </div>
      <div className="sc-pal-sources" {...s("pal-src", "off", "on")}>
        {SOURCES.map((src) => (
          <span key={src.label} className="sc-pal-source">
            <Ico icon={src.icon} size={14} />
            <span className="truncate">{src.label}</span>
          </span>
        ))}
      </div>
      <div className="sc-pal-prov" {...s("pal-prov-end", "off", "on")}>
        <Ico icon={Shield} size={12} />
        Answered from what you can open · on the record
      </div>
    </div>
  )
}

/**
 * The question in a row, in its quotes: what it says while it is typed (a
 * mirror of the field). The closing quote is the mirror's own, so the one
 * text that changes starts where it always did and nothing after it moves.
 */
function Asked() {
  return (
    <>
      “
      <span data-sc-mirror="pal-q" data-sc-after="”">
        {QUESTION}”
      </span>
    </>
  )
}

/** The last two rows, from the first key: Search everything, and Ask with Tab. */
function QueryRows({ phone, first, ask }: { phone?: boolean; first?: boolean; ask?: { sel?: { id: string; state: State }; lit?: { id: string; state: State }; selected?: boolean } }) {
  return (
    <>
      <Row mark={<Ico icon={Search} />} phone={phone} selected={first}>
        Search everything for <Asked />
      </Row>
      <Row mark={<AgentFace size={20} />} keys={phone ? undefined : "Tab"} ask phone={phone} selected={ask?.selected} sel={ask?.sel} lit={ask?.lit}>
        Ask OneCamp AI: <Asked />
      </Row>
    </>
  )
}

/** The Release Captain's checklist post, found by "left". */
function LeftHit({ phone, sel }: { phone?: boolean; sel?: { id: string; state: State } | true }) {
  return (
    <Row mark={<HitMark hue={ENGINEERING_HUE} icon={MessageSquare} />} meta="#engineering · Release Captain" phone={phone} selected={sel === true} sel={sel === true ? undefined : sel}>
      …The load test is the one <Hl>left</Hl>, and I will not mark it until someone posts the numbers here.
    </Row>
  )
}

/**
 * Every list the palette shows while the question is typed, as the app
 * draws it (CommandPalette): the empty palette (Recent, Suggested, Ask…);
 * at "W", Jonas Weber under Jump to (a place's name holds a w); from "Wh",
 * the workspace's search on its way; then what it finds, the older answer
 * dimmed while the next loads; the first row selected throughout, as every
 * key selects it again.
 */
const LISTS = ["pal-l0", "pal-l1", "pal-l2", "pal-l3", "pal-l4"] as const
export type ListId = (typeof LISTS)[number]

function List({ id, phone }: { id: ListId; phone?: boolean }) {
  switch (id) {
    case "pal-l0":
      return (
        <>
          <Group>Recent</Group>
          <Row mark={<Ico icon={FileText} />} meta="Doc" phone={phone} selected>
            Launch sync notes
          </Row>
          <Row mark={<ProjectMark hue={Q4.hue} />} meta="Project" phone={phone}>
            Q4 launch
          </Row>
          <Row mark={<Ico icon={CheckSquare} />} meta="Task" phone={phone}>
            Write the launch announcement
          </Row>
          <Row mark={<Ico icon={Hash} />} meta="Channel" phone={phone}>
            engineering
          </Row>
          <Row mark={<Face person={MAYA} size={20} />} meta="Person" phone={phone}>
            {MAYA.name}
          </Row>
          <Group>Suggested</Group>
          <Row mark={<Ico icon={MessageSquarePlus} />} phone={phone}>
            New message
          </Row>
          <Row mark={<Ico icon={Plus} />} phone={phone}>
            New task
          </Row>
          <Row mark={<Ico icon={BellOff} />} phone={phone}>
            Pause notifications…
          </Row>
          <Row mark={<Ico icon={Moon} />} phone={phone}>
            Change theme…
          </Row>
          <Row mark={<AgentFace size={20} />} keys={phone ? undefined : "Tab"} ask phone={phone}>
            Ask OneCamp AI…
          </Row>
        </>
      )
    case "pal-l1":
      return (
        <>
          <Group>Jump to</Group>
          <Row mark={<Face person={JONAS} size={20} />} meta="Person" phone={phone} selected>
            Jonas <Hl>W</Hl>eber
          </Row>
          <QueryRows phone={phone} />
        </>
      )
    case "pal-l2":
      return (
        <>
          <Group>Messages, docs and tasks</Group>
          <div className="sc-pal-status">Searching…</div>
          <QueryRows phone={phone} first />
        </>
      )
    case "pal-l3":
      return (
        <>
          <div {...item("pal-dim", "off")} className="sc-pal-hits">
            <Group>Messages, docs and tasks</Group>
            <LeftHit phone={phone} sel />
          </div>
          <QueryRows phone={phone} />
        </>
      )
    case "pal-l4":
      return (
        <>
          <Group>Messages, docs and tasks</Group>
          <LeftHit phone={phone} sel={{ id: "pal-sel-first", state: undefined }} />
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
          <QueryRows phone={phone} ask={{ sel: { id: "pal-sel-ask", state: "off" }, lit: phone ? undefined : { id: "pal-lit", state: "off" } }} />
        </>
      )
  }
}

/**
 * One list as a whole panel of its own (a layer), laid out where the palette
 * hangs: the field's place, its list, its hints. Only one is shown at a time.
 */
function Layer({ id, phone, cap, shown, children, ask }: { id: string; phone?: boolean; cap?: number; shown: boolean; children: ReactNode; ask?: boolean }) {
  return (
    <div
      className="sc-pal sc-pal-layer"
      data-phone={phone ? "" : undefined}
      data-ask-layer={ask ? "" : undefined}
      data-sc-rows={ask ? "pal-answer" : undefined}
      {...item(id, shown ? undefined : "off")}
    >
      <div className="sc-pal-spacer" />
      {phone && <div className="sc-pal-phone-spacer" />}
      <div className="sc-pal-list" style={cap && !phone ? { maxHeight: cap } : undefined}>
        {children}
      </div>
      {!phone && <Foot />}
    </div>
  )
}

/**
 * The palette as a scene plays it: every list a layer, the Ask panel whose
 * answer streams, and the field over them all, typed into. At "start" it is
 * the palette just opened (what a reader without JavaScript sees, complete);
 * at "end" the question asked and answered (a still of the end, and what a
 * reader who asked for less motion sees).
 */
export function PlayPalette({ at = "start", phone, cap }: { at?: At; phone?: boolean; cap?: number }) {
  const end = at === "end"
  return (
    <div className="sc-pal-play" data-phone={phone ? "" : undefined}>
      {LISTS.map((id) => (
        <Layer key={id} id={id} phone={phone} cap={cap} shown={id === "pal-l0" && !end}>
          <List id={id} phone={phone} />
        </Layer>
      ))}
      <Layer id="pal-la" phone={phone} cap={cap} shown={end} ask>
        <Answer play at={at} />
      </Layer>
      <div className="sc-pal-fieldbox" data-phone={phone ? "" : undefined} {...item("pal-ask", end ? "on" : undefined)}>
        <Field query={QUESTION} phone={phone} typed={{ start: !end }} />
        {phone && (
          <div className="sc-pal-phone-seg">
            <Segmented phone />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * The question as a still: Search with the question typed (its final list),
 * or Ask answered, each at its own height. For the gallery's plates.
 */
export function QuestionPalette({ phone, only, cap }: { phone?: boolean; only: "search" | "ask"; cap?: number }) {
  return (
    <Panel phone={phone} query={QUESTION} cap={cap} mode={{ state: only === "ask" ? "on" : undefined }}>
      {only === "ask" ? <Answer /> : <List id="pal-l4" phone={phone} />}
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
