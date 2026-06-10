"use client";

import { useEffect, useRef, useState } from "react";
import { KanbanShowcase } from "@/components/site/showcase/KanbanShowcase";
import { DocShowcase } from "@/components/site/showcase/DocShowcase";

const TABS = [
  { key: "tasks", label: "Tasks & Kanban", path: "tasks", Comp: KanbanShowcase },
  { key: "docs", label: "Collaborative Docs", path: "doc/roadmap", Comp: DocShowcase },
] as const;

/**
 * WorkspaceShowcase frames the animated product scenes in a browser window and
 * lets visitors switch tabs (Tasks / Docs). It auto-advances, pausing for a
 * while after a manual selection. Reduced-motion: no auto-advance.
 */
export function WorkspaceShowcase() {
  const [active, setActive] = useState(0);
  const pausedUntil = useRef(0);

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

  const Active = TABS[active].Comp;

  return (
    <div>
      {/* tab pills */}
      <div className="mx-auto mb-6 flex w-fit flex-wrap justify-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => select(i)}
            aria-pressed={active === i}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              active === i ? "bg-brand text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* browser window frame */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-canvas-raised shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <div className="mx-auto flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            onecamp.acme.com/{TABS[active].path}
          </div>
        </div>
        <Active />
      </div>
    </div>
  );
}
