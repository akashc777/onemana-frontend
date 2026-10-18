import type { CSSProperties } from "react";
import Link from "next/link";
import { AREA } from "@/lib/areas";
import { hueOrAgent } from "@/components/ui/graphics/hues";
import { AreaTile } from "@/components/site/Areas";
import { MOMENT, type BoxArea } from "@/components/site/AreaMoments";
import { ix } from "@/lib/interactive";

/**
 * "Also in the box" (site.md H5, design v3.1): the breadth of the product,
 * by area. Each area is a panel: its tile and name on its own tint, one
 * moment of the product as it works today peeking up from the foot
 * (components/site/AreaMoments), and its features under it as links to
 * where each is explained. Every feature has shipped and every link is a
 * live page: a guide, or the release entry and the post that showed it.
 *
 * It was twelve rows of text, each icon in the next colour of the chart
 * order: twelve colours that named nothing. Now each colour is its area's
 * (lib/areas.ts), the same as the tour's tab above and the footer's flag
 * below, so the colour says where a feature lives.
 *
 * Three across from lg, two on a tablet. On a phone the panels are a row
 * that snaps one panel at a time, the next one showing at the edge so the
 * row says it goes on: the section is one panel tall, where the list was a
 * screen and a half. Nothing in it moves on its own.
 *
 * The panels are not links, so they do not lift; their links are chips in
 * the area's hue, the layer's chip kind: the hue's tint under the pointer,
 * a press under a finger, 44 px tall on a phone.
 */
export type BoxFeature = { name: string; href: string };

export const BOX_AREAS: { area: BoxArea; features: BoxFeature[] }[] = [
  {
    area: "chat",
    features: [
      { name: "Polls", href: "/docs/polls" },
      { name: "Guests in a channel", href: "/docs/channel-guests" },
      { name: "Slack bridge", href: "/docs/slack-bridge" },
    ],
  },
  {
    area: "calls",
    features: [
      { name: "Calls beside the chat", href: "/docs/side-by-side" },
      { name: "Voice, video and screen clips", href: "/docs/clips" },
    ],
  },
  {
    area: "docs",
    features: [
      { name: "Pages, comments and versions", href: "/changelog/2026-10-17-docs-with-room-for-the-whole-team" },
      { name: "Toggles, tables and equations", href: "/blog/docs-on-the-demo-now-toggles-tables-equations-find-and-replace" },
    ],
  },
  {
    area: "projects",
    features: [
      { name: "Goals", href: "/docs/goals" },
      { name: "Time and invoices", href: "/docs/time-tracking" },
      { name: "Intake forms", href: "/docs/intake-forms" },
      { name: "Templates", href: "/docs/project-templates" },
      { name: "Reports", href: "/docs/reports" },
    ],
  },
  {
    area: "calendar",
    features: [
      { name: "Booking pages", href: "/docs/booking-pages" },
      { name: "Focus time", href: "/docs/pause-notifications" },
    ],
  },
  {
    area: "tables",
    features: [
      { name: "Formulas", href: "/docs/formulas" },
      { name: "Linked tables and rollups", href: "/docs/linked-tables" },
    ],
  },
];

/** What belongs to no one area: how a team arrives, and where it works from. Named as the sentence under the panels says them. */
export const BOX_ALSO: BoxFeature[] = [
  { name: "imports from Asana, monday.com and ClickUp", href: "/docs/import-from-other-tools" },
  { name: "the desktop app for Windows, macOS and Linux", href: "/docs/desktop-app" },
];

/** Every feature the box names, in order. */
export const BOX: BoxFeature[] = [...BOX_AREAS.flatMap((a) => a.features), ...BOX_ALSO];

/** The stage's light: the area's strong cut from the top right over its tint, as the tour's stage has it. */
const STAGE: CSSProperties = { backgroundImage: "radial-gradient(90% 100% at 100% 0%, rgb(var(--hue) / 0.22), transparent 70%)" };

export function AlsoInTheBox() {
  return (
    <div className="reveal">
      <ul
        aria-label="OneCamp's areas and what each one holds"
        className="fade-x -mx-4 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 pt-1 [scroll-padding-inline:1rem] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 sm:pt-0 sm:[mask-image:none] lg:grid-cols-3"
      >
        {BOX_AREAS.map(({ area, features }) => {
          const hue = AREA[area].hue;
          const Moment = MOMENT[area];
          return (
            <li
              key={area}
              id={`box-${area}`}
              className={`${hueOrAgent(hue)} group/area relative flex w-[82%] max-w-[340px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-card shadow-e1 sm:w-auto sm:max-w-none`}
            >
              <div className="relative h-[196px] overflow-hidden bg-hue-tint" style={STAGE}>
                <h3 className="absolute left-4 top-4 m-0 flex items-center gap-2.5 font-sans text-body font-[590] text-foreground sm:left-5">
                  <AreaTile area={area} raised />
                  {AREA[area].label}
                </h3>
                <Moment />
              </div>
              <ul className="m-0 flex list-none flex-wrap content-start gap-1.5 p-4 sm:p-5" aria-label={`${AREA[area].label}: what it holds`}>
                {features.map((f) => (
                  <li key={f.href}>
                    <Link
                      href={f.href}
                      {...ix("chip", { hue })}
                      className="inline-flex min-h-11 items-center rounded-md px-2.5 text-caption font-[510] text-foreground ring-1 ring-inset ring-line-2 sm:min-h-8"
                    >
                      {f.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-small text-muted-foreground">
        Plus{" "}
        <Link href={BOX_ALSO[0]!.href} className="link-quiet">
          {BOX_ALSO[0]!.name}
        </Link>
        , and{" "}
        <Link href={BOX_ALSO[1]!.href} className="link-quiet">
          {BOX_ALSO[1]!.name}
        </Link>
        .
      </p>
    </div>
  );
}
