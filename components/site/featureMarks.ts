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
 * Each kind of feature has one hue and one glyph, the same on every page, so
 * a colour means something (design v3, site.md G7): the surfaces wear the
 * hues the home page's tour gives them (chat sky, docs dusk, tasks moss,
 * calendar sun) and anything about agents wears the agent's indigo, never
 * dusk; the record is dusk, as its hash chain is; people and data are lake;
 * what keeps your data yours is berry, as the blog's Security topic is.
 * These pages used to paint chat berry, docs sky and agents dusk while the
 * home page painted them sky, dusk and indigo (design/site-polish/AUDIT.md, C3).
 */
export const FEATURE_MARK: Record<FeatureIconKey, { hue: CampHue | "agent"; Glyph: ComponentType<SVGProps<SVGSVGElement>> }> = {
  chat: { hue: "sky", Glyph: ChatGlyph },
  video: { hue: "sky", Glyph: VideoGlyph },
  docs: { hue: "dusk", Glyph: DocGlyph },
  tasks: { hue: "moss", Glyph: TaskGlyph },
  board: { hue: "moss", Glyph: BoardGlyph },
  table: { hue: "lake", Glyph: TableGlyph },
  teams: { hue: "lake", Glyph: PeopleGlyph },
  calendar: { hue: "sun", Glyph: CalendarGlyph },
  automation: { hue: "sun", Glyph: BoltGlyph },
  api: { hue: "sun", Glyph: BoltGlyph },
  ai: { hue: "agent", Glyph: SparkGlyph },
  agent: { hue: "agent", Glyph: SparkGlyph },
  shield: { hue: "agent", Glyph: ShieldGlyph },
  audit: { hue: "dusk", Glyph: RecordGlyph },
  lock: { hue: "berry", Glyph: LockGlyph },
};
