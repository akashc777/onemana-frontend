import {
  Bookmark,
  ChevronDown,
  ChevronsUpDown,
  CircleCheck,
  Hash,
  House,
  Inbox,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Search,
  SlidersHorizontal,
  SquarePen,
} from "lucide-react"

import { AgentFace, Badge, Count, Face, Ico, Kbd, ProjectTile, Spark, Tag, WorkspaceMark } from "./parts"
import { CHANNELS, MAYA, ONECAMP_AI, PROJECTS, SAM, WORKSPACE } from "./data"

/**
 * The sidebar (components/navigationBar/desktop: desktopNavigationBar,
 * SidebarHeader, SidebarSearchRow, desktopSideNavigationBar, SidebarFoot),
 * design v3 shell S2 to S12, on the lit frame: the workspace header, the
 * search-or-ask pill and the AI spark, four rows and More, the sections, and
 * the foot with your face. `place` is the row that is the current page.
 */
export type Place = "home" | "inbox" | "tasks" | "later" | "docs" | "calendar" | `channel:${string}` | `project:${string}`

export function Sidebar({
  place,
  width = 240,
  inboxBadge,
  more,
  compact,
}: {
  place: Place
  width?: number
  inboxBadge?: number
  more?: string
  /** A shorter window's sidebar: one project and the agent's DM, so no section runs under the foot. */
  compact?: boolean
}) {
  const row = (p: Place) => (p === place ? { "data-active": "" } : {})
  const projects = compact ? PROJECTS.slice(0, 1) : PROJECTS
  return (
    <div className="sc-side h-full" style={{ width }}>
      {/* Header (S3): the mark, the name and ⇅, collapse and compose. */}
      <div className="flex items-center gap-0.5 pr-0">
        <div className="sc-ws min-w-0 flex-1">
          <WorkspaceMark />
          <span className="truncate t-ui w-semibold min-w-0 flex-1">{WORKSPACE}</span>
          <Ico icon={ChevronsUpDown} size={14} className="ink-3" />
        </div>
        <span className="sc-iconbtn" data-size="24">
          <Ico icon={PanelLeft} size={14} />
        </span>
        <span className="sc-iconbtn">
          <Ico icon={SquarePen} size={16} />
        </span>
      </div>

      {/* Search or ask (S4), and the AI spark in the agent hue. */}
      <div className="mb-2.5 mt-2 flex items-center gap-1.5">
        <div className="sc-pill min-w-0 flex-1">
          <Ico icon={Search} size={14} />
          <span className="truncate min-w-0 flex-1">Search or ask</span>
          <span className="flex flex-none items-center gap-0.5">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </div>
        <span className="sc-ai">
          <Spark size={16} />
        </span>
      </div>

      {/* The four rows and More (S5, S6). */}
      <div className="flex flex-col gap-px">
        <div className="sc-row" {...row("home")}>
          <Ico icon={House} />
          <span className="truncate min-w-0 flex-1">Home</span>
        </div>
        <div className="sc-row" {...row("inbox")}>
          <Ico icon={Inbox} />
          <span className="truncate min-w-0 flex-1">Inbox</span>
          {inboxBadge ? <Badge>{inboxBadge}</Badge> : null}
        </div>
        <div className="sc-row" {...row("tasks")}>
          <Ico icon={CircleCheck} />
          <span className="truncate min-w-0 flex-1">My tasks</span>
        </div>
        <div className="sc-row" {...row("later")}>
          <Ico icon={Bookmark} />
          <span className="truncate min-w-0 flex-1">Later</span>
        </div>
        <div className="sc-row" style={{ color: "var(--sc-ink-3)" }}>
          <Ico icon={MoreHorizontal} />
          <span className="truncate min-w-0 flex-1">More</span>
          {more ? <Count>{more}</Count> : null}
        </div>
      </div>

      {/* The sections (S7): Projects with their tiles, Channels, Direct messages. */}
      <div className="mt-0.5 min-h-0 flex-1 overflow-hidden pb-3">
        <Section title="Projects" chevron>
          {projects.map((p) => (
            <div key={p.name} className="sc-row" {...row(`project:${p.name}`)}>
              <ProjectTile name={p.name} hue={p.hue} />
              <span className="truncate min-w-0 flex-1">{p.name}</span>
            </div>
          ))}
        </Section>
        <Section title="Channels">
          {CHANNELS.map((c) => (
            <div key={c.name} className="sc-row" data-unread={c.count ? "" : undefined} {...row(`channel:${c.name}`)}>
              <Ico icon={Hash} />
              <span className="truncate min-w-0 flex-1">{c.name}</span>
              {c.count ? <Count>{c.count}</Count> : null}
            </div>
          ))}
        </Section>
        <Section title="Direct messages">
          <div className="sc-row" data-unread="">
            <span className="-mx-0.5 flex size-5 flex-none">
              <AgentFace size={20} />
            </span>
            <span className="truncate min-w-0 flex-1">{ONECAMP_AI.name}</span>
            <Tag kind="agent" />
            <Badge>1</Badge>
          </div>
          {!compact && (
            <div className="sc-row">
              <span className="-mx-0.5 flex flex-none">
                <Face person={MAYA} size={20} />
              </span>
              <span className="truncate min-w-0 flex-1">{MAYA.name}</span>
            </div>
          )}
        </Section>
      </div>

      {/* The foot (S12): your face with presence, your name and status. */}
      <div className="sc-foot">
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          <Face person={SAM} size={28} presence ring="frame" />
          <span className="min-w-0 flex-1">
            <span className="block truncate t-ui w-medium ink" style={{ lineHeight: "18px" }}>
              {SAM.name}
            </span>
            <span className="block truncate t-meta ink-3" style={{ lineHeight: "14px" }}>
              Active
            </span>
          </span>
        </span>
        <span className="sc-iconbtn">
          <Ico icon={SlidersHorizontal} />
        </span>
      </div>
    </div>
  )
}

function Section({ title, chevron, children }: { title: string; chevron?: boolean; children: React.ReactNode }) {
  return (
    <section>
      <div className="sc-sect">
        <span className="sc-sect-label truncate">{title}</span>
        {chevron && (
          <span className="sc-iconbtn" data-size="24">
            <Ico icon={ChevronDown} size={14} />
          </span>
        )}
        <span className="sc-iconbtn" data-size="24">
          <Ico icon={Plus} size={14} />
        </span>
      </div>
      <div className="flex flex-col gap-px">{children}</div>
    </section>
  )
}
