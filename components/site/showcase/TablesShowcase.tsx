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

// Chart-view data: "posts by status", a real aggregation of the rows above
// (count grouped by status), so the chart reads as data, not decoration.
// Each bar carries the same status hue as its grid pill, so the chart ties
// visually back to the table the viewer just saw.
const STATUS_COUNTS: { label: string; count: number; color: string }[] = [
  { label: "Published", count: 1, color: "#10b981" }, // emerald-500
  { label: "Drafting", count: 2, color: "#f59e0b" }, // amber-500
  { label: "Idea", count: 1, color: "#94a3b8" }, // slate-400
];
const CHART_MAX = 2; // integer ticks at 0..CHART_MAX
const CHART_SCALE = 2.4; // positioning scale with headroom so the tallest bar + its value label never touch the top edge

const VIEWS = ["Grid", "Board", "Calendar", "Chart"] as const;

// SVG geometry mirrors the product's real AgentChart renderer (fixed viewBox,
// padded plot, y gridlines + ticks, rounded bars) so the marketing preview
// looks exactly like the chart a user gets in-app.
const CH = {
  vbW: 560,
  vbH: 200,
  padT: 16,
  padR: 18,
  padB: 30,
  padL: 30,
};
const PLOT_W = CH.vbW - CH.padL - CH.padR;
const PLOT_H = CH.vbH - CH.padT - CH.padB;

// roundedTopBarPath builds a bar with rounded TOP corners and a flat base —
// the polished look real chart libraries use, rather than uniformly rounded
// rects. r is clamped to the bar's height and half-width so short/thin bars
// stay well-formed.
function roundedTopBarPath(x: number, y: number, w: number, h: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, h, w / 2));
  return [
    `M${x},${y + h}`,
    `L${x},${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    `L${x + w - r},${y}`,
    `Q${x + w},${y} ${x + w},${y + r}`,
    `L${x + w},${y + h}`,
    "Z",
  ].join(" ");
}

type Phase = "idle" | "working" | "done" | "chart";

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
      ["idle", 900],
      ["working", 1500],
      ["done", 2800],
      ["chart", 3800],
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
  const isChart = phase === "chart";

  // Drive the bar grow-in: bars start at scaleY(0) and animate up once the
  // chart view is shown, staggered per bar (like the app's charts feel alive).
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (!isChart) {
      setGrown(false);
      return;
    }
    if (reduce.current) {
      setGrown(true);
      return;
    }
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, [isChart]);

  return (
    <div className={`relative flex flex-col ${embedded ? "h-full min-h-0" : "h-[420px]"}`}>
      <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">📅 Content calendar</p>
          <p className="text-[11px] text-muted-foreground">Table · {isChart ? "Chart view" : "Grid view · 5 fields"}</p>
        </div>
        <div className="hidden items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-[10px] text-muted-foreground sm:flex">
          {VIEWS.map((v) => {
            const active = isChart ? v === "Chart" : v === "Grid";
            return (
              <span
                key={v}
                className={active ? "rounded bg-background px-1.5 py-0.5 font-medium text-foreground transition-colors" : "px-1 transition-colors"}
              >
                {v}
              </span>
            );
          })}
        </div>
      </header>

      {isChart ? (
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 sm:p-4">
          <figure className="mx-auto w-full max-w-lg rounded-lg border border-border/60 bg-foreground/[0.03] p-3 sm:p-4">
            <figcaption className="mb-1.5 text-[12px] font-semibold text-foreground">Posts by status</figcaption>
            <svg
              viewBox={`0 0 ${CH.vbW} ${CH.vbH}`}
              className="h-auto w-full"
              role="img"
              aria-label="Bar chart: posts by status"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Y gridlines + tick labels (0..max). t=0 is the crisp baseline
                  axis; upper lines are subtle + dashed so bars read clearly. */}
              {Array.from({ length: CHART_MAX + 1 }, (_, t) => {
                const y = CH.padT + PLOT_H - (t / CHART_SCALE) * PLOT_H;
                const isBaseline = t === 0;
                return (
                  <g key={`yt-${t}`}>
                    <line
                      x1={CH.padL}
                      y1={y}
                      x2={CH.padL + PLOT_W}
                      y2={y}
                      stroke="rgb(var(--border))"
                      strokeWidth={isBaseline ? 1.5 : 1}
                      strokeDasharray={isBaseline ? undefined : "2 4"}
                      opacity={isBaseline ? 0.9 : 0.5}
                    />
                    <text
                      x={CH.padL - 8}
                      y={y}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={12}
                      fill="rgb(var(--muted-foreground))"
                    >
                      {t}
                    </text>
                  </g>
                );
              })}

              {/* Bars + value + category labels */}
              {STATUS_COUNTS.map((s, i) => {
                const slotW = PLOT_W / STATUS_COUNTS.length;
                const barW = Math.min(slotW * 0.34, 64);
                const cx = CH.padL + slotW * (i + 0.5);
                const baselineY = CH.padT + PLOT_H;
                const topY = CH.padT + PLOT_H - (s.count / CHART_SCALE) * PLOT_H;
                const h = baselineY - topY;
                return (
                  <g key={s.label}>
                    <path
                      d={roundedTopBarPath(cx - barW / 2, topY, barW, h, 4)}
                      fill={s.color}
                      style={{
                        transformBox: "fill-box",
                        transformOrigin: "bottom",
                        transform: grown ? "scaleY(1)" : "scaleY(0)",
                        transition: "transform 720ms cubic-bezier(0.22, 1, 0.36, 1)",
                        transitionDelay: `${i * 130}ms`,
                      }}
                    />
                    <text
                      x={cx}
                      y={topY - 7}
                      textAnchor="middle"
                      fontSize={14}
                      fontWeight={600}
                      fill="rgb(var(--foreground))"
                      className="transition-opacity duration-300"
                      style={{ opacity: grown ? 1 : 0, transitionDelay: `${i * 130 + 400}ms` }}
                    >
                      {s.count}
                    </text>
                    <text
                      x={cx}
                      y={baselineY + 17}
                      textAnchor="middle"
                      fontSize={13}
                      fill="rgb(var(--muted-foreground))"
                    >
                      {s.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </figure>
        </div>
      ) : (
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
      )}

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
                : phase === "chart"
                ? "AI · “chart posts by status”, answered straight from your data"
                : "Typed columns and starter rows created · edit anything"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
