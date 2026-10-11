import type { CSSProperties, ReactNode } from "react"
import type { LucideIcon, LucideProps } from "lucide-react"

import { APP } from "@/lib/appSystem"
import type { CampHue } from "@/lib/campHue"
import { SPARK_PATH } from "@/components/ui/graphics/motifs"

import type { Person } from "./data"

/**
 * The app's atoms, drawn without the app (components/site/showcase): its
 * avatars, tags, keys, chips, badges and marks, each the same shape and
 * the same tokens as the component named beside it in onecamp-fe. Server
 * components with no state: a scene is a picture.
 */

/** A Lucide icon as the app draws it: one rendered 1.25px stroke at any size (globals.css svg.lucide). */
export function Ico({ icon: Icon, size = 16, ...rest }: { icon: LucideIcon; size?: number } & Omit<LucideProps, "ref">) {
  return <Icon size={size} strokeWidth={1.25} absoluteStrokeWidth aria-hidden="true" {...rest} />
}

/** The brand spark (components/ui/graphics/motifs Spark). */
export function Spark({ size = 12, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className={className} fill="currentColor">
      <path d={SPARK_PATH} />
    </svg>
  )
}

const box = (size: number): CSSProperties => ({ width: size, height: size })

/**
 * A person's face (ChannelMessageAvatar, ChatFace): their hue's avatar cut,
 * white initials, two letters from 28px and one below.
 */
export function Face({ person, size, presence, ring }: { person: Person; size: number; presence?: boolean; ring?: "frame" | "sheet" }) {
  const initials = size >= 28 ? person.initials : person.initials.slice(0, 1)
  const font = size >= 36 ? 13 : size >= 28 ? 12 : size >= 22 ? 8.3 : 11 * (size / 20)
  return (
    <span className="sc-av" data-hue={person.hue} style={{ ...box(size), fontSize: Math.round(font * 10) / 10 }}>
      {initials}
      {presence && <span className="sc-presence" style={ring === "frame" ? ({ "--presence-ring": "var(--sc-frame)" } as CSSProperties) : undefined} />}
    </span>
  )
}

/** An agent (PrincipalAvatar AgentAvatar): the 32% square in the agent gradient, the white spark at 55%. */
export function AgentFace({ size }: { size: number }) {
  return (
    <span className="sc-av" data-kind="agent" style={box(size)}>
      <Spark size={Math.round(size * 0.55)} />
    </span>
  )
}

/** A bot (PrincipalAvatar BotAvatar): the 32% square on the sunken surface with its glyph. */
export function BotFace({ size, children }: { size: number; children: ReactNode }) {
  return (
    <span className="sc-av" data-kind="bot" style={box(size)}>
      {children}
    </span>
  )
}

/** The tag beside a name (principalTag): "Agent" with the spark, "Guest", "Bot". */
export function Tag({ kind }: { kind: "agent" | "guest" | "bot" }) {
  if (kind === "agent") {
    return (
      <span className="sc-tag" data-kind="agent">
        <Spark size={10} />
        Agent
      </span>
    )
  }
  return (
    <span className="sc-tag" data-kind={kind === "guest" ? "guest" : "neutral"}>
      {kind === "guest" ? "Guest" : "Bot"}
    </span>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return <span className="sc-kbd">{children}</span>
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={["sc-chip", className].filter(Boolean).join(" ")}>{children}</span>
}

/** The brand badge (a DM, a mention): 18px, 11/590. */
export function Badge({ children }: { children: ReactNode }) {
  return <span className="sc-badge">{children}</span>
}

/** A plain unread count: 12/450 ink-3, tabular. */
export function Count({ children }: { children: ReactNode }) {
  return <span className="sc-count">{children}</span>
}

/** The workspace mark (SidebarHeader WorkspaceMark): a 26px tile in the logo gradient with the white ring. */
export function WorkspaceMark({ size = 26 }: { size?: 26 | 24 }) {
  const [a, b] = APP.logoGradient
  const glyph = size === 26 ? 16 : 14
  return (
    <span className="sc-mark" style={{ ...box(size), borderRadius: size === 26 ? 8 : 7, backgroundImage: `linear-gradient(145deg, ${a}, ${b})` }}>
      {/* The logo's ring: a mark, not an icon, so its weight is the mark's own (showcase.css). */}
      <svg width={glyph} height={glyph} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="7" className="sc-mark-ring" />
      </svg>
    </span>
  )
}

/** A project's 16px tile (desktopSideNavigationBar ProjectTile): its hue's avatar cut, the first letter in white. */
export function ProjectTile({ name, hue, size = 16 }: { name: string; hue: CampHue; size?: number }) {
  return (
    <span className="sc-ptile" data-hue={hue} style={size === 16 ? undefined : { ...box(size), borderRadius: Math.round(size * 0.3125), fontSize: Math.round(size * 0.5625) }}>
      {name.trim()[0]?.toUpperCase()}
    </span>
  )
}

/** A mention chip (tintMentions): a person with their dot, you in the accent, an agent in its tint with the spark. */
export function Mention({ kind, hue, children }: { kind: "person" | "me" | "agent"; hue?: CampHue; children: ReactNode }) {
  return (
    <span className="sc-mention" data-kind={kind} data-hue={hue}>
      {kind === "agent" && <Spark />}
      {kind === "agent" ? children : <>@{children}</>}
    </span>
  )
}

/** A day's heading in a conversation (separatorPill). */
export function DayPill({ children }: { children: ReactNode }) {
  return (
    <div className="sc-day">
      <span>{children}</span>
    </div>
  )
}
