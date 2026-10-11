"use client";

import { getImageProps } from "next/image";
import { useRef, useState, type ComponentType, type KeyboardEvent, type ReactNode, type SVGProps } from "react";
import { ProductShot, SHOT, type ShotName } from "@/components/site/ProductShot";
import { CalendarGlyph, ChatGlyph, DocGlyph, SparkGlyph, TaskGlyph } from "@/components/site/Glyphs";
import { AgentSquare, Arrow, Face } from "@/components/ui/v3";
import { hueOrAgent } from "@/components/ui/graphics/hues";
import type { CampHue } from "@/lib/campHue";
import { site } from "@/lib/site";

/**
 * The product, one surface at a time (site.md H4): a row of hued chips, the
 * surface's own title and one sentence, and the real screenshot on a stage
 * in the surface's hue, with one small scripted moment playing over it.
 *
 * Each surface wears its hue from the chip's dot to the stage to the spot
 * tile (G7: Docs dusk, Tasks moss, Calendar sun, Agents the agent's indigo,
 * Chat sky, as #engineering is in the hero). Chat is last because the hero
 * is already a channel.
 *
 * Two rules carried over from the showcase this replaced, and
 * app/landingDiet.test.ts holds them: it never advances on its own (a
 * surface changing while you read it is a carousel), and only the chosen
 * panel is in the page, so four hidden panels are not in the tab order or
 * the HTML. The moments are CSS, keyed to the tab, so they play once per
 * choice with no timer; under reduced motion they show their end state.
 */
type Tab = {
  id: string;
  label: string;
  shot: ShotName;
  /** The camp hue, or the agent's indigo. */
  hue: CampHue | "agent";
  Glyph: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  text: string;
  alt: string;
  place: string;
  /** The moment's words, for screen readers (the drawn moment is aria-hidden). */
  momentText: string;
  moment: () => ReactNode;
};

const TYPING = (
  <span className="ml-1 inline-flex items-center gap-[3px]" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <span key={i} className={`bob size-1 rounded-full bg-muted-foreground ${i === 1 ? "at-120" : i === 2 ? "at-240" : ""}`} />
    ))}
  </span>
);

const TABS: Tab[] = [
  {
    id: "docs",
    label: "Docs",
    shot: "docs",
    hue: "dusk",
    Glyph: DocGlyph,
    title: "Write together",
    text: "Everyone's cursor on the page. Tasks and channels link straight to the doc.",
    alt: "The Q4 launch plan open in OneCamp's editor, with goals, owners and risks.",
    place: "docs",
    momentText: "Jonas added Rollback steps under Decisions.",
    moment: () => (
      <>
        <Face initials="JW" hue="berry" size={24} />
        <span>
          <b className="font-[590]">Jonas</b> added &ldquo;Rollback steps&rdquo; under Decisions
        </span>
      </>
    ),
  },
  {
    id: "tasks",
    label: "Tasks",
    shot: "tasks",
    hue: "moss",
    Glyph: TaskGlyph,
    title: "Boards, lists and timelines",
    text: "Every project's work in one place, beside the conversation about it.",
    alt: "The Q4 launch project as a board: To do, In progress and QA columns of task cards.",
    place: "board",
    momentText: "Q4-17 moved to Done.",
    moment: () => (
      <>
        <span className="fx-spring at-480 hue-moss inline-flex size-6 items-center justify-center rounded-full bg-hue text-white">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3.5 8.5l3 3 6-7" />
          </svg>
        </span>
        <span>
          <b className="font-[590]">Q4-17</b> moved to Done
        </span>
      </>
    ),
  },
  {
    id: "calendar",
    label: "Calendar",
    shot: "calendar",
    hue: "sun",
    Glyph: CalendarGlyph,
    title: "One calendar for the work",
    text: "Due dates and events together, two-way Google sync, and booking pages for people outside.",
    alt: "OneCamp's month calendar for October, with task due dates across the weeks.",
    place: "1",
    momentText: "Acme kickoff booked for Thursday at 14:00, in their time zone.",
    moment: () => (
      <>
        <span className="hue-sun inline-flex size-6 items-center justify-center rounded-md bg-hue-tint text-hue">
          <CalendarGlyph className="size-3.5" />
        </span>
        <span>
          <b className="font-[590]">Acme kickoff</b> booked for Thu 14:00, in their time zone
        </span>
      </>
    ),
  },
  {
    id: "agents",
    label: "Agents",
    shot: "agents",
    hue: "agent",
    Glyph: SparkGlyph,
    title: "Agents on the record",
    text: "An agent can do only what its person can. Every action, and every refusal, is written down.",
    alt: "Your record of what agents did as you: two attempts to post in a channel, each refused by permissions.",
    place: "drill",
    momentText: "The agent tried to post to #finance and was refused.",
    moment: () => (
      <>
        <AgentSquare size={24} />
        <span>
          Post to <b className="font-[590]">#finance</b>
        </span>
        <span className="fx-stamp at-700 ml-1 rounded-[5px] px-1.5 text-[11px] font-[590] uppercase leading-[18px] tracking-[0.04em] text-camp-berry-ink ring-1 ring-camp-berry/60 [background:rgb(var(--camp-berry-tint))]">
          Refused
        </span>
      </>
    ),
  },
  {
    id: "chat",
    label: "Chat",
    shot: "chat",
    hue: "sky",
    Glyph: ChatGlyph,
    title: "Channels, threads and calls",
    text: "Direct messages, mentions, files and check-ins, and a video call from any channel on your own server.",
    alt: "The #design channel in OneCamp: four people discussing a launch page.",
    place: "engineering",
    momentText: "Maya Chen is typing.",
    moment: () => (
      <>
        <Face initials="MC" hue="moss" size={24} />
        <span>
          <b className="font-[590]">Maya Chen</b> is typing
        </span>
        {TYPING}
      </>
    ),
  },
];

