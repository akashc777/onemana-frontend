"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Arrow } from "@/components/ui/v3";
import { hueOrAgent } from "@/components/ui/graphics/hues";
import type { CampHue } from "@/lib/campHue";
import { site } from "@/lib/site";
import type { LaterTourId, TourId } from "@/components/site/showcase/tour";
import { TourScene } from "@/components/site/showcase/TourScene";
import { LATER_SCENES, whenIdle, type ScenePair } from "@/components/site/showcase/tourLater";
// The later surfaces' own styles still come with the page, as they did when
// the surfaces did: only their markup and code wait (tourLater.ts). Left to
// the surfaces' chunks, each stylesheet would be added to the page when its
// surface arrives, after the others, which changes the cascade's order.
import "@/components/site/showcase/board.css";
import "@/components/site/showcase/calendar.css";
import "@/components/site/showcase/palette.css";

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
 *
 * Only the first surface comes with the page, drawn on the server (`first`).
 * The others are fetched once the tour is near the screen and the browser is
 * idle, or as soon as a reader points at or focuses a chip (tourLater.ts).
 * A surface chosen before it has arrived takes the stage when it does; until
 * then the stage keeps the scene it has, so nothing on the page moves.
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

// One fetch per surface for the page's life; a failed one (offline) is
// forgotten, so reaching for the tab again tries again.
const arriving = new Map<LaterTourId, Promise<ScenePair>>();
function fetchScene(id: LaterTourId): Promise<ScenePair> {
  let scene = arriving.get(id);
  if (!scene) {
    scene = LATER_SCENES[id]();
    arriving.set(id, scene);
    scene.catch(() => arriving.delete(id));
  }
  return scene;
}

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

export function ProductTabs({ first }: { first: ReactNode }) {
  const [active, setActive] = useState(0);
  // Whether the reader has chosen a surface: from then on a new surface's
  // parts arrive in a stagger. The page's first surface is drawn as it is.
  const [chosen, setChosen] = useState(false);
  // The surfaces after the first, as they arrive.
  const [later, setLater] = useState<Partial<Record<LaterTourId, ScenePair>>>({});
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);

  const want = useCallback((id: TourId) => {
    if (id === "docs") return;
    fetchScene(id).then(
      (scene) => setLater((had) => (had[id] ? had : { ...had, [id]: scene })),
      () => {},
    );
  }, []);

  // Near the screen (or at once, without IntersectionObserver), the rest are
  // fetched when the browser is next idle.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let cancel = () => {};
    const fetchAll = () => TABS.forEach((t) => want(t.id));
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([e]) => {
              if (!e?.isIntersecting) return;
              io?.disconnect();
              cancel = whenIdle(fetchAll);
            },
            { rootMargin: "400px 0px" },
          );
    if (io) io.observe(el);
    else cancel = whenIdle(fetchAll);
    return () => {
      io?.disconnect();
      cancel();
    };
  }, [want]);

  // The surface on the stage: the chosen one once it is here, until then the
  // one before it.
  const ready = (i: number) => {
    const id = TABS[i].id;
    return id === "docs" || later[id] !== undefined;
  };
  const [shown, setShown] = useState(0);
  if (shown !== active && ready(active)) setShown(active);

  const choose = (i: number) => {
    want(TABS[i].id);
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
  const onStage = TABS[shown];
  const scene = onStage.id === "docs" ? undefined : later[onStage.id];

  return (
    <div ref={root}>
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
            onPointerEnter={() => want(t.id)}
            onFocus={() => want(t.id)}
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
      <div
        id={`panel-${tab.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab.id}`}
        aria-busy={shown !== active ? true : undefined}
        className="mt-7 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10"
      >
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

        <Stage hue={onStage.hue}>
          {/* Keyed by the surface: a new tab's scene cross-fades in, its parts in a stagger. */}
          <div key={onStage.id} className="sc-swap" data-sc-entering={chosen ? "" : undefined}>
            {scene ? <TourScene desktop={scene.desktop} phone={scene.phone} /> : first}
          </div>
        </Stage>
      </div>
    </div>
  );
}
