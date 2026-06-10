"use client";

import { useEffect, useRef, useState } from "react";

/**
 * KanbanShowcase mirrors OneCamp's project board (statuses: todo, inProgress,
 * inReview, done). A highlighted task is "picked up", flies smoothly across the
 * columns (GPU transform, lift + tilt + shadow), and drops into the next
 * column's slot — a polished drag-and-drop feel. Reduced-motion: card rests in
 * the final column with no animation.
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

function CardBody({ card }: { card: Card }) {
  return (
    <>
      <div className="flex items-center gap-1.5">
        {card.label && (
          <span className="rounded px-1.5 py-0.5 text-[9px] font-medium" style={{ backgroundColor: `${card.label.color}22`, color: card.label.color }}>
            {card.label.text}
          </span>
        )}
        {card.priority && <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY[card.priority].cls}`}>{PRIORITY[card.priority].label}</span>}
      </div>
      <p className="mt-1.5 text-xs font-medium leading-snug text-white">{card.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[9px] text-slate-500">{card.id}</span>
        <span className={`grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br ${card.whoColor} text-[8px] font-bold text-white`}>{card.who}</span>
      </div>
    </>
  );
}

function StaticCard({ card }: { card: Card }) {
  return (
    <div className="rounded-lg border border-white/10 bg-canvas-raised/80 p-2.5">
      <CardBody card={card} />
    </div>
  );
}

interface Coord {
  x: number;
  y: number;
  w: number;
}

export function KanbanShowcase() {
  const [target, setTarget] = useState(0);
  const [lifted, setLifted] = useState(false);
  const [coords, setCoords] = useState<Coord[]>([]);
  const reduce = useRef(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Measure each column's landing-slot position within the board's coordinate
  // space (offset-based, so it's stable under horizontal scroll).
  useEffect(() => {
    const measure = () => {
      const next = slotRefs.current.map((s) =>
        s ? { x: s.offsetLeft, y: s.offsetTop, w: s.offsetWidth } : { x: 0, y: 0, w: 0 },
      );
      setCoords(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (boardRef.current) ro.observe(boardRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Drive the lift → fly → drop loop.
  useEffect(() => {
    reduce.current = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setTarget(COLUMNS.length - 1);
      return;
    }
    let liftT: ReturnType<typeof setTimeout>;
    let dropT: ReturnType<typeof setTimeout>;
    const cycle = setInterval(() => {
      setLifted(true); // pick up
      liftT = setTimeout(() => setTarget((t) => (t + 1) % COLUMNS.length), 220);
      dropT = setTimeout(() => setLifted(false), 1050); // settle after the flight
    }, 2600);
    return () => {
      clearInterval(cycle);
      clearTimeout(liftT);
      clearTimeout(dropT);
    };
  }, []);

  const c = coords[target];
  const ready = coords.length === COLUMNS.length && c && c.w > 0;

  return (
    <div className="flex h-[420px] flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">Sprint 14 · Mobile App</p>
          <p className="text-xs text-slate-500">Board · 6 tasks</p>
        </div>
        <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">+ New task</span>
      </header>

      <div ref={boardRef} className="relative flex flex-1 gap-3 overflow-x-auto p-4">
        {COLUMNS.map((col, i) => {
          const cards = STATIC[i] ?? [];
          const isTarget = target === i;
          return (
            <div key={col.key} className="flex w-40 flex-shrink-0 flex-col">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className="text-xs font-semibold text-slate-300">{col.title}</span>
                <span className="ml-auto text-[10px] text-slate-500">{cards.length + (isTarget ? 1 : 0)}</span>
              </div>

              {/* landing slot — the traveling card lands here when this is the target */}
              <div
                ref={(el) => {
                  slotRefs.current[i] = el;
                }}
                className={`mb-2 h-[74px] rounded-lg border border-dashed transition-colors duration-300 ${
                  isTarget ? "border-brand/40 bg-brand/5" : "border-white/10 bg-white/[0.02]"
                }`}
              />

              <div className="flex flex-col gap-2">
                {cards.map((card) => (
                  <StaticCard key={card.id} card={card} />
                ))}
              </div>
            </div>
          );
        })}

        {/* the flying traveling card, positioned over the target column's slot */}
        {ready && (
          <div
            className="pointer-events-none absolute left-0 top-0 z-30 rounded-lg border border-brand/50 bg-canvas-raised p-2.5"
            style={{
              width: c.w,
              transform: `translate(${c.x}px, ${c.y}px) ${lifted ? "scale(1.05) rotate(-3deg)" : "scale(1) rotate(0deg)"}`,
              transition:
                "transform 0.85s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease",
              boxShadow: lifted
                ? "0 26px 55px -12px rgba(109,94,252,0.65)"
                : "0 8px 22px -10px rgba(0,0,0,0.6)",
              willChange: "transform",
            }}
          >
            <CardBody card={TRAVELER} />
          </div>
        )}
      </div>
    </div>
  );
}