const hueClass = hueOrAgent;

const warmed = new Set<string>();

/**
 * Start downloading a tab's screenshot when the pointer or the keyboard
 * reaches its tab, so the picture is there when the tab is chosen. The file
 * is the one the panel will ask for, so the browser finds it in its cache.
 * Each file once per visit, in the theme being shown.
 */
export function warm(shot: ShotName) {
  if (typeof window === "undefined") return;
  const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  const key = `${shot}-${theme}`;
  if (warmed.has(key)) return;
  warmed.add(key);
  const { props } = getImageProps({ src: `/product/${shot}-${theme}.webp`, width: SHOT.width, height: SHOT.height, sizes: `${SHOT.width}px`, alt: "" });
  const img = new Image();
  img.sizes = props.sizes ?? "";
  img.srcset = props.srcSet ?? "";
  img.src = props.src;
}

export function ProductTabs({ taken = "10 Oct" }: { taken?: string }) {
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
    <div>
      <div
        role="tablist"
        aria-label="Parts of OneCamp"
        onKeyDown={onKeyDown}
        className="fade-x -mx-4 flex snap-x gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:[mask-image:none]"
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
            className={`${hueClass(t.hue)} flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-md px-3 text-caption font-[510] transition-[background-color,box-shadow,color] duration-hover sm:min-h-8 ${
              i === active ? "bg-card text-foreground shadow-e2" : "text-muted-foreground hover:bg-hover hover:text-foreground"
            }`}
          >
            <span aria-hidden="true" className="size-[7px] rounded-full bg-hue" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Only the chosen panel renders, the one at TABS[active]. */}
      <div id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} className="mt-7 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
        <div key={tab.id} className="fx-fade lg:pt-2">
          <h3 className="text-h3 text-foreground">{tab.title}</h3>
          <p className="mt-3 text-body text-muted-foreground">
            {tab.text}
            <span className="sr-only"> In the screenshot: {tab.momentText}</span>
          </p>
          <a href={site.demoUrlTo(tab.place)} target="_blank" rel="noreferrer" className="go tap-target mt-4">
            Open it in the live demo <Arrow size={14} />
          </a>
          <p className={`${hueClass(tab.hue)} mt-6 hidden items-center gap-2 border-y border-border py-3 text-caption text-muted-foreground lg:flex`}>
            <span aria-hidden="true" className="size-[7px] rounded-full bg-hue" />
            The screen is the demo&apos;s, taken {taken}
          </p>
        </div>

        <ProductShot name={tab.shot} hue={tab.hue} alt={tab.alt} className="h-[440px] sm:h-[600px]">
          {/* The surface's spot tile, springing in with each choice. */}
          <span key={`spot-${tab.id}`} aria-hidden="true" className="fx-spring absolute bottom-4 right-4 z-10 flex size-14 items-center justify-center rounded-[20px] bg-pop shadow-e3 sm:bottom-6 sm:right-6 sm:size-[72px]">
            <span className="flex size-9 items-center justify-center rounded-lg bg-hue-tint text-hue sm:size-11 sm:rounded-xl [&>svg]:size-5">
              <tab.Glyph />
            </span>
          </span>
          {/* The moment: HTML over the screenshot, never a video. */}
          <span key={`m-${tab.id}`} aria-hidden="true" className="fx-slide at-300 absolute bottom-4 left-4 right-20 z-10 flex items-center gap-2.5 rounded-xl bg-pop py-2 pl-2 pr-3 text-caption text-foreground shadow-e3 sm:bottom-auto sm:left-24 sm:right-auto sm:top-[66%]">
            {tab.moment()}
          </span>
        </ProductShot>
      </div>
    </div>
  );
}
