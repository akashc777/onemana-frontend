"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Arrow } from "@/components/ui/v3";
import { hueOrAgent } from "@/components/ui/graphics/hues";
import type { CampHue } from "@/lib/campHue";
import { site } from "@/lib/site";
import type { TourId } from "@/components/site/showcase/tour";

/**
 * The product, one surface at a time (site.md H4): a row of hued chips, the
 * surface's own title and one sentence, and the surface itself on a stage in
 * its hue: OneCamp drawn by its own components (components/site/showcase),
 * playing one moment when it is chosen and seen.
 *
 * Each surface wears its hue from the chip's dot to the stage (G7: Docs dusk,
 * Tasks moss, Calendar sun, Agents the agent's indigo, Ask lake, Chat sky, as
 * #engineering is in the hero). Chat is last because the hero is already a
 * channel.
 *
 * Two rules carried over from the showcase this replaced, and
 * app/landingDiet.test.ts holds them: it never advances on its own (a
 * surface changing while you read it is a carousel), and only the chosen
 * panel is in the page, so four hidden panels are not in the tab order or
 * the HTML. Choosing a tab cross-fades the stage to the new surface, whose
 * parts arrive in a short stagger (SceneDirector); under reduced motion it
 * simply shows.
 */
type Tab = {
  id: TourId;
  label: string;
  /** The camp hue, or the agent's indigo. */
  hue: CampHue | "agent";
  title: string;
  text: string;
  place: string;
};

const TABS: Tab[] = [
  {
    id: "docs",
    label: "Docs",
    hue: "dusk",
    title: "Write together",
    text: "Everyone's cursor on the page. Tasks and channels link straight to the doc.",
    place: "docs",
  },
  {
    id: "tasks",
    label: "Tasks",
    hue: "moss",
    title: "Boards, lists and timelines",
    text: "Every project's work in one place, beside the conversation about it.",
    place: "board",
  },
  {
    id: "calendar",
    label: "Calendar",
    hue: "sun",
    title: "One calendar for the work",
    text: "Due dates and events together, two-way Google sync, and booking pages for people outside.",
    place: "1",
  },
  {
    id: "agents",
    label: "Agents",
    hue: "agent",
    title: "Agents on the record",
    text: "An agent can do only what its person can. Every action, and every refusal, is written down.",
    place: "drill",
  },
  {
    id: "ask",
    label: "Ask",
    hue: "lake",
    title: "Search, or ask",
    text: "One box for every message, doc and task. Ask, and OneCamp AI answers only from what you can open.",
    place: "engineering",
  },
  {
    id: "chat",
    label: "Chat",
    hue: "sky",
    title: "Channels, threads and calls",
    text: "Direct messages, mentions, files and check-ins, and a video call from any channel on your own server.",
    place: "engineering",
  },
];

const hueClass = hueOrAgent;

/** The tour's ground: the hue's tint with a 22% radial of its strong cut from the top right. Its tint changes over 240ms. */
function Stage({ children, hue }: { children: ReactNode; hue: CampHue | "agent" }) {
  return (
    <div
      className={`${hueClass(hue)} relative isolate overflow-hidden rounded-3xl bg-hue-tint p-2 transition-colors duration-panel ease-in-out sm:p-8`}
      style={{ backgroundImage: "radial-gradient(70% 70% at 100% 0%, rgb(var(--hue) / 0.22), transparent 65%)" } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function ProductTabs({ scenes }: { scenes: Record<TourId, ReactNode> }) {
  const [active, setActive] = useState(0);
  // Whether the reader has chosen a surface: from then on a new surface's
  // parts arrive in a stagger. The page's first surface is drawn as it is.
  const [chosen, setChosen] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const choose = (i: number) => {
    setActive(i);
    setChosen(true);
  };

  const move = (to: number) => {
    const next = (to + TABS.length) % TABS.length;
    choose(next);
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
            onClick={() => choose(i)}
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
          <p className="mt-3 text-body text-muted-foreground">{tab.text}</p>
          <a href={site.demoUrlTo(tab.place)} target="_blank" rel="noreferrer" className="go tap-target mt-4">
            Open it in the live demo <Arrow size={14} />
          </a>
          <p className={`${hueClass(tab.hue)} mt-6 hidden items-center gap-2 border-y border-border py-3 text-caption text-muted-foreground lg:flex`}>
            <span aria-hidden="true" className="size-[7px] rounded-full bg-hue" />
            The live demo&apos;s data, in the app&apos;s own design
          </p>
        </div>

        <Stage hue={tab.hue}>
          {/* Keyed by the surface: a new tab's scene cross-fades in, its parts in a stagger. */}
          <div key={tab.id} className="sc-swap" data-sc-entering={chosen ? "" : undefined}>
            {scenes[tab.id]}
          </div>
        </Stage>
      </div>
    </div>
  );
}
