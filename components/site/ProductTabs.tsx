"use client";

import { getImageProps } from "next/image";
import { useRef, useState, type ComponentType, type KeyboardEvent, type SVGProps } from "react";
import { ProductShot, type ShotName } from "@/components/site/ProductShot";
import { CalendarGlyph, ChatGlyph, DocGlyph, SparkGlyph, TaskGlyph } from "@/components/site/Glyphs";
import { Tile } from "@/components/ui/graphics/Tile";
import type { CampHue } from "@/lib/campHue";
import { site } from "@/lib/site";

/**
 * The product, one surface at a time: a tab, one sentence, one real screenshot.
 *
 * On a wide screen the tabs stand in the margin as a vertical list with the
 * chosen surface's sentence under it, and the screenshot fills the measure:
 * a different shape from the hero's full-width figure just above, so the two
 * do not read as the same section twice. Chat is last because the hero is
 * already a channel. On a phone the tabs are a row that scrolls.
 *
 * It replaced two sections that argued the same point ("everything your team
 * works in" and "what it actually looks like"), the second of them a drawn
 * mockup. Two rules carried over from the showcase it replaces, and
 * app/landingDiet.test.ts holds them: it never advances on its own (a surface
 * changing while you read it is a carousel), and only the chosen panel is in
 * the page, so four hidden panels are not in the tab order or the HTML.
 *
 * Each surface has a camp hue, in the palette's chart order (sky, moss, sun,
 * dusk, berry): its tab carries a tile in that hue and the screenshot's stage
 * takes its tint, so the colour follows the surface from the tab to the
 * picture. The accent stays where it was, on the chosen tab's edge.
 */
type Tab = {
  id: string;
  label: string;
  shot: ShotName;
  hue: CampHue;
  Glyph: ComponentType<SVGProps<SVGSVGElement>>;
  text: string;
  alt: string;
  place: string;
};

const TABS: Tab[] = [
  {
    id: "docs",
    label: "Docs",
    shot: "docs",
    hue: "sky",
    Glyph: DocGlyph,
    text: "Write together, with everyone's cursor on the page. Tasks and channels link straight to the doc.",
    alt: "The Q4 launch plan open in OneCamp's editor, with goals, owners and risks.",
    place: "docs",
  },
  {
    id: "tasks",
    label: "Tasks",
    shot: "tasks",
    hue: "moss",
    Glyph: TaskGlyph,
    text: "Boards, lists and timelines for every project, beside the conversation about the work.",
    alt: "The Q4 launch project as a board: To do, In progress and QA columns of task cards.",
    place: "board",
  },
  {
    id: "calendar",
    label: "Calendar",
    shot: "calendar",
    hue: "sun",
    Glyph: CalendarGlyph,
    text: "Due dates and events in one calendar, two-way Google sync, booking pages. Video calls start from any channel, on your own server.",
    alt: "OneCamp's month calendar for October, with task due dates across the weeks.",
    place: "1",
  },
  {
    id: "agents",
    label: "Agents",
    shot: "agents",
    hue: "dusk",
    Glyph: SparkGlyph,
    text: "Agents act for a person and can do only what that person can. Every action, and every refusal, is on the record.",
    alt: "The record of what an agent did: two refused attempts to post in a channel, each with its hash.",
    place: "drill",
  },
  {
    id: "chat",
    label: "Chat",
    shot: "chat",
    hue: "berry",
    Glyph: ChatGlyph,
    text: "Channels, threads and direct messages, with mentions, files and daily check-ins.",
    alt: "The #design channel in OneCamp: four people discussing a launch page.",
    place: "engineering",
  },
];

/** How wide the panel's screenshot is drawn; the warm-up below asks for the same file. */
export const SHOT_SIZES = "(min-width: 1120px) 1000px, 220vw";

const warmed = new Set<string>();

/**
 * Start downloading a tab's screenshot when the pointer or the keyboard
 * reaches its tab, so the picture is there when the tab is chosen. Choosing a
 * tab used to show an empty frame for as long as a 60 to 90 kB image took.
 * The file is the one the panel will ask for: same source, same sizes, so the
 * browser picks the same width from the srcset and finds it in its cache.
 * Each file once per visit, in the theme being shown.
 */
export function warm(shot: ShotName) {
  if (typeof window === "undefined") return;
  const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  const key = `${shot}-${theme}`;
  if (warmed.has(key)) return;
  warmed.add(key);
  const { props } = getImageProps({ src: `/product/${shot}-${theme}.webp`, width: 2240, height: 1400, sizes: SHOT_SIZES, alt: "" });
  const img = new Image();
  img.sizes = props.sizes ?? SHOT_SIZES;
  img.srcset = props.srcSet ?? "";
  img.src = props.src;
}

export function ProductTabs() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (to: number) => {
    const next = (to + TABS.length) % TABS.length;
    setActive(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") move(active + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") move(active - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(TABS.length - 1);
    else return;
    e.preventDefault();
  };

  const tab = TABS[active];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-x-10">
      <div className="min-w-0 lg:col-span-3">
        <div
          role="tablist"
          aria-label="Parts of OneCamp"
          onKeyDown={onKeyDown}
          className="-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-b-0 lg:border-l"
        >
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={i === active}
              aria-controls={`panel-${t.id}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onPointerEnter={() => warm(t.shot)}
              // Arrow keys choose as they move, so the neighbours are warmed too.
              onFocus={() => [i - 1, i, i + 1].forEach((n) => warm(TABS[(n + TABS.length) % TABS.length].shot))}
              className={`relative -mb-px flex min-h-11 shrink-0 items-center gap-2.5 border-b-2 px-2 pb-2.5 pt-1 text-left text-small font-medium transition-colors duration-150 lg:-ml-px lg:mb-0 lg:min-h-0 lg:gap-3 lg:border-b-0 lg:border-l-2 lg:py-2 lg:pl-4 lg:text-body ${
                i === active
                  ? "border-brand text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tile hue={t.hue} size="sm" className="lg:size-8 lg:rounded-lg lg:[&>svg]:size-4">
                <t.Glyph />
              </Tile>
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-5 hidden text-body text-muted-foreground lg:block">{tab.text}</p>
        <a
          href={site.demoUrlTo(tab.place)}
          target="_blank"
          rel="noreferrer"
          className="link mt-4 hidden text-small font-medium lg:inline-block"
        >
          Open it in the live demo
        </a>
      </div>

      {/* Only the chosen panel renders, the one at TABS[active]. */}
      <div id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} className="min-w-0 lg:col-span-9">
        <div className="mb-5 flex flex-col gap-3 lg:hidden">
          <p className="text-body text-muted-foreground">{tab.text}</p>
          <a href={site.demoUrlTo(tab.place)} target="_blank" rel="noreferrer" className="link tap-target self-start text-small font-medium">
            Open it in the live demo
          </a>
        </div>
        <ProductShot name={tab.shot} hue={tab.hue} alt={tab.alt} crop sizes={SHOT_SIZES} />
      </div>
    </div>
  );
}
