/**
 * StackConvergence: a "wow" hero visual where the tools OneCamp replaces orbit
 * a glowing OneCamp core, with animated beams pulling each one's capability
 * into the center. Pure CSS/SVG, responsive, reduced-motion aware.
 */

interface Tool {
  name: string;
  feature: string;
  glyph: string;
  color: string; // brand-ish accent for the tile
}

// Each replaced tool maps to the OneCamp capability it folds into.
const TOOLS: Tool[] = [
  { name: "Slack", feature: "Chat & Channels", glyph: "💬", color: "#611f69" },
  { name: "Notion", feature: "Docs & Wiki", glyph: "📄", color: "#2f2f2f" },
  { name: "Asana", feature: "Tasks & Kanban", glyph: "✅", color: "#f06a6a" },
  { name: "Zoom", feature: "Video Meetings", glyph: "📹", color: "#2d8cff" },
  { name: "Google Calendar", feature: "Calendar", glyph: "📅", color: "#4285f4" },
  { name: "Loom", feature: "Recordings", glyph: "🎥", color: "#625df5" },
];

// Even radial placement (percent coords) for n=6 around a circle, starting top.
const RADIUS = 39;
const points = TOOLS.map((_, i) => {
  const a = (Math.PI * 2 * i) / TOOLS.length - Math.PI / 2;
  return { x: 50 + RADIUS * Math.cos(a), y: 50 + RADIUS * Math.sin(a) };
});

export function StackConvergence() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
      {/* animated beams from each tool into the core */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#34e3e3" />
            <stop offset="1" stopColor="#6d5efc" />
          </linearGradient>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="rgba(109,94,252,0.55)" />
            <stop offset="100" stopColor="rgba(109,94,252,0)" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="30" fill="url(#coreGlow)" />
        {points.map((p, i) => (
          <line
            key={i}
            x1={p.x}
            y1={p.y}
            x2="50"
            y2="50"
            stroke="url(#beamGrad)"
            strokeWidth="0.5"
            className="beam"
            style={{ animationDelay: `${i * 0.18}s`, opacity: 0.7 }}
          />
        ))}
      </svg>

      {/* orbit ring */}
      <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

      {/* central OneCamp core */}
      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="relative grid h-28 w-28 place-items-center rounded-3xl bg-gradient-to-br from-brand to-accent-cyan text-white shadow-[0_20px_60px_-15px_rgba(109,94,252,0.8)] sm:h-32 sm:w-32">
          <span className="absolute -inset-2 -z-10 animate-pulse-ring rounded-3xl bg-brand/40" />
          <div className="text-center">
            <div className="text-3xl">◎</div>
            <div className="mt-1 text-sm font-bold">OneCamp</div>
            <div className="text-[10px] font-medium text-white/80">all in one</div>
          </div>
        </div>
      </div>

      {/* orbiting tool tiles */}
      {TOOLS.map((t, i) => (
        <div
          key={t.name}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 animate-float"
          style={{ left: `${points[i].x}%`, top: `${points[i].y}%`, animationDelay: `${i * 0.5}s` }}
        >
          <div className="flex w-32 items-center gap-2 rounded-xl border border-white/10 bg-canvas-raised/90 px-2.5 py-2 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-105">
            <span
              className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-base"
              style={{ backgroundColor: `${t.color}33`, boxShadow: `inset 0 0 0 1px ${t.color}66` }}
            >
              {t.glyph}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-white">{t.name}</span>
              <span className="block truncate text-[10px] text-slate-400">{t.feature}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
