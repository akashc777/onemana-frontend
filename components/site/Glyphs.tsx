import type { SVGProps } from "react";

/**
 * The few glyphs the storefront's tiles hold: one per product surface and one
 * per way to have OneCamp. Drawn on the 24 grid with a 1.5 stroke and round
 * ends, the line the site's other marks use (the menu, the theme switch), so
 * they sit with the app's icons. Each is decorative: it sits in a Tile beside
 * the words it illustrates, and draws in currentColor, which the Tile sets to
 * its hue's strong cut.
 *
 * Inline, a few hundred bytes each, and server-rendered: no icon library and
 * no JavaScript for the sake of a dozen lines.
 */
function Glyph({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** A doc: a page with a folded corner and two lines. */
export function DocGlyph(p: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...p}>
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4M9 12h6M9 16h4" />
    </Glyph>
  );
}

/** A task: a ticked box. */
export function TaskGlyph(p: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...p}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </Glyph>
  );
}

/** A calendar sheet. */
export function CalendarGlyph(p: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...p}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </Glyph>
  );
}

/** An agent: the motif's four-point spark. */
export function SparkGlyph(p: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...p}>
      <path d="M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5z" />
      <path d="M18.5 16.5v3M17 18h3" />
    </Glyph>
  );
}

/** A channel: a speech bubble with a hash. */
export function ChatGlyph(p: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...p}>
      <path d="M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-4 3.5V17H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
      <path d="M10 8.5l-1 6M14 8.5l-1 6M8.5 10.5h7M8 12.5h7" />
    </Glyph>
  );
}

/** People: two heads, for the free plan's 25 places. */
export function PeopleGlyph(p: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...p}>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
      <circle cx="16.5" cy="8" r="2.5" />
      <path d="M16 13.5c2.4 0 4 1.3 4.5 4" />
    </Glyph>
  );
}

/** A key: the licence. */
export function KeyGlyph(p: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...p}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l8-8M16 7l2.5 2.5M14 9l2 2" />
    </Glyph>
  );
}

/** A cloud: run by us. */
export function CloudGlyph(p: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...p}>
      <path d="M7.5 18.5h9.5a3.5 3.5 0 0 0 .4-7A5.5 5.5 0 0 0 6.8 10 4.25 4.25 0 0 0 7.5 18.5z" />
    </Glyph>
  );
}
