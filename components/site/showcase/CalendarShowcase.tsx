"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CalendarShowcase mirrors OneCamp's calendar: a clean week view with colored
 * events, a live "now" line, a meeting that is happening right now (pulsing),
 * and a fresh invite that drops onto the grid in real time. Instantly readable,
 * GPU-cheap, reduced-motion aware (no auto-scheduling, everything resting).
 */

const HOURS = [9, 10, 11, 12, 13, 14]; // 9am - 2pm window
const START = 9;
const SPAN = HOURS.length; // hours shown

const DAYS = [
  { label: "Mon", date: 13, today: false },
  { label: "Tue", date: 14, today: true },
  { label: "Wed", date: 15, today: false },
  { label: "Thu", date: 16, today: false },
  { label: "Fri", date: 17, today: false },
];

interface Ev {
  day: number; // index into DAYS
  start: number; // hour (decimal)
  end: number;
  title: string;
  color: string; // hex
  live?: boolean;
}

const EVENTS: Ev[] = [
  { day: 0, start: 9.5, end: 10.5, title: "Design sync", color: "#a78bfa" },
  { day: 1, start: 9, end: 9.75, title: "Daily standup", color: "#34d399", live: true },
  { day: 1, start: 11, end: 12, title: "1:1 · Priya", color: "#38bdf8" },
  { day: 2, start: 10, end: 11.25, title: "Sprint review", color: "#f472b6" },
  { day: 3, start: 9.5, end: 10.5, title: "Roadmap", color: "#fbbf24" },
  { day: 4, start: 13, end: 14, title: "Demo day", color: "#6d5efc" },
];

// The invite that drops in live.
const NEW_EVENT: Ev = { day: 2, start: 12.25, end: 13, title: "Customer call", color: "#34e3e3" };

const NOW = 9.3; // current time -> inside Tuesday standup

function pct(hour: number) {
  return ((hour - START) / SPAN) * 100;
}

function EventBlock({ ev, fresh }: { ev: Ev; fresh?: boolean }) {
  return (
    <div
      className={`absolute inset-x-1 overflow-hidden rounded-md border-l-2 px-1.5 py-1 ${fresh ? "animate-fade-up" : ""}`}
      style={{
        top: `${pct(ev.start)}%`,
        height: `${pct(ev.end) - pct(ev.start)}%`,
        borderColor: ev.color,
        backgroundColor: `${ev.color}22`,
      }}
    >
      <p className="truncate text-[10px] font-semibold leading-tight text-foreground">{ev.title}</p>
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

function fmt(h: number) {
  const hr = Math.floor(h);
  const m = Math.round((h - hr) * 60);
  const ampm = hr >= 12 ? "pm" : "am";
  const h12 = hr > 12 ? hr - 12 : hr;
  return m ? `${h12}:${String(m).padStart(2, "0")}${ampm}` : `${h12}${ampm}`;
}

export function CalendarShowcase({ embedded = false }: { embedded?: boolean }) {
  const [showNew, setShowNew] = useState(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setShowNew(true);
      return;
    }
    const hideT = { current: undefined as ReturnType<typeof setTimeout> | undefined };
    const cycle = setInterval(() => {
      setShowNew(true);
      if (hideT.current) clearTimeout(hideT.current);
      hideT.current = setTimeout(() => setShowNew(false), 4200);
    }, 6500);
    return () => {
      clearInterval(cycle);
      if (hideT.current) clearTimeout(hideT.current);
    };
  }, []);

  return (
    <div className={`flex flex-col ${embedded ? "h-full min-h-0" : "h-[420px]"}`}>
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
        {/* time gutter */}
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

        {/* day columns */}
        <div className="grid flex-1 grid-cols-5">
          {DAYS.map((d, di) => (
            <div key={d.label} className="flex flex-col border-l border-border">
              {/* day header */}
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

              {/* events area */}
              <div className="relative flex-1">
                {/* hour gridlines */}
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

                {/* now line (today only) */}
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
    </div>
  );
}
