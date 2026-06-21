"use client";

import { useEffect, useRef, useState } from "react";
import { categoryColors } from "@/lib/onecamp-colors";
import { IconSparkles } from "@/components/site/showcase/ShowcaseIcons";

const COLUMNS = [
  { id: "todo", label: "Todo", color: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
  { id: "inProgress", label: "In Progress", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { id: "done", label: "Done", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
] as const;

interface Card {
  title: string;
  tag?: string;
  assignee?: string;
  byAI?: boolean;
}

const BASE_TASKS: Record<string, Card[]> = {
  todo: [{ title: "Checkout v2 QA", tag: "Sprint 14", assignee: "PN" }],
  inProgress: [{ title: "Rollback drill", tag: "Ops", assignee: "DC" }],
  done: [
    { title: "Latency benchmarks", tag: "Perf", assignee: "DC" },
    { title: "SSL auto-renew check", tag: "Ops", assignee: "PN" },
  ],
};

/** Tasks the agent creates from the #engineering thread, after the user's OK. */
const AI_TASKS: Card[] = [
  { title: "Review checkout deploy", tag: "Engineering", assignee: "DC", byAI: true },
  { title: "Post APAC recap", tag: "Docs", assignee: "AK", byAI: true },
];

type Phase = "idle" | "working" | "done";

/** Kanban preview where the AI agent turns a discussion into assigned tasks. */
export function TasksShowcase({ embedded = false }: { embedded?: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setPhase("done");
      return;
    }
    const seq: [Phase, number][] = [
      ["idle", 1200],
      ["working", 1500],
      ["done", 4200],
    ];
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const run = () => {
      const [p, ms] = seq[i];
      setPhase(p);
      timer = setTimeout(() => {
        i = (i + 1) % seq.length;
        run();
      }, ms);
    };
    run();
    return () => clearTimeout(timer);
  }, []);

  const taskColors = categoryColors.task;
  const showAI = phase === "working" || phase === "done";

  const tasksFor = (colId: string): Card[] => {
    if (colId === "todo" && showAI) return [...AI_TASKS, ...BASE_TASKS.todo];
    return BASE_TASKS[colId];
  };

  return (
    <div className={`relative flex flex-col ${embedded ? "h-full min-h-0" : "h-[420px]"}`}>
      <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">Product · Sprint board</p>
          <p className="text-[11px] text-muted-foreground">Project admin · 3 assignees</p>
        </div>
        <span className={`hidden rounded-md px-2 py-1 text-[10px] font-medium sm:inline ${taskColors.bg} ${taskColors.text}`}>
          My Tasks
        </span>
      </header>

      <div className="flex min-h-0 flex-1 gap-2 overflow-x-auto p-2 sm:gap-3 sm:p-3">
        {COLUMNS.map((col) => {
          const cards = tasksFor(col.id);
          return (
            <div
              key={col.id}
              className="flex w-[9.5rem] flex-shrink-0 flex-col rounded-lg border border-border/60 bg-card/80 sm:w-[10.5rem]"
            >
              <div className="flex items-center justify-between border-b border-border/50 px-2.5 py-2">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${col.color}`}>{col.label}</span>
                <span className="text-[10px] text-muted-foreground">{cards.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2">
                {cards.map((task) => (
                  <div
                    key={task.title}
                    className={`rounded-md border bg-background p-2 shadow-sm transition-shadow hover:shadow-md ${
                      task.byAI
                        ? "border-violet-500/40 ring-1 ring-violet-500/20 animate-fade-up"
                        : "border-border/70"
                    }`}
                  >
                    {task.byAI && (
                      <span className="mb-1 inline-flex items-center gap-1 rounded bg-violet-500/10 px-1 py-0.5 text-[8px] font-semibold text-violet-700 dark:text-violet-300">
                        <IconSparkles className="h-2.5 w-2.5" /> AI
                      </span>
                    )}
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
          );
        })}
      </div>

      {/* Agent toast: shows the agent doing the work, never silently. */}
      {!reduce.current && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 px-2">
          <div
            className={`flex items-center gap-2 rounded-full border bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur transition-all duration-300 ${
              phase === "idle"
                ? "translate-y-2 opacity-0"
                : "translate-y-0 opacity-100"
            } ${phase === "done" ? "border-emerald-500/40" : "border-violet-500/40"}`}
          >
            <span
              className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full ${
                phase === "done" ? "bg-emerald-500 text-white" : "bg-violet-500/15 text-violet-600 dark:text-violet-400"
              }`}
            >
              {phase === "done" ? <span className="text-[10px] font-bold">✓</span> : <IconSparkles className="h-3 w-3" />}
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium text-foreground sm:text-[11px]">
              {phase === "working"
                ? "AI agent · turning #engineering follow-ups into tasks"
                : "2 tasks created and assigned · you approved"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
