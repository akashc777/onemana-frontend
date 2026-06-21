"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ShowcaseShell } from "@/components/site/showcase/ShowcaseShell";
import { CalendarShowcase } from "@/components/site/showcase/CalendarShowcase";
import { DocShowcase } from "@/components/site/showcase/DocShowcase";
import { TasksShowcase } from "@/components/site/showcase/TasksShowcase";
import { AgentShowcase } from "@/components/site/showcase/AgentShowcase";

const TABS = [
  { key: "agent", label: "AI Agent", nav: "home" as const, path: "/app/home", Comp: AgentShowcase },
  { key: "calendar", label: "Calendar", nav: "calendar" as const, path: "/app/calendar", Comp: CalendarShowcase },
  { key: "docs", label: "Docs", nav: "home" as const, path: "/app/doc/roadmap", Comp: DocShowcase },
  { key: "tasks", label: "Tasks", nav: "tasks" as const, path: "/app/project/board", Comp: TasksShowcase },
] as const;

export function WorkspaceShowcase() {
  const [active, setActive] = useState(0);
  const pausedUntil = useRef(0);
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

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setActive((a) => (a + 1) % TABS.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const select = (i: number) => {
    setActive(i);
    pausedUntil.current = Date.now() + 15000;
  };

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
        {TABS.map((t, i) => (
          <div
            key={t.key}
            className={`transition-all duration-500 ease-out ${
              active === i
                ? "relative z-10 translate-y-0 opacity-100"
                : "pointer-events-none absolute inset-0 z-0 translate-y-2 opacity-0"
            }`}
            aria-hidden={active !== i}
          >
            <ShowcaseShell activeNav={t.nav} path={t.path} heightClass="h-[min(420px,72vh)] sm:h-[420px]">
              <t.Comp embedded />
            </ShowcaseShell>
          </div>
        ))}
      </div>
    </div>
  );
}