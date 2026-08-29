"use client";

import { useEffect, useRef, useState } from "react";
import { IconSparkles } from "@/components/site/showcase/ShowcaseIcons";

/**
 * CalendarShowcase mirrors OneCamp's calendar, with the AI agent doing the
 * work: asked to "find a slot and book the customer call", it locates a free
 * gap and drops the event onto the grid with an AI badge, after the user's OK.
 * Live "now" line + a meeting happening right now keep it feeling real.
 * Reduced-motion aware.
 */

const HOURS = [9, 10, 11, 12, 13, 14];
const START = 9;
const SPAN = HOURS.length;

const DAYS = [
  { label: "Mon", date: 13, today: false },
  { label: "Tue", date: 14, today: true },
  { label: "Wed", date: 15, today: false },
  { label: "Thu", date: 16, today: false },
  { label: "Fri", date: 17, today: false },
];

interface Ev {
  day: number;
  start: number;
  end: number;
  title: string;
  color: string;
  live?: boolean;
  byAI?: boolean;
}

const EVENTS: Ev[] = [
  { day: 0, start: 9.5, end: 10.5, title: "Design sync", color: "#a78bfa" },
  { day: 1, start: 9, end: 9.75, title: "Daily standup", color: "#34d399", live: true },
  { day: 1, start: 11, end: 12, title: "1:1 · Priya", color: "#38bdf8" },
  { day: 2, start: 10, end: 11.25, title: "Sprint review", color: "#f472b6" },
  { day: 3, start: 9.5, end: 10.5, title: "Roadmap", color: "#fbbf24" },
  { day: 4, start: 13, end: 14, title: "Demo day", color: "#6d5efc" },
];

// The event the agent books into a free slot.
const NEW_EVENT: Ev = { day: 2, start: 12.25, end: 13, title: "Customer call · Acme", color: "#34e3e3", byAI: true };

const NOW = 9.3;

function pct(hour: number) {
  return ((hour - START) / SPAN) * 100;
}

function fmt(h: number) {
  const hr = Math.floor(h);
  const m = Math.round((h - hr) * 60);
  const ampm = hr >= 12 ? "pm" : "am";
  const h12 = hr > 12 ? hr - 12 : hr;
  return m ? `${h12}:${String(m).padStart(2, "0")}${ampm}` : `${h12}${ampm}`;
}

function EventBlock({ ev, fresh }: { ev: Ev; fresh?: boolean }) {
  return (
    <div
      className={`absolute inset-x-1 overflow-hidden rounded-md border-l-2 px-1.5 py-1 ${fresh ? "animate-fade-up" : ""} ${
        ev.byAI ? "ring-1 ring-violet-500/40" : ""
      }`}
      style={{
        top: `${pct(ev.start)}%`,
        height: `${pct(ev.end) - pct(ev.start)}%`,
        borderColor: ev.color,
        backgroundColor: `${ev.color}22`,
      }}
    >
      <p className="flex items-center gap-1 truncate text-[10px] font-semibold leading-tight text-foreground">
        {ev.byAI && <IconSparkles className="h-2.5 w-2.5 flex-shrink-0 text-violet-600 dark:text-violet-400" />}
        <span className="truncate">{ev.title}</span>
      </p>
      {ev.live ? (
        <span className="mt-0.5 inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live now
        </span>
      ) : (
        <p className="truncate text-[8px] text-muted-foreground">
          {fmt(ev.start)} - {fmt(ev.end)}
        </p>
      )}
    </div>
  );
}

type Phase = "idle" | "working" | "done";

export function CalendarShowcase({ embedded = false }: { embedded?: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setPhase("done");
      return;
    }
    const seq: [Phase, number][] = [
      ["idle", 1300],
      ["working", 1500],
      ["done", 3800],
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

  const showNew = phase === "working" || phase === "done";

  return (
    <div className={`relative flex flex-col ${embedded ? "h-full min-h-0" : "h-[420px]"}`}>
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">October 2025</p>
          <p className="text-xs text-muted-foreground">Week 42 · Team calendar</p>
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5 text-xs">
          <span className="rounded-md px-2 py-1 text-muted-foreground">Day</span>
          <span className="rounded-md bg-background px-2 py-1 font-medium text-foreground shadow-sm">Week</span>
          <span className="rounded-md px-2 py-1 text-muted-foreground">Month</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-12 flex-shrink-0 flex-col pt-8">
          <div className="relative flex-1">
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="absolute right-1.5 -translate-y-1/2 text-[9px] text-muted-foreground"
                style={{ top: `${(i / SPAN) * 100}%` }}
              >
                {fmt(h)}
              </div>
            ))}
          </div>
        </div>

        <div className="grid flex-1 grid-cols-5">
          {DAYS.map((d, di) => (
            <div key={d.label} className="flex flex-col border-l border-border">
              <div className="flex h-8 items-center justify-center gap-1.5 border-b border-border">
                <span className="text-[10px] font-medium uppercase text-muted-foreground">{d.label}</span>
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-semibold ${
                    d.today ? "bg-foreground text-background" : "text-muted-foreground"
                  }`}
                >
                  {d.date}
                </span>
              </div>

              <div className="relative flex-1">
                {HOURS.map((h, i) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-border/60"
                    style={{ top: `${(i / SPAN) * 100}%` }}
                  />
                ))}

                {EVENTS.filter((e) => e.day === di).map((e) => (
                  <EventBlock key={e.title} ev={e} />
                ))}

                {di === NEW_EVENT.day && showNew && <EventBlock ev={NEW_EVENT} fresh />}

                {d.today && (
                  <div className="absolute inset-x-0 z-20" style={{ top: `${pct(NOW)}%` }}>
                    <div className="relative h-px bg-rose-400">
                      <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-rose-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent toast */}
      {!reduce.current && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2 px-2">
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
              {phase === "working" ? "AI agent · finding a free 30-min slot" : "Customer call booked · invite sent"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
