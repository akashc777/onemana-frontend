"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  SlackMarkAnimated,
  NotionMark,
  AsanaMark,
  ZoomMark,
  CalendarMark,
  OneCampLogo,
} from "@/components/site/BrandMarks";

interface Tool {
  name: string;
  feature: string;
  Mark: ComponentType<{ className?: string }>;
  tint: string;
  animated?: boolean;
}

const TOOLS: Tool[] = [
  { name: "Slack", feature: "Chat", Mark: SlackMarkAnimated, tint: "#611f69", animated: true },
  { name: "Notion", feature: "Docs", Mark: NotionMark, tint: "#787774" },
  { name: "Asana", feature: "Tasks", Mark: AsanaMark, tint: "#F06A6A" },
  { name: "Zoom", feature: "Video", Mark: ZoomMark, tint: "#2D8CFF" },
  { name: "Calendar", feature: "Schedule", Mark: CalendarMark, tint: "#4285F4" },
];

const RADIUS = 38;
const BEAM_DUR = 2.6;
const points = TOOLS.map((_, i) => {
  const a = (Math.PI * 2 * i) / TOOLS.length - Math.PI / 2;
  return { x: 50 + RADIUS * Math.cos(a), y: 50 + RADIUS * Math.sin(a) };
});

function ToolTile({ tool, index }: { tool: Tool; index: number }) {
  const p = points[index];
  const floatDelay = index * 0.55;
  const absorbDelay = index * 0.5;
  const enterDelay = 0.12 + index * 0.1;

  return (
    <div
      className="tool-tile absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        animationDelay: `${enterDelay}s`,
      }}
    >
      <div className="tile-float" style={{ animationDelay: `${floatDelay}s` }}>
        <div
          className="tile-absorb group flex w-[7.75rem] items-center gap-2 rounded-xl border border-border bg-card/95 px-2.5 py-2 shadow-sm backdrop-blur-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card sm:w-[8.25rem]"
          style={{ animationDelay: `${absorbDelay}s` }}
        >
          <span
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-md transition-transform duration-300 group-hover:scale-105"
            style={{
              backgroundColor: `${tool.tint}18`,
              boxShadow: `inset 0 0 0 1px ${tool.tint}33`,
            }}
          >
            <tool.Mark className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium text-foreground">{tool.name}</span>
            <span className="block truncate text-[10px] text-muted-foreground">{tool.feature}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * StackConvergence: tools OneCamp replaces orbit a glowing core. Beams carry
 * light particles inward, rings rotate, tiles float, and the Slack hash
 * periodically organizes - all theme-aware and reduced-motion safe.
 */
export function StackConvergence() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative mx-auto aspect-square w-full max-w-[36rem] ${entered ? "stack-enter" : ""}`}
    >
      {/* Dual counter-rotating orbit rings */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[82%] w-[82%] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div className="orbit-slow h-full w-full rounded-full border border-dashed border-border/80" />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div className="orbit-reverse h-full w-full rounded-full border border-border/50" />
      </div>

      {/* Warm conic halo behind core */}
      <div
        className="core-halo pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 rounded-full opacity-40 blur-3xl dark:opacity-25"
        style={{
          background: "conic-gradient(from 0deg, #FF4D00, #FF8A00, #FFB347, #FF4D00)",
        }}
        aria-hidden
      />

      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-border" aria-hidden>
        <defs>
          <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D00" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FF4D00" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="beam-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.15" />
            <stop offset="45%" stopColor="#FF4D00" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FF6B2E" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="core-radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF4D00" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FF4D00" stopOpacity="0" />
          </radialGradient>
          <filter id="particle-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.35" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Subtle constellation field */}
        {[
          [18, 22], [82, 18], [14, 72], [88, 76], [50, 8], [8, 48], [92, 44], [32, 88], [68, 90],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="0.35" fill="currentColor" opacity="0.35">
            <animate attributeName="opacity" dur="3s" repeatCount="indefinite" values="0.2;0.5;0.2" begin={`${i * 0.35}s`} />
          </circle>
        ))}

        <circle cx="50" cy="50" r="24" fill="url(#core-radial)" />

        {points.map((p, i) => {
          const d = `M${p.x.toFixed(2)},${p.y.toFixed(2)} L50,50`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 5" opacity="0.55" />
              <path
                id={`beam-${i}`}
                d={d}
                fill="none"
                stroke="url(#beam-grad)"
                strokeWidth="0.5"
                className="convergence-beam"
                style={{ animationDelay: `${i * 0.16}s` }}
                opacity="0.75"
              />
              <path
                d={d}
                fill="none"
                stroke="url(#flow-grad)"
                strokeWidth="0.55"
                className="convergence-flow"
                style={{ animationDelay: `${i * 0.35}s` }}
              />
              <circle r="1.1" fill="#FF6B2E" filter="url(#particle-glow)" opacity="0.95">
                <animateMotion
                  dur={`${BEAM_DUR}s`}
                  begin={`${i * 0.5}s`}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="linear"
                >
                  <mpath href={`#beam-${i}`} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  dur={`${BEAM_DUR}s`}
                  begin={`${i * 0.5}s`}
                  repeatCount="indefinite"
                  values="0;1;1;0"
                  keyTimes="0;0.08;0.88;1"
                />
              </circle>
            </g>
          );
        })}

        <g transform="translate(50, 50)">
          <circle r="14" fill="none" stroke="#FF4D00" strokeWidth="0.35" opacity="0.3">
            <animate attributeName="r" dur="3s" repeatCount="indefinite" values="13;16;13" keyTimes="0;0.7;1" />
            <animate attributeName="opacity" dur="3s" repeatCount="indefinite" values="0.4;0;0.4" keyTimes="0;0.7;1" />
          </circle>
          <circle r="10" fill="none" stroke="#FF4D00" strokeWidth="0.2" opacity="0.2">
            <animate attributeName="r" dur="3s" repeatCount="indefinite" values="9;12;9" keyTimes="0;0.15;1" begin="0.6s" />
            <animate attributeName="opacity" dur="3s" repeatCount="indefinite" values="0.25;0;0.25" keyTimes="0;0.7;1" begin="0.6s" />
          </circle>
        </g>
      </svg>

      {/* Central core */}
      <div className="core-breathe absolute left-1/2 top-1/2 z-10">
        <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-brand/20 bg-card shadow-product sm:h-28 sm:w-28">
          <span className="absolute -inset-1 -z-10 rounded-2xl bg-brand/10 blur-sm" aria-hidden />
          <span
            className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br from-brand/8 to-transparent"
            aria-hidden
          />
          <OneCampLogo className="h-10 w-10 rounded-lg sm:h-11 sm:w-11" />
          <div className="mt-1.5 text-xs font-semibold text-foreground">OneCamp</div>
          <div className="text-[10px] text-muted-foreground">all in one</div>
        </div>
      </div>

      {TOOLS.map((t, i) => (
        <ToolTile key={t.name} tool={t} index={i} />
      ))}
    </div>
  );
}