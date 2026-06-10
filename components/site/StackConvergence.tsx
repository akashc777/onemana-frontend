import type { ComponentType } from "react";
import {
  SlackMark,
  NotionMark,
  AsanaMark,
  ZoomMark,
  CalendarMark,
  OneCampMark,
} from "@/components/site/BrandMarks";

/**
 * StackConvergence: the hero "wow" visual. The tools OneCamp replaces orbit a
 * glowing OneCamp core; animated beams carry a traveling light particle from
 * each tool into the center, a dashed ring slowly rotates, and a conic glow
 * pulses behind the core. Pure CSS/SVG, responsive, reduced-motion aware.
 */

interface Tool {
  name: string;
  feature: string;
  Mark: ComponentType<{ className?: string }>;
  tint: string;
}

const TOOLS: Tool[] = [
  { name: "Slack", feature: "Chat & Channels", Mark: SlackMark, tint: "#611f69" },
  { name: "Notion", feature: "Docs & Wiki", Mark: NotionMark, tint: "#9aa0a6" },
  { name: "Asana", feature: "Tasks & Kanban", Mark: AsanaMark, tint: "#F06A6A" },
  { name: "Zoom", feature: "Video Meetings", Mark: ZoomMark, tint: "#2D8CFF" },
  { name: "Google Calendar", feature: "Calendar", Mark: CalendarMark, tint: "#4285F4" },
];

const RADIUS = 40;
const points = TOOLS.map((_, i) => {
  const a = (Math.PI * 2 * i) / TOOLS.length - Math.PI / 2;
  return { x: 50 + RADIUS * Math.cos(a), y: 50 + RADIUS * Math.sin(a) };
});

export function StackConvergence() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[36rem]">
      {/* rotating dashed orbit ring */}
      <div
        className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/10"
        style={{ animation: "oc-spin 60s linear infinite" }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
        style={{ animation: "oc-spin 40s linear infinite reverse" }}
      />

      {/* beams + traveling particles */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#34e3e3" />
            <stop offset="1" stopColor="#6d5efc" />
          </linearGradient>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="rgba(109,94,252,0.5)" />
            <stop offset="1" stopColor="rgba(109,94,252,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="26" fill="url(#coreGlow)" />
        {points.map((p, i) => {
          const d = `M${p.x.toFixed(2)},${p.y.toFixed(2)} L50,50`;
          return (
            <g key={i}>
              <path id={`beam-${i}`} d={d} stroke="url(#beamGrad)" strokeWidth="0.4" className="beam" style={{ animationDelay: `${i * 0.16}s`, opacity: 0.6 }} fill="none" />
              <circle r="0.9" fill="#34e3e3">
                <animateMotion dur="2.6s" begin={`${i * 0.5}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
                  <mpath href={`#beam-${i}`} />
                </animateMotion>
                <animate attributeName="opacity" dur="2.6s" begin={`${i * 0.5}s`} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.1;0.85;1" />
              </circle>
            </g>
          );
        })}
      </svg>

      {/* conic glow behind core */}
      <div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-2xl"
        style={{
          background: "conic-gradient(from 0deg, #6d5efc, #34e3e3, #f472b6, #6d5efc)",
          animation: "oc-spin 12s linear infinite",
        }}
      />

      {/* central OneCamp core */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="relative grid h-28 w-28 place-items-center rounded-[1.75rem] bg-gradient-to-br from-brand to-accent-cyan text-white shadow-[0_20px_60px_-12px_rgba(109,94,252,0.85)] sm:h-32 sm:w-32">
          <span className="absolute -inset-1 -z-10 animate-pulse-ring rounded-[1.75rem] bg-brand/40" />
          <span className="absolute -inset-1 -z-10 animate-pulse-ring rounded-[1.75rem] bg-accent-cyan/30 [animation-delay:1.2s]" />
          <div className="text-center">
            <OneCampMark className="mx-auto h-10 w-10" />
            <div className="mt-1 text-sm font-bold">OneCamp</div>
            <div className="text-[10px] font-medium text-white/80">all in one</div>
          </div>
        </div>
      </div>

      {/* orbiting tool tiles */}
      {TOOLS.map((t, i) => (
        <div
          key={t.name}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${points[i].x}%`, top: `${points[i].y}%` }}
        >
          <div className="animate-float" style={{ animationDelay: `${i * 0.6}s` }}>
            <div className="group flex w-[8.5rem] items-center gap-2 rounded-xl border border-white/10 bg-canvas-raised/90 px-2.5 py-2 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/25">
              <span
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `${t.tint}22`, boxShadow: `inset 0 0 0 1px ${t.tint}55` }}
              >
                <t.Mark className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-white">{t.name}</span>
                <span className="block truncate text-[10px] text-slate-400">{t.feature}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
