import type { CSSProperties, ReactNode } from "react"
import {
  ArrowLeft,
  Bell,
  Box,
  ChartGantt,
  ChevronRight,
  Clock,
  Filter,
  Kanban,
  Link2,
  List,
  Lock,
  Megaphone,
  MoreHorizontal,
  Paperclip,
  Plus,
  SlidersHorizontal,
} from "lucide-react"

import "./board.css"
import { APP } from "@/lib/appSystem"
import type { CampHue } from "@/lib/campHue"
import { Ico } from "./parts"
import type { Person } from "./data"

/**
 * A project in its Board view, as onecamp-fe draws it (components/project
 * projectTaskDesktop, ProjectHeaderLine and ProjectGlanceLine; the board in
 * projectTaskKanban, kanbanComponents Container and Item; the glyphs in
 * components/ui/graphics). The phone's is projectListTabs under the phone's
 * bar. No logic: a card says what it is given.
 */

/* ------------------------------------------------------------- glyphs */

export type StatusKind = "todo" | "progress" | "review" | "done"

const KIND_COLOUR: Record<StatusKind, string> = {
  todo: "var(--sc-ink-2)",
  progress: "rgb(var(--camp-sun))",
  review: "rgb(var(--camp-dusk))",
  done: "rgb(var(--camp-moss))",
}

/** A status's glyph (StatusGlyph): its category's shape, in the category's colour or a project status's own hue. */
export function StatusGlyph({ kind, hue, size = 16 }: { kind: StatusKind; hue?: CampHue; size?: number }) {
  const colour = hue ? `rgb(var(--camp-${hue}))` : KIND_COLOUR[kind]
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className="flex-none">
      {kind === "done" ? (
        <>
          <circle cx="8" cy="8" r="7" style={{ fill: colour }} />
          <path d="m5.2 8.2 1.9 1.9 3.8-4" className="bd-g-tick" />
        </>
      ) : (
        <>
          <circle cx="8" cy="8" r="6" className="bd-g-ring" style={{ stroke: colour }} />
          {kind === "progress" && <path d="M8 4.5a3.5 3.5 0 0 1 0 7z" style={{ fill: colour }} />}
          {kind === "review" && <path d="M8 4.5a3.5 3.5 0 1 1-3.5 3.5H8z" style={{ fill: colour }} />}
        </>
      )}
    </svg>
  )
}

/** A priority (PriorityGlyph): three bars in ink-2 up to the level, the rest in ink-4. */
export function PriorityGlyph({ level }: { level: 0 | 1 | 2 | 3 }) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden="true" className="flex-none">
      {[0, 1, 2].map((i) => (
        <rect key={i} x={2 + i * 4.5} y={11 - i * 3.5} width="3" height={3 + i * 3.5} rx="1" className={i < level ? "bd-p-on" : "bd-p-off"} />
      ))}
    </svg>
  )
}

/**
 * A person as an identity mark (IdentityMark, avatar): the hue's avatar cut
 * with white initials, one below 24px, at 37.5% of the size and never under 9.
 */
export function IdentityFace({ person, size = 22 }: { person: Person; size?: number }) {
  return (
    <span className="sc-av bd-face" data-hue={person.hue} style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.375)) }}>
      {size < 24 ? person.initials.slice(0, 1) : person.initials}
    </span>
  )
}

const TILE = { 16: { radius: 5, glyph: 10 }, 36: { radius: 10, glyph: 18 } } as const

/** A project's tile (ProjectTile): its hue's cut and its white glyph (Q4 launch's is a box). */
export function GlyphTile({ hue, size }: { hue: CampHue; size: 16 | 36 }) {
  const { radius, glyph } = TILE[size]
  return (
    <span className="bd-tile" data-hue={hue} style={{ width: size, height: size, borderRadius: radius }}>
      <Ico icon={Box} size={glyph} />
    </span>
  )
}

