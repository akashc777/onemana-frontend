"use client";

import { useEffect, useRef, useState } from "react";
import { IconSparkles } from "@/components/site/showcase/ShowcaseIcons";

/**
 * BoardShowcase faithfully mirrors OneCamp's collaborative whiteboard (the
 * Excalidraw canvas): the floating tool palette, the dotted infinite canvas,
 * the "Ask AI" composer, and the AI diagram generator. A prompt is typed into
 * the composer, the AI generates a flowchart, and the real generated-shape
 * styling (the exact pastel fills the backend assigns: green ellipse for
 * start, blue rectangles for steps, yellow diamond for a decision, black
 * arrows) draws onto the canvas node by node. The composer then closes, exactly
 * as it does in the product after a generation is added. Reduced-motion aware;
 * loops.
 */

const PROMPT = "Onboarding flow for a new SaaS user";

// The pills the real composer shows (Auto is the default selection).
const PILLS = ["Auto", "Flowchart", "Roadmap", "Mind map", "Org chart"];

// Generated-shape palette — kept in sync with the backend (business/AI
// boardAgent.go bgForShape): ellipse=green start/end, diamond=yellow decision,
// rectangle=blue step. Stroke is Excalidraw's near-black.
const FILL = { rect: "#e7f5ff", diamond: "#fff9db", ellipse: "#ebfbee" };
const STROKE = "#1e1e1e";

type Phase = "idle" | "typing" | "thinking" | "building" | "done";

