"use client";

import { useEffect, useRef, useState } from "react";
import { IconSparkles } from "@/components/site/showcase/ShowcaseIcons";

// A content-calendar table the AI assembles from one sentence. Columns are
// typed (status pills, a date, an owner avatar) so it reads like a real
// Notion/Airtable database, not a spreadsheet screenshot.
interface Row {
  title: string;
  status: "Idea" | "Drafting" | "Published";
  channel: string;
  date: string;
  owner: string;
}

const ROWS: Row[] = [
  { title: "Launch announcement", status: "Published", channel: "Blog", date: "Jun 24", owner: "AK" },
  { title: "Tables deep-dive", status: "Drafting", channel: "Blog", date: "Jun 25", owner: "DC" },
  { title: "API + SDK walkthrough", status: "Drafting", channel: "YouTube", date: "Jun 27", owner: "PN" },
  { title: "Cost-control explainer", status: "Idea", channel: "Newsletter", date: "Jul 01", owner: "AK" },
];

const STATUS_STYLE: Record<Row["status"], string> = {
  Idea: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  Drafting: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  Published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

type Phase = "idle" | "working" | "done";

/** Tables preview: the AI generates a typed table from a natural-language prompt. */
export function TablesShowcase({ embedded = false }: { embedded?: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setPhase("done");
      return;
    }
    const seq: [Phase, number][] = [
      ["idle", 1100],
      ["working", 1600],
      ["done", 4600],
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

  const showRows = phase === "working" || phase === "done";

  return (
    <div className={`relative flex flex-col ${embedded ? "h-full min-h-0" : "h-[420px]"}`}>
      <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">📅 Content calendar</p>
          <p className="text-[11px] text-muted-foreground">Table · Grid view · 5 fields</p>
        </div>
        <div className="hidden items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-[10px] text-muted-foreground sm:flex">
          <span className="rounded bg-background px-1.5 py-0.5 font-medium text-foreground">Grid</span>
          <span className="px-1">Board</span>
          <span className="px-1">Calendar</span>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-2 sm:p-3">
        <div className="overflow-hidden rounded-lg border border-border/60">
          {/* Column header */}
          <div className="grid grid-cols-[1.6fr_0.9fr_0.9fr_0.7fr_0.5fr] bg-muted/50 text-[10px] font-medium text-muted-foreground">
            {["Title", "Status", "Channel", "Publish", "Owner"].map((c) => (
              <div key={c} className="border-b border-border/60 px-2.5 py-2">
                {c}
              </div>
            ))}
          </div>
          {/* Rows */}
          {ROWS.map((r, idx) => (
            <div
              key={r.title}
              className={`grid grid-cols-[1.6fr_0.9fr_0.9fr_0.7fr_0.5fr] items-center border-b border-border/40 text-[11px] transition-all duration-300 ${
                showRows ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              }`}
              style={{ transitionDelay: showRows && !reduce.current ? `${idx * 120}ms` : "0ms" }}
            >
              <div className="truncate px-2.5 py-2 font-medium text-foreground">{r.title}</div>
              <div className="px-2.5 py-2">
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${STATUS_STYLE[r.status]}`}>{r.status}</span>
              </div>
              <div className="truncate px-2.5 py-2 text-muted-foreground">{r.channel}</div>
              <div className="truncate px-2.5 py-2 text-muted-foreground">{r.date}</div>
              <div className="px-2.5 py-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-500/15 text-[8px] font-semibold text-indigo-700 dark:text-indigo-300">
                  {r.owner}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI toast: the table was generated from a prompt. */}
      {!reduce.current && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 px-2">
          <div
            className={`flex items-center gap-2 rounded-full border bg-card/95 px-3 py-1.5 shadow-lg backdrop-blur transition-all duration-300 ${
              phase === "idle" ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
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
                ? "AI · building a table from “a content calendar with status, channel, owner”"
                : "Typed columns and starter rows created · edit anything"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