/** How far a goal is (ProgressRing): 16px, 2.5 thick, in the theme's progress gradient on the press track. */
function GoalRing({ value, uid }: { value: number; uid: string }) {
  const [from, to] = APP.logoGradient
  const r = (16 - 2.5) / 2
  const id = `${uid}-goal`
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true" className="flex-none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <circle cx="8" cy="8" r={r} className="bd-ring-track" />
      <circle cx="8" cy="8" r={r} className="bd-ring-fill" stroke={`url(#${id})`} strokeLinecap="round" pathLength={100} strokeDasharray={`${value} 100`} transform="rotate(-90 8 8)" />
    </svg>
  )
}

/**
 * A count that changes (CountTick), digit by digit: a digit that stays is
 * plain; one that changes holds the old over the new, and the scene's `item`
 * turns it. Without one, the count as it is.
 */
export function Tick({ from, to, item }: { from: string | number; to?: string | number; item?: string }) {
  const a = String(from)
  if (to === undefined || !item) return <>{a}</>
  const b = String(to)
  const width = Math.max(a.length, b.length)
  const pa = a.padStart(width, " ")
  const pb = b.padStart(width, " ")
  return (
    <>
      {[...pb].map((ch, i) =>
        ch === pa[i] ? (
          <span key={i}>{ch}</span>
        ) : (
          <span key={i} className="bd-digit">
            <span data-sc-item={item} data-bd="tick-out" data-sc-state="off">
              {pa[i].trim()}
            </span>
            <span data-sc-item={item} data-bd="tick-in" data-sc-state="off">
              {ch}
            </span>
          </span>
        ),
      )}
    </>
  )
}

/* -------------------------------------------------------------- a card */

export type Card = {
  title: string
  /** The project's Channel field, shown on cards (a select's label). */
  field?: string
  priority: 0 | 1 | 2 | 3
  /** The due date as the card writes it ("Today", "Tomorrow", "13 Oct"). */
  due?: string
  /** Waiting on this many open tasks. */
  blocked?: number
  who?: Person
  /** Done: the title and date in ink-3, the moss check top right. */
  done?: boolean
}

type DataAttrs = Record<`data-${string}`, string | undefined>

/**
 * A board card (Item and its TaskCardBody, work.md W21): the title at 510 on
 * two lines at most, the fields shown on cards, then the 22px meta row: the
 * priority, the due date, a lock while it waits, and the assignee.
 */
export function TaskCard({ card, check, style, ...rest }: { card: Card; check?: ReactNode; style?: CSSProperties } & DataAttrs) {
  const today = card.due === "Today" && !card.done
  return (
    <div className="bd-card" data-done={card.done ? "" : undefined} style={style} {...rest}>
      <div className="bd-card-title">{card.title}</div>
      {card.field && (
        <div className="bd-card-fields">
          <span className="truncate">{card.field}</span>
        </div>
      )}
      <div className="bd-card-meta">
        <span>
          <PriorityGlyph level={card.priority} />
          {card.due && (
            <span className="bd-due" data-due={card.done ? "done" : today ? "today" : "upcoming"}>
              {card.due}
            </span>
          )}
          {card.blocked ? (
            <span className="bd-blocked">
              <Ico icon={Lock} size={12} />
              {card.blocked}
            </span>
          ) : null}
        </span>
        {card.who && <IdentityFace person={card.who} />}
      </div>
      {card.done && <span className="bd-card-done">{check ?? <StatusGlyph kind="done" size={14} />}</span>}
    </div>
  )
}

/* ------------------------------------------------------------ a column */

/**
 * A column (Container): its glyph, name and count in a 40px head, the cards
 * 8px apart, and the 40px "New task" under them, shown only while the column
 * is empty.
 */
