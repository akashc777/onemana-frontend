"use client";

import { useEffect, useRef, useState } from "react";

/**
 * DocShowcase mirrors OneCamp's collaborative doc editor: presence avatars, a
 * "Saved" indicator, a formatting toolbar, and live multiplayer editing — a
 * remote collaborator's caret types text in real time (typewriter), with a
 * second parked remote cursor and a selection highlight. Reduced-motion aware.
 */

const TYPED = "We'll ship the mobile PWA, push notifications, and offline drafts by end of Q3.";

const PEOPLE = [
  { initials: "PN", color: "#f472b6", name: "Priya" },
  { initials: "DC", color: "#38bdf8", name: "Daniel" },
  { initials: "AK", color: "#a78bfa", name: "Aisha" },
];

const TOOLBAR = ["B", "I", "U", "H1", "H2", "• List", "“ ”", "</>", "🔗"];

export function DocShowcase() {
  const [typed, setTyped] = useState("");
  const [cycle, setCycle] = useState(0);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setTyped(TYPED);
      return;
    }
    let i = 0;
    let hold: ReturnType<typeof setTimeout>;
    setTyped("");
    const tick = setInterval(() => {
      i += 1;
      setTyped(TYPED.slice(0, i));
      if (i >= TYPED.length) {
        clearInterval(tick);
        hold = setTimeout(() => setCycle((c) => c + 1), 2600); // pause, then loop
      }
    }, 55);
    return () => {
      clearInterval(tick);
      clearTimeout(hold);
    };
  }, [cycle]);

  const typing = typed.length > 0 && typed.length < TYPED.length;

  return (
    <div className="flex h-[420px] flex-col">
      {/* doc header */}
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">📄</span>
          <span className="text-sm font-semibold text-white">Q3 Product Roadmap</span>
        </div>
        <div className="flex items-center gap-3">
          {/* presence */}
          <div className="flex -space-x-2">
            {PEOPLE.map((p) => (
              <span
                key={p.initials}
                title={p.name}
                className="grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold text-white ring-2 ring-canvas-raised"
                style={{ backgroundColor: p.color }}
              >
                {p.initials}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Saved
          </span>
        </div>
      </header>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 px-3 py-2">
        {TOOLBAR.map((t) => (
          <span key={t} className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 hover:bg-white/5">
            {t}
          </span>
        ))}
      </div>

      {/* document body */}
      <div className="flex-1 overflow-hidden p-5">
        <h3 className="text-xl font-bold text-white">Q3 Product Roadmap</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Our north star this quarter is a{" "}
          {/* a remote user's selection highlight */}
          <span className="rounded bg-[#38bdf8]/20 px-0.5" style={{ boxShadow: "inset 0 -1px 0 #38bdf8" }}>
            delightful mobile experience
          </span>
          {/* parked remote cursor */}
          <span className="relative inline-block align-middle">
            <span className="inline-block h-4 w-0.5 translate-y-0.5 bg-[#38bdf8]" />
            <span className="absolute -top-4 left-0 whitespace-nowrap rounded px-1 py-0.5 text-[8px] font-semibold text-white" style={{ backgroundColor: "#38bdf8" }}>
              Daniel
            </span>
          </span>{" "}
          for every team.
        </p>

        <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
          <li className="flex gap-2"><span className="text-slate-500">•</span> Real-time sync across web and PWA</li>
          <li className="flex gap-2"><span className="text-slate-500">•</span> Push notifications and app badges</li>
        </ul>

        {/* the line being typed live by a remote collaborator */}
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          {typed}
          {(typing || typed === "") && (
            <span className="relative inline-block align-middle">
              <span className="inline-block h-4 w-0.5 translate-y-0.5 animate-pulse" style={{ backgroundColor: "#f472b6" }} />
              <span className="absolute -top-4 left-0 whitespace-nowrap rounded px-1 py-0.5 text-[8px] font-semibold text-white" style={{ backgroundColor: "#f472b6" }}>
                Priya
              </span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
