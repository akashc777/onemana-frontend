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
import type { CampHue } from "@/lib/campHue";
import type { FeatureIconKey } from "@/lib/content";

/**
 * Each kind of feature has one camp hue and one glyph, the same on every page,
 * so a colour means something: dusk is the agents and the record (the same as
 * the Safe AI band), berry is conversation, sky is writing, moss is work, lake
 * is people and data, sun is time and things that run by themselves. The
 * product tabs on the home page use the same hues for the same surfaces.
 */
export const FEATURE_MARK: Record<FeatureIconKey, { hue: CampHue; Glyph: ComponentType<SVGProps<SVGSVGElement>> }> = {
  chat: { hue: "berry", Glyph: ChatGlyph },
  docs: { hue: "sky", Glyph: DocGlyph },
  tasks: { hue: "moss", Glyph: TaskGlyph },
  board: { hue: "moss", Glyph: BoardGlyph },
  table: { hue: "lake", Glyph: TableGlyph },
  teams: { hue: "lake", Glyph: PeopleGlyph },
  video: { hue: "lake", Glyph: VideoGlyph },
  calendar: { hue: "sun", Glyph: CalendarGlyph },
  automation: { hue: "sun", Glyph: BoltGlyph },
  api: { hue: "sun", Glyph: BoltGlyph },
  ai: { hue: "dusk", Glyph: SparkGlyph },
  agent: { hue: "dusk", Glyph: SparkGlyph },
  lock: { hue: "dusk", Glyph: LockGlyph },
  shield: { hue: "dusk", Glyph: ShieldGlyph },
  audit: { hue: "dusk", Glyph: RecordGlyph },
};
