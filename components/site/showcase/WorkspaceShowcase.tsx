"use client";

// landing-diet: product-mock -- the text below is simulated PRODUCT UI (channel
// posts, table rows, board cards), not marketing copy, so it is outside the
// homepage word budget. See app/landingWordBudget.test.ts.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ShowcaseShell } from "@/components/site/showcase/ShowcaseShell";
import { CalendarShowcase } from "@/components/site/showcase/CalendarShowcase";
import { DocShowcase } from "@/components/site/showcase/DocShowcase";
import { TasksShowcase } from "@/components/site/showcase/TasksShowcase";
import { BoardShowcase } from "@/components/site/showcase/BoardShowcase";
import { TablesShowcase } from "@/components/site/showcase/TablesShowcase";

const TABS = [
  { key: "board", label: "Whiteboard", nav: "home" as const, path: "/app/board/strategy", Comp: BoardShowcase },
  { key: "tables", label: "Tables", nav: "home" as const, path: "/app/tables/content-calendar", Comp: TablesShowcase },
  { key: "tasks", label: "Tasks", nav: "tasks" as const, path: "/app/project/board", Comp: TasksShowcase },
  { key: "docs", label: "Docs", nav: "home" as const, path: "/app/doc/roadmap", Comp: DocShowcase },
  { key: "calendar", label: "Calendar", nav: "calendar" as const, path: "/app/calendar", Comp: CalendarShowcase },
] as const;

export function WorkspaceShowcase() {
  const [active, setActive] = useState(0);
  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const measure = useCallback(() => {
    const bar = tabBarRef.current;
    const tab = tabRefs.current[active];
    if (!bar || !tab) return;
    const b = bar.getBoundingClientRect();
    const t = tab.getBoundingClientRect();
    setIndicator({ left: t.left - b.left, width: t.width });
  }, [active]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // NO AUTO-ROTATION. This used to advance every 8 seconds, which DESIGN.md bans
  // as an infinite decorative loop and the reader experiences as the page
  // changing surface while they are still reading one. A visitor who wants to see
  // the tables view clicks "Tables"; one who does not should not have it pushed
  // at them. Removing it also deletes the pause-on-interaction timer that only
  // existed to work around the rotation.
  const select = (i: number) => setActive(i);

  return (
    <div className="relative">
      <div
        ref={tabBarRef}
        className="relative mb-5 flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted/50 p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <span
          className="tab-indicator absolute bottom-0.5 top-0.5 rounded-md bg-background shadow-sm transition-all duration-300 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
          aria-hidden
        />
        {TABS.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            onClick={() => select(i)}
            aria-pressed={active === i}
            className={`relative z-10 min-h-[44px] flex-shrink-0 rounded-md px-4 py-2.5 text-sm font-medium transition-colors duration-200 sm:px-3.5 sm:py-2 ${
              active === i ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="workspace-beam pointer-events-none absolute inset-x-0 top-1/2 -z-10 hidden h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent lg:block" aria-hidden />

      <div className="relative min-h-[min(420px,72vh)] sm:min-h-[420px]">
        {(() => {
          const t = TABS[active];
          const Comp = t.Comp;
          return (
            <div key={t.key} className="relative z-10">
              <ShowcaseShell activeNav={t.nav} path={t.path} heightClass="h-[min(420px,72vh)] sm:h-[420px]">
                <Comp embedded />
              </ShowcaseShell>
            </div>
          );
        })()}
      </div>
    </div>
  );
}