export function BoardColumn({
  name,
  kind,
  hue,
  count,
  over,
  foot,
  enter,
  children,
}: {
  name: string
  kind: StatusKind
  hue?: CampHue
  count: ReactNode
  /** The drag-over light, laid over the column (a scene turns it on). */
  over?: ReactNode
  /** The "New task" row: a scene's own, for a column it empties. */
  foot?: ReactNode
  /** A part of the scene that arrives in turn when a reader picks its tab. */
  enter?: boolean
  children?: ReactNode
}) {
  return (
    <div className="bd-col" data-sc-enter={enter ? "" : undefined}>
      {over}
      <div className="bd-col-head">
        <span className="bd-col-name">
          <StatusGlyph kind={kind} hue={hue} />
          <span className="truncate">{name}</span>
        </span>
        <span className="bd-col-count">{count}</span>
      </div>
      {/* Cards past its foot are cut there: the app fades the cut only
          once the column has been scrolled. */}
      <div className="bd-col-body">
        {children}
      </div>
      {foot ?? (
        <span className="bd-col-foot bd-btn" data-empty={children ? undefined : ""}>
          <Ico icon={Plus} size={14} />
          New task
        </span>
      )}
    </div>
  )
}

/** The drag-over light for a column. */
export function ColumnOver(props: DataAttrs) {
  return <span className="bd-col-over" {...props} />
}

/** The "New task" row of a column a scene empties. */
export function ColumnFoot(props: DataAttrs) {
  return (
    <span className="bd-col-foot bd-btn" data-empty="" {...props}>
      <Ico icon={Plus} size={14} />
      New task
    </span>
  )
}

/* ------------------------------------------------------------ the page */

export type Glance = { open: ReactNode; week: ReactNode; done: ReactNode }

/**
 * Where the project stands (ProjectGlanceLine): "6 open · 5 due this week ·
 * 11 done". In the desktop's header each count is a button that filters the
 * list to it (`pick`); on a phone they are words.
 */
function GlanceLine({ glance, pick }: { glance: Glance; pick?: boolean }) {
  return (
    <p className="bd-glance" data-pick={pick ? "" : undefined}>
      <span>
        <b>{glance.open}</b> open
      </span>
      <i>·</i>
      <span>
        <b>{glance.week}</b> due this week
      </span>
      <i>·</i>
      <span>
        <b>{glance.done}</b> done
      </span>
    </p>
  )
}

/** No update yet, for someone who may write the first (HealthWord as a chip). */
function HealthChip() {
  return (
    <span className="sc-chip bd-chip24 bd-btn">
      <span className="bd-dashed-dot" />
      <span className="t-ui-sm w-medium ink-3">Write the first update</span>
    </span>
  )
}

/** The goal it serves (ProjectGoalChip): the ring, the goal's name, how far. */
function GoalChip({ title, percent, uid }: { title: string; percent: number; uid: string }) {
  return (
    <span className="sc-chip bd-chip24 min-w-0 overflow-hidden" style={{ flexShrink: 4 }}>
      <GoalRing value={percent} uid={uid} />
      <span className="truncate">{title}</span>
      <span className="tnum flex-none">· {percent}%</span>
    </span>
  )
}

export type Project = {
  name: string
  hue: CampHue
  members: Person[]
  glance: Glance
  goal: { title: string; percent: number }
  /**
   * The health chip, for someone who may post the first update. Without it,
   * the line as a reader who may not post sees it (ProjectHealthChip draws
   * nothing for them), which leaves the goal its whole name.
   */
  health?: boolean
}

/** The sheet's header bar: the breadcrumb, who is here, and the project's tools. */
function ProjectBar({ project }: { project: Project }) {
  return (
    <div className="bd-bar">
      <span className="bd-crumb">
        <span>Projects</span>
        <Ico icon={ChevronRight} size={14} className="ink-3" />
        <GlyphTile hue={project.hue} size={16} />
        <span className="truncate w-semibold ink">{project.name}</span>
      </span>
      <span className="min-w-0 flex-1" />
      <span className="bd-stack">
        {project.members.map((p) => (
          <span key={p.name}>
            <IdentityFace person={p} />
          </span>
        ))}
      </span>
      <span className="flex flex-none items-center gap-0.5">
        <span className="bd-iconbtn" style={{ width: 32, height: 32 }}>
          <Ico icon={Bell} />
        </span>
        <span className="sc-btn bd-ghost bd-btn">
          <Ico icon={Link2} />
          Share
        </span>
        <span className="bd-iconbtn" style={{ width: 28, height: 28 }}>
          <Ico icon={Clock} />
        </span>
        <span className="bd-iconbtn" style={{ width: 28, height: 28 }}>
          <Ico icon={MoreHorizontal} />
        </span>
      </span>
    </div>
  )
}

