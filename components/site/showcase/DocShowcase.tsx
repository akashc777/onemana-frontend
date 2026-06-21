"use client";

import { useEffect, useRef, useState } from "react";
import { IconSparkles } from "@/components/site/showcase/ShowcaseIcons";

/**
 * DocShowcase mirrors OneCamp's collaborative doc editor, but the spotlight is
 * the DOC AGENT: asked to "draft the rollout section", it types a real section
 * into the doc (typewriter), attributed to the AI agent. A human collaborator
 * (Daniel) is present alongside, so it reads as agent-assisted, not autonomous.
 * Reduced-motion aware.
 */

const DRAFT = "We'll roll out to 10% of traffic on Monday, watch error rates for 24h, then ramp to 100% by Wednesday with rollback ready.";

const PEOPLE = [
  { initials: "DC", color: "#38bdf8", name: "Daniel" },
  { initials: "AK", color: "#a78bfa", name: "Aisha" },
];

const TOOLBAR = ["B", "I", "U", "H1", "H2", "• List", "“ ”", "</>", "🔗"];

type Phase = "thinking" | "typing" | "done";

export function DocShowcase({ embedded = false }: { embedded?: boolean }) {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("thinking");
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setTyped(DRAFT);
      setPhase("done");
      return;
    }

    let typeTimer: ReturnType<typeof setInterval>;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const start = () => {
      setPhase("thinking");
      setTyped("");
      timers.push(
        setTimeout(() => {
          setPhase("typing");
          let i = 0;
          typeTimer = setInterval(() => {
            i += 1;
            setTyped(DRAFT.slice(0, i));
            if (i >= DRAFT.length) {
              clearInterval(typeTimer);
              setPhase("done");
              timers.push(setTimeout(start, 3200)); // hold, then loop
            }
          }, 38);
        }, 1100),
      );
    };
    start();

    return () => {
      clearInterval(typeTimer);
      timers.forEach(clearTimeout);
    };
  }, []);

  const typing = phase === "typing";

  return (
    <div className={`flex flex-col ${embedded ? "h-full min-h-0" : "h-[420px]"}`}>
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Q3 Product Roadmap</span>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Doc agent status chip */}
          <span
            className={`hidden items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition-colors sm:inline-flex ${
              phase === "done"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-violet-500/10 text-violet-700 dark:text-violet-300"
            }`}
          >
            {phase === "done" ? (
              <>✓ Drafted by AI</>
            ) : (
              <>
                <IconSparkles className="h-3 w-3" /> {phase === "thinking" ? "AI agent reading thread…" : "Drafting…"}
              </>
            )}
          </span>
          <div className="flex -space-x-2">
            {PEOPLE.map((p) => (
              <span
                key={p.initials}
                title={p.name}
                className="grid h-6 w-6 place-items-center rounded-full text-[9px] font-bold text-white ring-2 ring-background"
                style={{ backgroundColor: p.color }}
              >
                {p.initials}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Saved
          </span>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
        {TOOLBAR.map((t) => (
          <span key={t} className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">
            {t}
          </span>
        ))}
      </div>

      <div className="flex-1 overflow-hidden p-5">
        <h3 className="text-xl font-semibold text-foreground">Q3 Product Roadmap</h3>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          Our north star this quarter is a{" "}
          <span className="rounded bg-[#38bdf8]/20 px-0.5" style={{ boxShadow: "inset 0 -1px 0 #38bdf8" }}>
            delightful mobile experience
          </span>
          <span className="relative inline-block align-middle">
            <span className="inline-block h-4 w-0.5 translate-y-0.5 bg-[#38bdf8]" />
            <span className="absolute -top-4 left-0 whitespace-nowrap rounded px-1 py-0.5 text-[8px] font-semibold text-white" style={{ backgroundColor: "#38bdf8" }}>
              Daniel
            </span>
          </span>{" "}
          for every team.
        </p>

        {/* The section the doc agent is drafting */}
        <h4 className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-foreground">
          Rollout plan
          {phase !== "done" && (
            <span className="inline-flex items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-[8px] font-semibold text-violet-700 dark:text-violet-300">
              <IconSparkles className="h-2.5 w-2.5" /> AI agent
            </span>
          )}
        </h4>
        <p className="mt-1.5 min-h-[3.5rem] text-sm leading-relaxed text-foreground/80">
          {typed}
          {(typing || phase === "thinking") && (
            <span className="relative inline-block align-middle">
              <span className="inline-block h-4 w-0.5 translate-y-0.5 animate-pulse" style={{ backgroundColor: "#7c6cff" }} />
              <span className="absolute -top-4 left-0 inline-flex items-center gap-0.5 whitespace-nowrap rounded px-1 py-0.5 text-[8px] font-semibold text-white" style={{ backgroundColor: "#7c6cff" }}>
                AI agent
              </span>
            </span>
          )}
        </p>

        {phase === "done" && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/[0.06] px-2 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 animate-fade-up">
            ✓ Section inserted · you accepted
          </span>
        )}
      </div>
    </div>
  );
}
