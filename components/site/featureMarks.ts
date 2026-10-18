import type { ComponentType, SVGProps } from "react";
import {
  BoardGlyph,
  BoltGlyph,
  CalendarGlyph,
  ChatGlyph,
  DocGlyph,
  LockGlyph,
  PeopleGlyph,
  RecordGlyph,
  ShieldGlyph,
  SparkGlyph,
  TableGlyph,
  TaskGlyph,
  VideoGlyph,
} from "@/components/site/Glyphs";
import { AREA, type AreaHue } from "@/lib/areas";
import type { FeatureIconKey } from "@/lib/content";

/**
 * Each kind of feature has one glyph and the hue of the area it belongs to
 * (design v3.1, lib/areas.ts), the same on every page: chat sky, calls
 * berry, docs dusk, projects moss, tables lake, calendar sun, and anything
 * about agents (the record included) the agent's indigo. What belongs to no
 * area (people, automation, the API, privacy) is neutral ink.
 */
export const FEATURE_MARK: Record<FeatureIconKey, { hue: AreaHue | "ink"; Glyph: ComponentType<SVGProps<SVGSVGElement>> }> = {
  chat: { hue: AREA.chat.hue, Glyph: ChatGlyph },
  video: { hue: AREA.calls.hue, Glyph: VideoGlyph },
  docs: { hue: AREA.docs.hue, Glyph: DocGlyph },
  tasks: { hue: AREA.projects.hue, Glyph: TaskGlyph },
  board: { hue: AREA.projects.hue, Glyph: BoardGlyph },
  table: { hue: AREA.tables.hue, Glyph: TableGlyph },
  calendar: { hue: AREA.calendar.hue, Glyph: CalendarGlyph },
  ai: { hue: AREA.agents.hue, Glyph: SparkGlyph },
  agent: { hue: AREA.agents.hue, Glyph: SparkGlyph },
  shield: { hue: AREA.agents.hue, Glyph: ShieldGlyph },
  audit: { hue: AREA.agents.hue, Glyph: RecordGlyph },
  // No area: who is on the team, what runs by itself, the API, privacy.
  teams: { hue: "ink", Glyph: PeopleGlyph },
  automation: { hue: "ink", Glyph: BoltGlyph },
  api: { hue: "ink", Glyph: BoltGlyph },
  lock: { hue: "ink", Glyph: LockGlyph },
};
