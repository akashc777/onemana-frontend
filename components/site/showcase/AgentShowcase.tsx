"use client";

import { useEffect, useRef, useState } from "react";
import { IconSparkles } from "@/components/site/showcase/ShowcaseIcons";
import { TypingIndicator } from "@/components/site/TypingIndicator";

const USER_PROMPT = "Catch me up on #engineering and create the follow-ups";

const RECAP_LINES = [
  "Checkout is on staging, payment latency down 40%.",
  "Deploy review and rollback drill in progress.",
  "Aisha asked for an APAC recap.",
];

interface AgentAction {
  verb: string;
  detail: string;
  meta: string;
}

const ACTIONS: AgentAction[] = [
  { verb: "Create task", detail: "Review checkout deploy", meta: "Daniel Cho" },
  { verb: "Create task", detail: "Post APAC recap", meta: "Aisha Khan" },
  { verb: "Set reminder", detail: "Promote checkout to prod", meta: "Tomorrow 9:00 AM" },
];

type Phase = "thinking" | "answered" | "proposed" | "confirming" | "done";

const TIMINGS: Record<Phase, number> = {
  thinking: 900,
  answered: 700,
  proposed: 2100,
  confirming: 900,
  done: 2200,
};

const ORDER: Phase[] = ["thinking", "answered", "proposed", "confirming", "done"];

/** AI Agent preview: reads the channel, recaps it, then PROPOSES follow-up
 *  actions that only run after an explicit confirm - OneCamp's real flow. */
export function AgentShowcase({ embedded = false }: { embedded?: boolean }) {
  const [phase, setPhase] = useState<Phase>("thinking");
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setPhase("done");
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = ORDER[i];
      timer = setTimeout(() => {
        i = (i + 1) % ORDER.length;
        setPhase(ORDER[i]);
        tick();
      }, TIMINGS[current]);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  const showAnswer = phase !== "thinking";
  const showActions = phase === "proposed" || phase === "confirming" || phase === "done";
  const isDone = phase === "done";

  return (
    <div className={`flex flex-col ${embedded ? "h-full min-h-0" : "h-[420px]"}`}>
      <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <IconSparkles className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">AI Agent</p>
            <p className="text-[11px] text-muted-foreground">Works across your workspace</p>
          </div>
        </div>
        <span className="hidden rounded-md bg-violet-500/10 px-2 py-1 text-[10px] font-medium text-violet-700 dark:text-violet-300 sm:inline">
          Your model
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 sm:p-4">
        {/* User ask */}
        <div className="flex justify-end">
          <div className="max-w-[88%] rounded-lg rounded-br-sm bg-foreground px-3 py-2 text-[11px] leading-snug text-background sm:text-xs">
            {USER_PROMPT}
          </div>
        </div>

        {/* Agent reply */}
        <div className="flex gap-2">
          <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <IconSparkles className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 max-w-[calc(100%-2rem)] flex-1 rounded-lg rounded-bl-sm border border-border bg-muted px-3 py-2.5 text-[11px] leading-[1.55] text-foreground sm:text-xs">
            {phase === "thinking" && (
              <span className="inline-flex items-center py-0.5">
                <TypingIndicator />
              </span>
            )}

            {showAnswer && (
              <div className="animate-fade-up">
                <p className="font-medium">Here&apos;s today in #engineering:</p>
                <ul className="mt-1 space-y-0.5">
                  {RECAP_LINES.map((line) => (
                    <li key={line} className="flex gap-1.5">
                      <span className="text-muted-foreground">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showActions && (
              <div className="mt-2.5 space-y-1.5 animate-fade-up">
                <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                  {isDone ? "Done" : "Proposed actions"}
                </p>
                {ACTIONS.map((a) => (
                  <div
                    key={a.detail}
                    className={`flex items-center gap-2 rounded-md border px-2 py-1.5 transition-colors duration-300 ${
                      isDone ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-border bg-background"
                    }`}
                  >
                    <span
                      className={`grid h-4 w-4 flex-shrink-0 place-items-center rounded-full text-[9px] font-bold transition-colors duration-300 ${
                        isDone ? "bg-emerald-500 text-white" : "border border-muted-foreground/40 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[10px] text-foreground">
                      <span className="font-medium">{a.verb}:</span> {a.detail}
                    </span>
                    <span className="flex-shrink-0 text-[9px] text-muted-foreground">{a.meta}</span>
                  </div>
                ))}

                {phase === "proposed" && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="rounded-md bg-brand px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm ring-2 ring-brand/30">
                      Confirm
                    </span>
                    <span className="rounded-md border border-border px-2.5 py-1 text-[10px] text-muted-foreground">
                      Dismiss
                    </span>
                    <span className="ml-auto text-[9px] text-muted-foreground">Needs your OK</span>
                  </div>
                )}
                {phase === "confirming" && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-brand/80 px-2.5 py-1 text-[10px] font-semibold text-white">
                      <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-white/40 border-t-white" />
                      Running…
                    </span>
                  </div>
                )}
                {isDone && (
                  <p className="pt-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                    ✓ Confirmed by you · 3 actions done
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-border p-2.5 sm:p-3">
        <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground sm:text-sm">
          Ask your workspace to do anything…
        </div>
      </div>
    </div>
  );
}