/** The hero: the 36px tile, the name, and the line under it (ProjectHeaderLine). */
function ProjectHero({ project, uid }: { project: Project; uid: string }) {
  return (
    <div className="bd-hero">
      <GlyphTile hue={project.hue} size={36} />
      <div className="min-w-0 flex-1">
        <div className="truncate t-title-1 ink">{project.name}</div>
        <div className="bd-line">
          <GlanceLine glance={project.glance} pick />
          {project.health !== false && <HealthChip />}
          <GoalChip {...project.goal} uid={uid} />
        </div>
      </div>
    </div>
  )
}

/** The view tabs (WorkTabsList), Board open. */
function ViewTabs() {
  const tabs = [
    { label: "List", icon: List },
    { label: "Board", icon: Kanban, on: true },
    { label: "Timeline", icon: ChartGantt },
    { label: "Updates", icon: Megaphone },
    { label: "Files", icon: Paperclip },
  ]
  return (
    <div className="bd-tabs">
      {tabs.map((t) => (
        <span key={t.label} className="bd-tab" data-on={t.on ? "" : undefined}>
          <Ico icon={t.icon} size={14} />
          {t.label}
        </span>
      ))}
    </div>
  )
}

/** Radix's PlusCircledIcon, which the app's FilterChip draws (a filled shape, 15 units, at 16px). */
const PLUS_CIRCLED =
  "M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM7.50003 4C7.77617 4 8.00003 4.22386 8.00003 4.5V7H10.5C10.7762 7 11 7.22386 11 7.5C11 7.77614 10.7762 8 10.5 8H8.00003V10.5C8.00003 10.7761 7.77617 11 7.50003 11C7.22389 11 7.00003 10.7761 7.00003 10.5V8H4.50003C4.22389 8 4.00003 7.77614 4.00003 7.5C4.00003 7.22386 4.22389 7 4.50003 7H7.00003V4.5C7.00003 4.22386 7.22389 4 7.50003 4Z"

/** A filter that filters nothing yet (FilterChip): a quiet ghost with its plus. */
function FilterChip({ title }: { title: string }) {
  return (
    <span className="sc-btn bd-ghost bd-btn">
      <svg width={16} height={16} viewBox="0 0 15 15" aria-hidden="true" className="flex-none">
        <path d={PLUS_CIRCLED} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
      </svg>
      {title}
    </span>
  )
}

/** The board's toolbar: Assignee and Priority, then New task (C) and Display; on a phone, the last two as icons. */
function Toolbar({ phone, enter }: { phone?: boolean; enter?: boolean }) {
  return (
    <div className="bd-toolbar" data-sc-enter={enter ? "" : undefined}>
      <span>
        <FilterChip title="Assignee" />
        <FilterChip title="Priority" />
      </span>
      <span>
        <span className="sc-btn bd-btn" data-variant="primary">
          <Ico icon={Plus} />
          {!phone && (
            <>
              New task
              <span className="bd-kbd">C</span>
            </>
          )}
        </span>
        <span className="sc-btn bd-ghost bd-btn">
          <Ico icon={SlidersHorizontal} />
          {!phone && "Display"}
        </span>
      </span>
    </div>
  )
}

/**
 * The project page in its Board view, on the sheet: the bar, the hero, the
 * tabs and the board. `bar={false}` leaves out the breadcrumb bar (it names
 * the project the hero names again), for a window too short for both and the
 * board. `scroll` is how far the board is scrolled sideways; `overlay`
 * floats over the board (a card being moved). `uid` keeps the page's one
 * gradient id apart from another drawing of it on the same page.
 */