export function BoardShowcase({ embedded = false }: { embedded?: boolean }) {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [revealed, setRevealed] = useState(0); // generated shapes shown
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setTyped(PROMPT);
      setPhase("done");
      setRevealed(5);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    let typeTimer: ReturnType<typeof setInterval>;
    let buildTimer: ReturnType<typeof setInterval>;

    const start = () => {
      setTyped("");
      setRevealed(0);
      setPhase("typing");

      let i = 0;
      typeTimer = setInterval(() => {
        i += 1;
        setTyped(PROMPT.slice(0, i));
        if (i >= PROMPT.length) {
          clearInterval(typeTimer);
          timers.push(
            setTimeout(() => {
              setPhase("thinking");
              timers.push(
                setTimeout(() => {
                  setPhase("building");
                  let n = 0;
                  buildTimer = setInterval(() => {
                    n += 1;
                    setRevealed(n);
                    if (n >= 5) {
                      clearInterval(buildTimer);
                      setPhase("done"); // composer closes, just like the product
                      timers.push(setTimeout(start, 3600)); // hold, then loop
                    }
                  }, 420);
                }, 1100),
              );
            }, 450),
          );
        }
      }, 34);
    };
    start();

    return () => {
      clearInterval(typeTimer);
      clearInterval(buildTimer);
      timers.forEach(clearTimeout);
    };
  }, []);

  const composerOpen = phase !== "done";

  return (
    <div className={`flex flex-col ${embedded ? "h-full min-h-0" : "h-[420px]"}`}>
      {/* Board header (title · collaborators · AI status) */}
      <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-sm font-medium text-foreground">Onboarding board</span>
        <div className="flex items-center gap-2.5">
          <span
            className={`hidden items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition-colors sm:inline-flex ${
              phase === "done"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-violet-500/10 text-violet-700 dark:text-violet-300"
            }`}
          >
            {phase === "done" ? <>✓ Added to board</> : <><IconSparkles className="h-3 w-3" /> AI</>}
          </span>
          <div className="flex -space-x-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#38bdf8] text-[9px] font-bold text-white ring-2 ring-background">DC</span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#a78bfa] text-[9px] font-bold text-white ring-2 ring-background">AK</span>
          </div>
        </div>
      </header>

      {/* Infinite canvas */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          color: "rgb(148 163 184 / 0.18)",
        }}
      >
        {/* Floating Excalidraw-style tool palette */}
        <BoardToolbar />

        {/* The generated flowchart (real shape styling) */}
        <svg
          className="absolute inset-0 h-full w-full p-2"
          viewBox="0 0 320 300"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <marker id="bsArrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={STROKE} />
            </marker>
          </defs>

          {/* Edges (each appears with its target node) */}
          <Edge d="M160,52 L160,66" show={revealed > 1} />
          <Edge d="M160,104 L160,120" show={revealed > 2} />
          <Edge d="M132,170 L96,210" show={revealed > 3} label="Yes" lx={104} ly={192} />
          <Edge d="M188,170 L224,210" show={revealed > 4} label="No" lx={214} ly={192} />

          {/* Start (ellipse) */}
          <Shape show={revealed > 0}>
            <ellipse cx={160} cy={32} rx={56} ry={20} fill={FILL.ellipse} stroke={STROKE} strokeWidth={1.6} />
            <NodeText x={160} y={32}>Sign up</NodeText>
          </Shape>

          {/* Step (rectangle) */}
          <Shape show={revealed > 1}>
            <rect x={104} y={66} width={112} height={38} rx={4} fill={FILL.rect} stroke={STROKE} strokeWidth={1.6} />
            <NodeText x={160} y={85}>Verify email</NodeText>
          </Shape>

          {/* Decision (diamond) */}
          <Shape show={revealed > 2}>
            <polygon points="160,120 214,145 160,170 106,145" fill={FILL.diamond} stroke={STROKE} strokeWidth={1.6} />
            <NodeText x={160} y={146}>Activated?</NodeText>
          </Shape>

          {/* Yes branch (rectangle) */}
          <Shape show={revealed > 3}>
            <rect x={24} y={210} width={120} height={38} rx={4} fill={FILL.rect} stroke={STROKE} strokeWidth={1.6} />
            <NodeText x={84} y={229}>Show first value</NodeText>
          </Shape>

          {/* No branch (rectangle) */}
          <Shape show={revealed > 4}>
            <rect x={176} y={210} width={120} height={38} rx={4} fill={FILL.rect} stroke={STROKE} strokeWidth={1.6} />
            <NodeText x={236} y={229}>Send a nudge</NodeText>
          </Shape>
        </svg>

        {/* "Ask AI" composer — open while generating, then closes (like the app) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-3">
          {composerOpen ? (
            <div className="w-[min(92%,22rem)] rounded-xl border border-border bg-popover/95 p-2.5 shadow-xl backdrop-blur-sm">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
                <IconSparkles className="h-3.5 w-3.5 text-violet-500" /> Generate with AI
              </div>
              <div className="mb-1.5 flex flex-wrap gap-1">
                {PILLS.map((p) => (
                  <span
                    key={p}
                    className={`rounded-full border px-2 py-0.5 text-[10px] ${
                      p === "Auto"
                        ? "border-brand/40 bg-brand/10 text-brand"
                        : "border-border/60 text-muted-foreground"
                    }`}
                  >
                    {p}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
                <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                  {typed || <span className="text-muted-foreground">Describe what you want to draw…</span>}
                  {(phase === "typing" || phase === "thinking") && (
                    <span className="ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 animate-pulse bg-violet-500 align-middle" />
                  )}
                </span>
                <span className="flex-shrink-0 rounded-md bg-brand px-2 py-1 text-[10px] font-medium text-white">
                  {phase === "building" || phase === "thinking" ? "Generating…" : "Generate"}
                </span>
              </div>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white shadow-lg">
              <IconSparkles className="h-4 w-4" /> Ask AI
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Floating tool palette mirroring the Excalidraw toolbar in OneCamp FE. */
function BoardToolbar() {
  return (
    <div className="absolute left-1/2 top-2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-border bg-card/95 px-1 py-1 shadow-sm backdrop-blur-sm">
      {[
        // hand
        <path key="h" d="M7 11V6.5a1 1 0 0 1 2 0V10m0-3.5a1 1 0 0 1 2 0V10m0-2.5a1 1 0 0 1 2 0V11m0-1a1 1 0 0 1 2 0v3.5a4.5 4.5 0 0 1-4.5 4.5H11a4 4 0 0 1-3.4-1.9L5 16" />,
        // square
        <rect key="r" x="5" y="5" width="14" height="14" rx="2" />,
        // diamond
        <path key="d" d="M12 4l8 8-8 8-8-8z" />,
        // circle
        <circle key="c" cx="12" cy="12" r="8" />,
        // arrow
        <path key="a" d="M5 12h13M13 6l6 6-6 6" />,
        // line
        <path key="l" d="M5 19L19 5" />,
        // pencil
        <path key="p" d="M4 20l4-1L19 8l-3-3L5 16z" />,
        // text
        <path key="t" d="M6 6h12M12 6v12" />,
      ].map((glyph, i) => (
        <span
          key={i}
          className={`grid h-7 w-7 place-items-center rounded-md ${
            i === 1 ? "bg-brand/15 text-brand" : "text-muted-foreground"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            {glyph}
          </svg>
        </span>
      ))}
    </div>
  );
}

function Shape({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <g
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "scale(1)" : "scale(0.85)",
        transformOrigin: "center",
        transformBox: "fill-box",
        transition: "opacity 360ms ease-out, transform 360ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {children}
    </g>
  );
}

function Edge({ d, show, label, lx, ly }: { d: string; show: boolean; label?: string; lx?: number; ly?: number }) {
  return (
    <g style={{ opacity: show ? 1 : 0, transition: "opacity 320ms ease-out" }}>
      <path d={d} fill="none" stroke={STROKE} strokeWidth={1.5} markerEnd="url(#bsArrow)" vectorEffect="non-scaling-stroke" />
      {label && lx != null && ly != null && (
        <text x={lx} y={ly} textAnchor="middle" fontSize={11} fontWeight={600} fill={STROKE}>
          {label}
        </text>
      )}
    </g>
  );
}

function NodeText({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={12.5} fill={STROKE}>
      {children}
    </text>
  );
}

export default BoardShowcase;
