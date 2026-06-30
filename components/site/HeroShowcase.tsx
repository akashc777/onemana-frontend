"use client";

import { useEffect, useRef, useState } from "react";
import { HeroFrame } from "@/components/site/HeroFrame";
import {
  ActScene,
  HandoffScene,
  KnowledgeScene,
  MentionAgentScene,
  type SceneProps,
} from "@/components/site/showcase/HeroScenes";

/**
 * HeroShowcase - a cycler that rotates through short, self-contained demos of
 * what OneCamp's AI actually does, each mirroring the real app UI:
 *   1. AI teammates you @mention in a channel (reply in-thread, badged)
 *   2. Ask AI to do the work - recap + propose tasks, run only on your confirm
 *   3. Answers from everything, cited (workspace + connected apps)
 *   4. Hand it a task and walk away - durable, live progress, survives restarts
 *
 * Each scene runs its own timeline and calls onDone() to advance. Scenes are
 * remounted per cycle (keyed), so timers reset cleanly and never overlap.
 * Reduced motion: the first scene renders its final state and we don't rotate.
 */
const SCENES: { key: string; label: string; Scene: (p: SceneProps) => JSX.Element }[] = [
  { key: "mention", label: "@mention an AI teammate", Scene: MentionAgentScene },
  { key: "act", label: "Ask AI - it acts, you approve", Scene: ActScene },
  { key: "handoff", label: "Hand it a task, walk away", Scene: HandoffScene },
  { key: "knowledge", label: "Answers from everything, cited", Scene: KnowledgeScene },
];

export function HeroShowcase({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const reducedRef = useRef(false);

  useEffect(() => {
    const r =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = r;
    setReduced(r);
  }, []);

  const advance = () => {
    if (reducedRef.current) return;
    setIndex((i) => (i + 1) % SCENES.length);
  };

  const Active = SCENES[index].Scene;

  return (
    <div className={className}>
      <HeroFrame>
        <Active key={SCENES[index].key} reduced={reduced} onDone={advance} />
      </HeroFrame>

      {/* Scene rail (outside the frame so it stays interactive): tells the
          viewer this is a rotating tour and lets them jump between capabilities,
          with the active one highlighted. */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
        {SCENES.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setIndex(i)}
              className={`group flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                active
                  ? "border-brand/50 bg-brand/[0.08] text-brand"
                  : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
              aria-label={`Show: ${s.label}`}
              aria-current={active}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  active ? "bg-brand" : "bg-muted-foreground/40 group-hover:bg-muted-foreground"
                }`}
                aria-hidden
              />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