export function BoardView({
  project,
  columns,
  bar = true,
  scroll = 0,
  overlay,
  enter,
  uid,
}: {
  project: Project
  columns: ReactNode
  bar?: boolean
  scroll?: number
  overlay?: ReactNode
  /** Its parts arrive in turn when a reader picks its tab. */
  enter?: boolean
  uid: string
}) {
  return (
    <div className="relative isolate flex h-full min-h-0 flex-col" data-hue={project.hue}>
      <span className="bd-band" />
      <div data-sc-enter={enter ? "" : undefined}>
        {bar && <ProjectBar project={project} />}
        <ProjectHero project={project} uid={uid} />
      </div>
      <ViewTabs />
      <div className="bd-kanban">
        <Toolbar enter={enter} />
        <div className="bd-body">
          <div className="bd-viewport">
            <div className="bd-row" style={scroll ? { transform: `translateX(${-scroll}px)` } : undefined}>
              {columns}
            </div>
            {overlay && <div className="bd-overlay">{overlay}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ the phone */

/** The phone's bar for a project: Back, the project's colour and name, and Filter. */
function PhoneBar({ project }: { project: Project }) {
  return (
    <div className="bd-pbar">
      <span className="flex min-w-0 items-center justify-start">
        <span className="bd-iconbtn" style={{ width: 44, height: 44 }}>
          <Ico icon={ArrowLeft} />
        </span>
      </span>
      <span className="bd-pbar-title" data-hue={project.hue}>
        <span className="bd-pmark" />
        <span className="truncate">{project.name}</span>
      </span>
      <span className="flex min-w-0 items-center justify-end">
        <span className="bd-iconbtn" style={{ width: 44, height: 44 }}>
          <Ico icon={Filter} />
        </span>
      </span>
    </div>
  )
}

/** The phone's tabs (SectionTabs), Board open; the row fades where it runs on. */
function PhoneTabs() {
  return (
    <div className="bd-ptabs">
      <span>
        {["Tasks", "Board", "Timeline", "Updates", "Files"].map((t) => (
          <span key={t} className="bd-ptab" data-on={t === "Board" ? "" : undefined}>
            {t}
          </span>
        ))}
      </span>
    </div>
  )
}

/** The phone's columns are the screen less 32px, 8px apart. */
export const PHONE_COLUMN_STEP = 336

/**
 * The same board on a phone (projectListTabs): the bar, the project's line
 * with its one menu, its chips, the tabs, and the board a column at a time
 * with a dot per column under it, resting on column `at`. A scene that
 * scrolls it brings its own `row` attributes and `pager`.
 */
export function PhoneBoardView({
  project,
  columns,
  count,
  at,
  row,
  pager,
  overlay,
  enter,
  uid,
}: {
  project: Project
  columns: ReactNode
  /** How many columns, for the dots. */
  count: number
  /** The column in view. */
  at: number
  /** The row's own attributes and style, for a scene that scrolls it. */
  row?: DataAttrs & { style?: CSSProperties }
  pager?: ReactNode
  overlay?: ReactNode
  enter?: boolean
  uid: string
}) {
  const { style, ...rowAttrs } = row ?? {}
  return (
    <div className="flex h-full min-h-0 flex-col" data-hue={project.hue}>
      <PhoneBar project={project} />
      <div className="bd-phead" data-sc-enter={enter ? "" : undefined}>
        <div>
          <span className="min-w-0 flex-1 overflow-hidden">
            <GlanceLine glance={project.glance} />
          </span>
          <span className="bd-iconbtn" style={{ width: 28, height: 28 }}>
            <Ico icon={MoreHorizontal} />
          </span>
        </div>
        <div>
          {project.health !== false && <HealthChip />}
          <GoalChip {...project.goal} uid={uid} />
        </div>
      </div>
      <PhoneTabs />
      <div className="bd-kanban" data-phone="">
        <Toolbar phone enter={enter} />
        <div className="bd-body">
          <div className="bd-viewport">
            <div className="bd-row" style={style ?? { transform: `translateX(${-at * PHONE_COLUMN_STEP}px)` }} {...rowAttrs}>
              {columns}
            </div>
            {overlay && <div className="bd-overlay">{overlay}</div>}
          </div>
          {pager ?? (
            <div className="bd-pager">
              {Array.from({ length: count }, (_, i) => (
                <span key={i}>{i === at && <i />}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
