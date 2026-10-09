"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ProductShot, type ShotName } from "@/components/site/ProductShot";
import { site } from "@/lib/site";

/**
 * The product, one surface at a time: a tab, one sentence, one real screenshot.
 *
 * It replaced two sections that argued the same point ("everything your team
 * works in" and "what it actually looks like"), the second of them a drawn
 * mockup. Two rules carried over from the showcase it replaces, and
 * app/landingDiet.test.ts holds them: it never advances on its own (a surface
 * changing while you read it is a carousel), and only the chosen panel is in
 * the page, so four hidden panels are not in the tab order or the HTML.
 */
const TABS: { id: string; label: string; shot: ShotName; text: string; alt: string; place: string }[] = [
  {
    id: "chat",
    label: "Chat",
    shot: "chat",
    text: "Channels, threads and direct messages, with mentions, files and daily check-ins.",
    alt: "The #design channel in OneCamp: four people discussing a launch page.",
    place: "engineering",
  },
  {
    id: "docs",
    label: "Docs",
    shot: "docs",
    text: "Write together, with everyone's cursor on the page. Tasks and channels link straight to the doc.",
    alt: "The Q4 launch plan open in OneCamp's editor, with goals, owners and risks.",
    place: "docs",
  },
  {
    id: "tasks",
    label: "Tasks",
    shot: "tasks",
    text: "Boards, lists and timelines for every project, beside the conversation about the work.",
    alt: "The Q4 launch project as a board: To do, In progress and QA columns of task cards.",
    place: "board",
  },
  {
    id: "calendar",
    label: "Calendar",
    shot: "calendar",
    text: "Due dates and events in one calendar, two-way Google sync, booking pages. Video calls start from any channel, on your own server.",
    alt: "OneCamp's month calendar for October, with task due dates across the weeks.",
    place: "1",
  },
  {
    id: "agents",
    label: "Agents",
    shot: "agents",
    text: "Agents act for a person and can do only what that person can. Every action, and every refusal, is on the record.",
    alt: "The record of what an agent did: two refused attempts to post in a channel, each with its hash.",
    place: "drill",
  },
];

export function ProductTabs() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (to: number) => {
    const next = (to + TABS.length) % TABS.length;
    setActive(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") move(active + 1);
    else if (e.key === "ArrowLeft") move(active - 1);
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
        className="-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0"
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
            className={`relative -mb-px shrink-0 border-b-2 px-3 pb-3 pt-1 text-small font-medium transition-colors duration-150 ${
              i === active
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Only the chosen panel renders, the one at TABS[active]. */}
      <div id={`panel-${tab.id}`} role="tabpanel" aria-labelledby={`tab-${tab.id}`} className="pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <p className="max-w-2xl text-body text-muted-foreground">{tab.text}</p>
          <a
            href={site.demoUrlTo(tab.place)}
            target="_blank"
            rel="noreferrer"
            className="link shrink-0 text-small font-medium"
          >
            Open it in the live demo
          </a>
        </div>
        <ProductShot key={tab.shot} name={tab.shot} alt={tab.alt} className="mt-6" />
      </div>
    </div>
  );
}
