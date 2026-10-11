import type { SVGProps } from "react";
import { Icon, type IconName } from "@/components/ui/icons";

/**
 * The glyphs the storefront's tiles hold, one per product surface and one per
 * way to have OneCamp, by the names the pages have always imported. Each is
 * an icon from the one set (components/ui/icons.tsx), so it has the site's
 * one rendered 1.25px stroke at any size, and draws in currentColor, which a
 * Tile sets to its hue's strong cut. Decorative: it sits beside the words it
 * illustrates.
 */
type GlyphProps = Omit<SVGProps<SVGSVGElement>, "name" | "d">;

const glyph = (name: IconName) => {
  function Glyph(p: GlyphProps) {
    return <Icon name={name} {...p} />;
  }
  Glyph.displayName = `Glyph(${name})`;
  return Glyph;
};

/** A doc: a page with a folded corner and two lines. */
export const DocGlyph = glyph("doc");
/** A task: a ticked box. */
export const TaskGlyph = glyph("task");
/** A calendar sheet. */
export const CalendarGlyph = glyph("calendar");
/** An agent: the motif's four-point spark. */
export const SparkGlyph = glyph("agent");
/** A channel: a speech bubble with a hash. */
export const ChatGlyph = glyph("chat");
/** People: two heads, for the free plan's 25 places. */
export const PeopleGlyph = glyph("people");
/** A key: the licence. */
export const KeyGlyph = glyph("key");
/** A cloud: run by us. */
export const CloudGlyph = glyph("cloud");
/** A padlock: something kept private. */
export const LockGlyph = glyph("lock");
/** A shield with a tick: a rule that holds. */
export const ShieldGlyph = glyph("shield");
/** The record: rows joined by a chain. */
export const RecordGlyph = glyph("record");
/** A board: three columns of cards. */
export const BoardGlyph = glyph("board");
/** A table: a grid of cells. */
export const TableGlyph = glyph("table");
/** Something that runs by itself: a bolt. */
export const BoltGlyph = glyph("bolt");
/** A call: a camera. */
export const VideoGlyph = glyph("video");
