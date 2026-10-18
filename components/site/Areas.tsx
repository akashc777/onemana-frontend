import type { ComponentType, SVGProps } from "react";
import { AREA, AREAS, type Area } from "@/lib/areas";
import { BoardGlyph, CalendarGlyph, ChatGlyph, DocGlyph, SparkGlyph, TableGlyph, VideoGlyph } from "@/components/site/Glyphs";
import { Tile, type TileSize } from "@/components/ui/graphics/Tile";

/**
 * The areas as the site draws them (design v3.1): each area's glyph, and its
 * tile, the glyph in the area's strong cut on its tint. The hue is never
 * chosen here: it is the area's, from lib/areas.ts (lib/areas.test.ts).
 */
export const AREA_GLYPH: Record<Area, ComponentType<SVGProps<SVGSVGElement>>> = {
  chat: ChatGlyph,
  calls: VideoGlyph,
  docs: DocGlyph,
  projects: BoardGlyph,
  calendar: CalendarGlyph,
  tables: TableGlyph,
  agents: SparkGlyph,
};

/** An area's tile. Decorative: it sits beside the area's name. `raised` for one that stands on its area's tint. */
export function AreaTile({ area, size = "sm", raised = false, className }: { area: Area; size?: TileSize; raised?: boolean; className?: string }) {
  const Glyph = AREA_GLYPH[area];
  return (
    <Tile hue={AREA[area].hue} size={size} surface={raised ? "raised" : "tint"} className={className}>
      <Glyph />
    </Tile>
  );
}

/**
 * The hero's key to the colours (v3.1): the seven areas, each a tile and a
 * name, two to a row and the agents across both, on the hairlines the facts
 * stood on. It is a key, not a menu, so it answers no pointer: nothing in it
 * opens anything, and nothing under the pointer pretends to. Seen here
 * first, each hue is then the same area all the way down the page: the
 * tour's tabs, the box's panels and the footer's flag.
 *
 * From lg, beside the headline; a phone's first screen is the headline and
 * the product, and the tour's tabs carry the colours there. The caller sets
 * when it shows (its display), so no two display classes meet here.
 */
export function AreaLegend({ className = "" }: { className?: string }) {
  return (
    <ul aria-label="What is in OneCamp" className={`m-0 list-none grid-cols-2 gap-x-6 border-t border-border p-0 ${className}`}>
      {AREAS.map((a) => (
        <li key={a} className={`flex h-[52px] items-center gap-3 border-b border-border text-small text-muted-foreground ${a === "agents" ? "col-span-2" : ""}`}>
          <AreaTile area={a} />
          {a === "agents" ? (
            <span>
              <b className="font-[510] text-foreground">Agents on the record</b>, every attempt
            </span>
          ) : (
            <b className="font-[510] text-foreground">{AREA[a].label}</b>
          )}
        </li>
      ))}
    </ul>
  );
}
