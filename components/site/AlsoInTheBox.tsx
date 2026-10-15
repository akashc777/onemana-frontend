import Link from "next/link";
import { CAMP_HUES } from "@/lib/campHue";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { Icon } from "@/components/ui/icons";
import { ix } from "@/lib/interactive";

/**
 * "Also in the box" (site.md H5): the breadth that lived only in the docs,
 * each a name and one line, linking to its doc. Every item has shipped; each
 * slug is a live doc. Hues cycle in chart order.
 */
export const BOX: { name: string; line: string; slug: string; d: string }[] = [
  { name: "Guests in a channel", line: "Clients join one channel, never your workspace.", slug: "channel-guests", d: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 8v6M14 11h6" },
  { name: "Booking pages", line: "A link anyone can book your free time from.", slug: "booking-pages", d: "M5 6h14v14H5zM5 10h14M9 3v4M15 3v4M10 15l2 2 3-4" },
  { name: "Time and invoices", line: "Timers on tasks, billable hours, invoices that add up.", slug: "time-tracking", d: "M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M10 2h4" },
  { name: "Goals", line: "Outcomes whose progress fills in from the work.", slug: "goals", d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01" },
  { name: "Reports", line: "What got done and what came in, every week.", slug: "reports", d: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { name: "Intake forms", line: "A form for anyone; each answer becomes a task.", slug: "intake-forms", d: "M6 3h9l4 4v14H6zM9 11h7M9 15h7M9 7h3" },
  { name: "Imports with fields", line: "Asana, monday.com, ClickUp and more, fields included.", slug: "import-from-other-tools", d: "M12 3v12M7 10l5 5 5-5M4 20h16" },
  { name: "Desktop app", line: "Windows, macOS and Linux, with on-device dictation.", slug: "desktop-app", d: "M3 5h18v11H3zM8 20h8M12 16v4" },
  { name: "Slack bridge", line: "One conversation, carried in Slack and OneCamp.", slug: "slack-bridge", d: "M7 8h10a3 3 0 0 1 0 6H7M10 5 7 8l3 3M14 17l3-3" },
  { name: "Templates", line: "Start a project from a plan that already works.", slug: "project-templates", d: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 16.5h7M16.5 13v7" },
  { name: "Tables and formulas", line: "Typed columns, linked rows and Airtable-style formulas.", slug: "formulas", d: "M3 5h18v14H3zM3 10h18M9 5v14" },
  { name: "Polls", line: "One-click votes in a channel, with live results.", slug: "polls", d: "M5 20V12M12 20V5M19 20v-5" },
];

/**
 * An index, not a wall of cards: twelve rows in three columns (two on a
 * tablet, one on a phone), each under its own hairline, with its glyph in
 * the item's hue, a name and one line, the whole row the link to its doc.
 * It was twelve identical cards with an icon tile each, the grid DESIGN.md
 * names as the most recognisable shape of a template site; an enumeration
 * that answers "does it have X" reads best as a list you scan. Under the
 * pointer the name takes the ink of a link and the arrow arrives; nothing
 * moves the row.
 */
export function AlsoInTheBox() {
  return (
    <ul className="reveal m-0 grid list-none gap-x-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {BOX.map((b, i) => (
        <li key={b.slug} className="border-t border-border">
          {/* .box-row and .box-name (globals.css): the name's ink and its arrow under the pointer. */}
          {/* A row of the interaction layer: the quiet tint under the pointer
              and the press tint under a finger (storefront audit H11), past
              the text by 12 px so the words keep their line. */}
          <Link href={`/docs/${b.slug}`} {...ix("row", { quiet: true })} className="box-row -mx-3 flex h-full min-h-11 gap-3.5 rounded-lg px-3 py-4 sm:py-5">
            <span aria-hidden="true" className={`${HUE_CLASS[CAMP_HUES[i % CAMP_HUES.length]!]} mt-[3px] text-hue`}>
              <Icon d={b.d} size={20} />
            </span>
            <span className="block min-w-0 flex-1">
              <span className="box-name text-body font-[590] text-foreground">{b.name}</span>
              <span className="mt-1 block text-balance text-small text-muted-foreground">{b.line}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
