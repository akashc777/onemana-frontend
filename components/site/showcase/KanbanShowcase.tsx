"use client";

import { useEffect, useRef, useState } from "react";

/**
 * KanbanShowcase mirrors OneCamp's project board (statuses: backlog, todo,
 * inProgress, inReview, done). A highlighted task animates across the columns
 * over time to convey work progressing, with priority/label chips and
 * assignee avatars like the real app. Reduced-motion aware.
 */

type Priority = "high" | "medium" | "low";

interface Card {
  id: string;
  title: string;
  priority?: Priority;
  label?: { text: string; color: string };
  who: string;
  whoColor: string;
}

const COLUMNS: { key: string; title: string; dot: string }[] = [
  { key: "todo", title: "To Do", dot: "bg-slate-400" },
  { key: "inProgress", title: "In Progress", dot: "bg-amber-400" },
  { key: "inReview", title: "In Review", dot: "bg-sky-400" },
  { key: "done", title: "Done", dot: "bg-emerald-400" },
];

// Static cards per column index (the traveling card is layered on top).
const STATIC: Card[][] = [
  [{ id: "OC-141", title: "Write API docs", priority: "medium", label: { text: "docs", color: "#38bdf8" }, who: "DC", whoColor: "from-sky-400 to-cyan-500" }],
  [{ id: "OC-139", title: "Fix avatar upload", priority: "high", label: { text: "bug", color: "#f43f5e" }, who: "AK", whoColor: "from-violet-400 to-brand" }],
  [{ id: "OC-137", title: "Add SSO support", priority: "medium", label: { text: "feature", color: "#a78bfa" }, who: "PN", whoColor: "from-rose-400 to-pink-500" }],
  [{ id: "OC-130", title: "Ship v2.4 to prod", label: { text: "release", color: "#34d399" }, who: "DC", whoColor: "from-sky-400 to-cyan-500" }],
];

const TRAVELER: Card = {
  id: "OC-142",
  title: "Polish onboarding flow",
  priority: "high",
  label: { text: "ux", color: "#f472b6" },
  who: "PN",
  whoColor: "from-rose-400 to-pink-500",
};

const PRIORITY: Record<Priority, { label: string; cls: string }> = {
  high: { label: "High", cls: "bg-rose-500/15 text-rose-300" },
  medium: { label: "Med", cls: "bg-amber-500/15 text-amber-300" },
  low: { label: "Low", cls: "bg-slate-500/20 text-slate-300" },
};

function TaskCard({ card, highlight = false }: { card: Card; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border bg-canvas-raised/80 p-2.5 transition-all ${
        highlight ? "animate-fade-up border-brand/50 shadow-[0_0_0_1px_rgba(109,94,252,0.4)]" : "border-white/10"
      }`}
    >
      <div className="flex items-center gap-1.5">
        {card.label && (
          <span className="rounded px-1.5 py-0.5 text-[9px] font-medium" style={{ backgroundColor: `${card.label.color}22`, color: card.label.color }}>
            {card.label.text}
          </span>
        )}
        {card.priority && (
          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY[card.priority].cls}`}>{PRIORITY[card.priority].label}</span>
        )}
      </div>
      <p className="mt-1.5 text-xs font-medium leading-snug text-white">{card.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[9px] text-slate-500">{card.id}</span>
        <span className={`grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br ${card.whoColor} text-[8px] font-bold text-white`}>{card.who}</span>
      </div>
    </div>
  );
}

export function KanbanShowcase() {
  const [col, setCol] = useState(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setCol(COLUMNS.length - 1);
      return;
    }
    const id = setInterval(() => setCol((c) => (c + 1) % COLUMNS.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-[420px] flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Sprint 14 · Mobile App</p>
          <p className="text-xs text-slate-500">Board · 6 tasks</p>
        </div>
        <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">+ New task</span>
      </header>

      <div className="flex flex-1 gap-3 overflow-x-auto p-4">
        {COLUMNS.map((c, i) => {
          const cards = STATIC[i] ?? [];
          const count = cards.length + (col === i ? 1 : 0);
          return (
            <div key={c.key} className="flex w-40 flex-shrink-0 flex-col">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                <span className="text-xs font-semibold text-slate-300">{c.title}</span>
                <span className="ml-auto text-[10px] text-slate-500">{count}</span>
              </div>
              <div className="flex flex-col gap-2">
                {col === i && <TaskCard card={TRAVELER} highlight key={`trav-${col}`} />}
                {cards.map((card) => (
                  <TaskCard key={card.id} card={card} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
