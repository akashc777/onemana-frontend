"use client";

import { useEffect, useRef, useState } from "react";
import { categoryColors } from "@/lib/onecamp-colors";

const COLUMNS = [
  { id: "todo", label: "Todo", color: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
  { id: "inProgress", label: "In Progress", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { id: "done", label: "Done", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
] as const;

const TASKS: Record<string, { title: string; tag?: string; assignee?: string }[]> = {
  todo: [
    { title: "APAC launch recap doc", tag: "Docs", assignee: "AK" },
    { title: "Review checkout deploy", tag: "Engineering", assignee: "DC" },
  ],
  inProgress: [
    { title: "Checkout v2 QA", tag: "Sprint 14", assignee: "PN" },
  ],
  done: [
    { title: "Latency benchmarks", tag: "Perf", assignee: "DC" },
    { title: "SSL auto-renew check", tag: "Ops", assignee: "PN" },
  ],
};

/** Kanban preview aligned with OneCamp FE project boards. */
export function TasksShowcase({ embedded = false }: { embedded?: boolean }) {
  const [activeCol, setActiveCol] = useState(1);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) return;
    const id = setInterval(() => setActiveCol((c) => (c + 1) % COLUMNS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const taskColors = categoryColors.task;

  return (
    <div className={`flex flex-col ${embedded ? "h-full min-h-0" : "h-[420px]"}`}>
      <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">Product · Sprint board</p>
          <p className="text-[11px] text-muted-foreground">5 tasks · 3 assignees</p>
        </div>
        <span className={`hidden rounded-md px-2 py-1 text-[10px] font-medium sm:inline ${taskColors.bg} ${taskColors.text}`}>
          My Tasks
        </span>
      </header>

      <div className="flex min-h-0 flex-1 gap-2 overflow-x-auto p-2 sm:gap-3 sm:p-3">
        {COLUMNS.map((col, ci) => (
          <div
            key={col.id}
            className={`flex w-[9.5rem] flex-shrink-0 flex-col rounded-lg border border-border/60 bg-card/80 sm:w-[10.5rem] ${
              !reduce.current && ci === activeCol ? "ring-1 ring-brand/20" : ""
            }`}
          >
            <div className="flex items-center justify-between border-b border-border/50 px-2.5 py-2">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${col.color}`}>{col.label}</span>
              <span className="text-[10px] text-muted-foreground">{TASKS[col.id].length}</span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-2">
              {TASKS[col.id].map((task) => (
                <div
                  key={task.title}
                  className="rounded-md border border-border/70 bg-background p-2 shadow-sm transition-shadow hover:shadow-md"
                >
                  <p className="text-[11px] font-medium leading-snug text-foreground">{task.title}</p>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    {task.tag && (
                      <span className="truncate rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{task.tag}</span>
                    )}
                    {task.assignee && (
                      <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-indigo-500/15 text-[8px] font-semibold text-indigo-700 dark:text-indigo-300">
                        {task.assignee}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}