"use client";

// Hero scenes: short, self-contained product demos that the HeroShowcase cycler
// rotates through. Each scene mirrors a REAL OneCamp AI capability and the real
// app's UI (channel posts, the AI side panel, badged AI teammates, propose-then-
// confirm actions, cited cross-source answers). A scene runs its scripted
// timeline while `active`, then calls `onDone()` to advance the cycler; with
// reduced motion it renders its final state and never animates.

import { useEffect, useRef, useState } from "react";
import { ShowcaseShell } from "@/components/site/showcase/ShowcaseShell";
import { IconSparkles, IconHash } from "@/components/site/showcase/ShowcaseIcons";
import { TypingIndicator } from "@/components/site/TypingIndicator";

export interface SceneProps {
  /** prefers-reduced-motion: render the final state, no timers, no auto-advance. */
  reduced: boolean;
  /** Called once when the scene's timeline completes, so the cycler advances. */
  onDone: () => void;
}

/**
 * useTimeline schedules a set of absolute-offset steps and clears them all on
 * unmount. The cycler remounts each scene per cycle (keyed), so a fresh timeline
 * runs every time and timers never leak across scenes.
 */
function useTimeline(enabled: boolean, steps: { at: number; run: () => void }[]) {
  // steps is a fresh array each render; we intentionally schedule once on mount.
  const ref = useRef(steps);
  ref.current = steps;
  useEffect(() => {
    if (!enabled) return;
    const ids = ref.current.map((s) => setTimeout(s.run, s.at));
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}

/** How long a completed scene rests on its final state before the cycler advances. */
const HOLD_MS = 3400;

/**
 * useHoldThenDone fires onDone HOLD_MS after `active` first becomes true, so the
 * cycler advances only AFTER a scene has fully finished (not on a fixed offset
 * that could cut a slow stream short), with a consistent pause on the result.
 */
function useHoldThenDone(active: boolean, onDone: () => void, hold = HOLD_MS) {
  const cb = useRef(onDone);
  cb.current = onDone;
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => cb.current(), hold);
    return () => clearTimeout(t);
  }, [active, hold]);
}

// --- shared bits -----------------------------------------------------------

function BotAvatar({ initials = "RC", tint = "bg-violet-500/15 text-violet-600 dark:text-violet-400" }: { initials?: string; tint?: string }) {
  return (
    <span className={`relative grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-[10px] font-semibold sm:h-9 sm:w-9 ${tint}`}>
      {initials}
      <span className="absolute -bottom-1 -right-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-violet-600 text-white ring-2 ring-card">
        <IconSparkles className="h-2 w-2" />
      </span>
    </span>
  );
}

function AiBadge() {
  return (
    <span className="rounded-[4px] bg-violet-500/15 px-1 py-px text-[8px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
      AI
    </span>
  );
}

function Caret() {
  return <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-brand align-middle" />;
}

/** Word-by-word streamer. Returns the streamed text and a `done` flag. */
function useStream(active: boolean, full: string, stepMs: number, onComplete?: () => void) {
  const [text, setText] = useState("");
  const cb = useRef(onComplete);
  cb.current = onComplete;
  useEffect(() => {
    if (!active) return;
    const words = full.split(/(\s+)/);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setText(words.slice(0, i).join(""));
      if (i >= words.length) {
        clearInterval(id);
        cb.current?.();
      }
    }, stepMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return text;
}

const AI_HEADER = (
  <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-border/60 bg-card/40 px-3">
    <div className="flex items-center gap-2">
      <span className="grid h-6 w-6 place-items-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
        <IconSparkles className="h-3.5 w-3.5" />
      </span>
      <span className="text-xs font-semibold text-foreground">OneCamp AI</span>
    </div>
  </div>
);

// ===========================================================================
// Scene 1 - AI teammates you @mention (in-channel, badged, replies in-thread)
// ===========================================================================

const MENTION_PROMPT = "@Release Captain are we clear to ship v2.4 tonight?";
const MENTION_REPLY = `Checked the v2.4 release checklist:
✓ Migrations applied on staging
✓ Payment latency down 40%
⚠ Rollback drill still open - owner @Daniel

I'd hold for Daniel's sign-off, then ship. Want me to remind him?`;

export function MentionAgentScene({ reduced, onDone }: SceneProps) {
  const [phase, setPhase] = useState<"context" | "typing" | "sent" | "thinking" | "reply" | "approve" | "done">(
    reduced ? "done" : "context",
  );
  const [typed, setTyped] = useState("");

  useTimeline(!reduced, [{ at: 1500, run: () => setPhase("typing") }]);
  // Advance only after the reply has fully landed (approve chip shown), holding
  // on the result so the @mention scene doesn't cut straight to the next.
  useHoldThenDone(!reduced && phase === "approve", onDone);

  // type the mention prompt
  useEffect(() => {
    if (reduced || phase !== "typing") return;
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(MENTION_PROMPT.length, i + 2);
      setTyped(MENTION_PROMPT.slice(0, i));
      if (i >= MENTION_PROMPT.length) {
        clearInterval(id);
        setTimeout(() => setPhase("sent"), 350);
      }
    }, 38);
    return () => clearInterval(id);
  }, [phase, reduced]);

  useEffect(() => {
    if (reduced) return;
    if (phase === "sent") {
      const t = setTimeout(() => setPhase("thinking"), 500);
      return () => clearTimeout(t);
    }
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("reply"), 1300);
      return () => clearTimeout(t);
    }
  }, [phase, reduced]);

  const replyText = useStream(phase === "reply", MENTION_REPLY, 42, () => setPhase("approve"));
  const showReply = phase === "reply" || phase === "approve" || phase === "done";
  const showApprove = phase === "approve" || phase === "done";
  const sentPost = phase === "sent" || phase === "thinking" || showReply;

  return (
    <ShowcaseShell activeNav="channels" heightClass="h-[min(480px,74vh)] sm:h-[480px]">
      <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-sm font-medium text-foreground">
            <IconHash className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> engineering
          </p>
          <p className="text-[11px] text-muted-foreground">Release Captain · AI teammate · in this channel</p>
        </div>
        <span className="flex-shrink-0 rounded-md border border-border bg-muted/60 px-2 py-1 text-[11px] font-medium text-foreground">
          Ask AI
        </span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden p-3 sm:p-4">
        {/* context post */}
        <article className="flex gap-2.5">
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-violet-500/15 text-[10px] font-semibold text-violet-700 dark:text-violet-300 sm:h-9 sm:w-9">
            AK
          </span>
          <div className="min-w-0">
            <p className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-foreground">Aisha Khan</span>
              <span className="text-[10px] text-muted-foreground">9:38 PM</span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">Release window is 9pm. Are we actually good to go?</p>
          </div>
        </article>

        {/* the @mention post */}
        {sentPost && (
          <article className="flex gap-2.5 animate-fade-up">
            <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-indigo-500/15 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 sm:h-9 sm:w-9">
              You
            </span>
            <div className="min-w-0">
              <p className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-foreground">You</span>
                <span className="text-[10px] text-muted-foreground">9:39 PM</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                <span className="rounded bg-violet-500/15 px-1 font-medium text-violet-700 dark:text-violet-300">@Release Captain</span>{" "}
                are we clear to ship v2.4 tonight?
              </p>
            </div>
          </article>
        )}

        {/* the AI teammate reply, in-thread, badged */}
        {(phase === "thinking" || showReply) && (
          <article className="flex gap-2.5 animate-fade-up">
            <BotAvatar />
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold text-foreground">Release Captain</span>
                <AiBadge />
                <span className="text-[10px] text-muted-foreground">now</span>
              </p>
              {phase === "thinking" ? (
                <span className="mt-1 inline-flex items-center py-0.5">
                  <TypingIndicator />
                </span>
              ) : (
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {replyText}
                  {phase === "reply" && <Caret />}
                </p>
              )}
              {showApprove && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[10px] text-foreground">
                    <span className="grid h-3.5 w-3.5 place-items-center rounded-full border border-muted-foreground/40 text-transparent">✓</span>
                    Set reminder: <span className="font-medium">nudge @Daniel</span>
                  </span>
                  <span className="rounded-md bg-brand px-2 py-1 text-[10px] font-semibold text-white ring-2 ring-brand/30">Confirm</span>
                  <span className="ml-auto text-[9px] text-muted-foreground">needs your OK</span>
                </div>
              )}
            </div>
          </article>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-border p-2.5 sm:p-3">
        <div
          className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
            phase === "typing" ? "border-brand/40 bg-background text-foreground" : "border-border bg-muted/50 text-muted-foreground"
          }`}
        >
          {phase === "typing" ? (
            <>
              {typed}
              <Caret />
            </>
          ) : (
            "Message #engineering…"
          )}
        </div>
      </div>
    </ShowcaseShell>
  );
}

// ===========================================================================
// Scene 2 - Ask AI to do the work: recap + propose tasks, run only on confirm
// ===========================================================================

const CTX_POSTS = [
  { initials: "PN", tint: "bg-rose-500/15 text-rose-700 dark:text-rose-300", author: "Priya Nair", time: "9:41 AM", text: "Shipped checkout to staging. Payment latency down 40%." },
  { initials: "DC", tint: "bg-sky-500/15 text-sky-700 dark:text-sky-300", author: "Daniel Cho", time: "9:42 AM", text: "I'll run the rollback drill before we promote to prod." },
  { initials: "AK", tint: "bg-violet-500/15 text-violet-700 dark:text-violet-300", author: "Aisha Khan", time: "9:43 AM", text: "Can someone post an APAC recap? I missed the morning thread." },
];

const ACT_PROMPT = "Recap today and turn the follow-ups into tasks";
const ACT_ANSWER = `Today in #engineering:
• Checkout on staging, payment latency -40%
• Rollback drill in progress before prod

Follow-ups I can set up for you:`;
const ACT_ACTIONS = [
  { verb: "Create task", detail: "Review checkout deploy", meta: "Daniel Cho" },
  { verb: "Create task", detail: "Post APAC recap", meta: "Aisha Khan" },
  { verb: "Set reminder", detail: "Promote checkout to prod", meta: "Tomorrow 9:00 AM" },
];

export function ActScene({ reduced, onDone }: SceneProps) {
  const [phase, setPhase] = useState<"typing" | "thinking" | "streaming" | "proposed" | "confirming" | "done">(
    reduced ? "done" : "typing",
  );
  const [typed, setTyped] = useState(reduced ? "" : "");

  useHoldThenDone(!reduced && phase === "done", onDone);

  useEffect(() => {
    if (reduced || phase !== "typing") return;
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(ACT_PROMPT.length, i + 2);
      setTyped(ACT_PROMPT.slice(0, i));
      if (i >= ACT_PROMPT.length) {
        clearInterval(id);
        setTimeout(() => {
          setTyped("");
          setPhase("thinking");
        }, 300);
      }
    }, 40);
    return () => clearInterval(id);
  }, [phase, reduced]);

  useEffect(() => {
    if (reduced) return;
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("streaming"), 1300);
      return () => clearTimeout(t);
    }
    if (phase === "proposed") {
      const t = setTimeout(() => setPhase("confirming"), 2000);
      return () => clearTimeout(t);
    }
    if (phase === "confirming") {
      const t = setTimeout(() => setPhase("done"), 900);
      return () => clearTimeout(t);
    }
  }, [phase, reduced]);

  const answer = useStream(phase === "streaming", ACT_ANSWER, 46, () => setPhase("proposed"));
  const showAnswer = phase === "streaming" || phase === "proposed" || phase === "confirming" || phase === "done";
  const showActions = phase === "proposed" || phase === "confirming" || phase === "done";
  const isDone = phase === "done";

  const aiPanel = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {AI_HEADER}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3">
        {phase === "typing" && (
          <p className="py-6 text-center text-[11px] text-muted-foreground">Ask your workspace to do anything…</p>
        )}
        {phase !== "typing" && (
          <div className="flex justify-end animate-fade-up">
            <div className="max-w-[92%] rounded-lg rounded-br-sm bg-foreground px-3 py-2 text-[11px] leading-snug text-background">
              {ACT_PROMPT}
            </div>
          </div>
        )}
        {phase !== "typing" && (
        <div className="flex gap-2 animate-fade-up">
          <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <IconSparkles className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 max-w-[calc(100%-2rem)] flex-1 rounded-lg rounded-bl-sm border border-border bg-muted px-3 py-2.5 text-[11px] leading-[1.55] text-foreground">
            {phase === "thinking" && (
              <span className="inline-flex items-center py-0.5">
                <TypingIndicator />
              </span>
            )}
            {showAnswer && (
              <span className="whitespace-pre-line">
                {answer}
                {phase === "streaming" && <Caret />}
              </span>
            )}
            {showActions && (
              <div className="mt-2.5 space-y-1.5">
                {ACT_ACTIONS.map((a) => (
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
                    <span className="rounded-md bg-brand px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm ring-2 ring-brand/30">Confirm</span>
                    <span className="rounded-md border border-border px-2.5 py-1 text-[10px] text-muted-foreground">Dismiss</span>
                    <span className="ml-auto text-[9px] text-muted-foreground">Needs your OK</span>
                  </div>
                )}
                {phase === "confirming" && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-brand/80 px-2.5 py-1 text-[10px] font-semibold text-white">
                    <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-white/40 border-t-white" />
                    Running…
                  </span>
                )}
                {isDone && <p className="pt-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">✓ Confirmed by you · 3 actions done</p>}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
      <div className="flex-shrink-0 border-t border-border p-2.5">
        <div
          className={`rounded-lg border px-3 py-2 text-[11px] transition-colors ${
            phase === "typing" ? "border-brand/40 bg-background text-foreground" : "border-border bg-muted/50 text-muted-foreground"
          }`}
        >
          {phase === "typing" ? (
            <>
              {typed}
              <Caret />
            </>
          ) : (
            "Ask your workspace to do anything…"
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ShowcaseShell activeNav="channels" aiPanel={aiPanel} aiActive heightClass="h-[min(480px,74vh)] sm:h-[480px]">
      <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2 sm:px-4">
        <p className="flex items-center gap-1 truncate text-sm font-medium text-foreground">
          <IconHash className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> engineering
        </p>
        <span className="rounded-md border border-brand/50 bg-brand/[0.08] px-2 py-1 text-[11px] font-medium text-brand shadow-sm">Ask AI</span>
      </header>
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden p-3 sm:p-4">
        {CTX_POSTS.map((p) => (
          <article key={p.author} className="flex gap-2.5">
            <span className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-[10px] font-semibold sm:h-9 sm:w-9 ${p.tint}`}>{p.initials}</span>
            <div className="min-w-0">
              <p className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-foreground">{p.author}</span>
                <span className="text-[10px] text-muted-foreground">{p.time}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{p.text}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="flex-shrink-0 border-t border-border p-2.5 sm:p-3">
        <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">Message #engineering…</div>
      </div>
    </ShowcaseShell>
  );
}

// ===========================================================================
// Scene 3 - Answers from everything, cited (workspace + connected apps)
// ===========================================================================

const ASK_PROMPT = "What did we promise customers about refund timing?";
const ASK_ANSWER = `The refund SLA is 5 business days (updated last week). Support communicates this and the policy doc matches.`;
const ASK_SOURCES = [
  { tag: "#support", tint: "text-emerald-600 dark:text-emerald-400", note: "“we tell customers 5 business days” - Priya" },
  { tag: "Refund Policy", tint: "text-sky-600 dark:text-sky-400", note: "doc · §3 Refunds" },
  { tag: "Gmail", tint: "text-rose-600 dark:text-rose-400", note: "“Re: Refund SLA” thread" },
];

export function KnowledgeScene({ reduced, onDone }: SceneProps) {
  const [phase, setPhase] = useState<"typing" | "thinking" | "streaming" | "sources" | "done">(
    reduced ? "done" : "typing",
  );
  const [typed, setTyped] = useState("");

  useHoldThenDone(!reduced && phase === "done", onDone);

  useEffect(() => {
    if (reduced || phase !== "typing") return;
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(ASK_PROMPT.length, i + 2);
      setTyped(ASK_PROMPT.slice(0, i));
      if (i >= ASK_PROMPT.length) {
        clearInterval(id);
        setTimeout(() => {
          setTyped("");
          setPhase("thinking");
        }, 300);
      }
    }, 40);
    return () => clearInterval(id);
  }, [phase, reduced]);

  useEffect(() => {
    if (reduced) return;
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("streaming"), 1300);
      return () => clearTimeout(t);
    }
    if (phase === "sources") {
      const t = setTimeout(() => setPhase("done"), 700);
      return () => clearTimeout(t);
    }
  }, [phase, reduced]);

  const answer = useStream(phase === "streaming", ASK_ANSWER, 46, () => setPhase("sources"));
  const showAnswer = phase === "streaming" || phase === "sources" || phase === "done";
  const showSources = phase === "sources" || phase === "done";

  const aiPanel = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {AI_HEADER}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3">
        {phase === "typing" && (
          <p className="py-6 text-center text-[11px] text-muted-foreground">Ask your workspace anything…</p>
        )}
        {phase !== "typing" && (
          <div className="flex justify-end animate-fade-up">
            <div className="max-w-[92%] rounded-lg rounded-br-sm bg-foreground px-3 py-2 text-[11px] leading-snug text-background">{ASK_PROMPT}</div>
          </div>
        )}
        {phase !== "typing" && (
        <div className="flex gap-2 animate-fade-up">
          <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <IconSparkles className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 max-w-[calc(100%-2rem)] flex-1 rounded-lg rounded-bl-sm border border-border bg-muted px-3 py-2.5 text-[11px] leading-[1.55] text-foreground">
            {phase === "thinking" && (
              <span className="inline-flex items-center py-0.5">
                <TypingIndicator />
              </span>
            )}
            {showAnswer && (
              <span>
                {answer}
                {phase === "streaming" && <Caret />}
              </span>
            )}
            {showSources && (
              <div className="mt-2.5 border-t border-border/70 pt-2">
                <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Sources · permission-scoped</p>
                <div className="space-y-1">
                  {ASK_SOURCES.map((s) => (
                    <div key={s.tag} className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1">
                      <span className={`text-[10px] font-semibold ${s.tint}`}>{s.tag}</span>
                      <span className="min-w-0 flex-1 truncate text-[9px] text-muted-foreground">{s.note}</span>
                      <span className="flex-shrink-0 text-[9px] text-brand">open</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
      <div className="flex-shrink-0 border-t border-border p-2.5">
        <div
          className={`rounded-lg border px-3 py-2 text-[11px] transition-colors ${
            phase === "typing" ? "border-brand/40 bg-background text-foreground" : "border-border bg-muted/50 text-muted-foreground"
          }`}
        >
          {phase === "typing" ? (
            <>
              {typed}
              <Caret />
            </>
          ) : (
            "Ask your workspace anything…"
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ShowcaseShell activeNav="channels" aiPanel={aiPanel} aiActive heightClass="h-[min(480px,74vh)] sm:h-[480px]">
      <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2 sm:px-4">
        <p className="flex items-center gap-1 truncate text-sm font-medium text-foreground">
          <IconHash className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> support
        </p>
        <span className="rounded-md border border-brand/50 bg-brand/[0.08] px-2 py-1 text-[11px] font-medium text-brand shadow-sm">Ask AI</span>
      </header>
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-hidden p-3 sm:p-4">
        <article className="flex gap-2.5">
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-emerald-500/15 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 sm:h-9 sm:w-9">PN</span>
          <div className="min-w-0">
            <p className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-foreground">Priya Nair</span>
              <span className="text-[10px] text-muted-foreground">Tue</span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">We tell customers refunds land in 5 business days.</p>
          </div>
        </article>
        <article className="flex gap-2.5">
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-sky-500/15 text-[10px] font-semibold text-sky-700 dark:text-sky-300 sm:h-9 sm:w-9">DC</span>
          <div className="min-w-0">
            <p className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-foreground">Daniel Cho</span>
              <span className="text-[10px] text-muted-foreground">Wed</span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">Wasn’t it 7 in the old policy? Someone confirm.</p>
          </div>
        </article>
      </div>
      <div className="flex-shrink-0 border-t border-border p-2.5 sm:p-3">
        <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">Message #support…</div>
      </div>
    </ShowcaseShell>
  );
}

// ===========================================================================
// Scene 4 - Hand it real work, and trust it to finish (durable task hand-off)
//   Assign a task to an AI teammate and walk away: it posts ONE evolving status
//   comment ("On it" -> live "Working… (used: …)") with the tools it is using,
//   SURVIVES a mid-run server restart and resumes the same work, then delivers
//   the result and moves the task forward - while juggling other tasks too.
// ===========================================================================

const HANDOFF_TOOLS = ["search_workspace", "read_recent_changes", "create_task", "schedule"] as const;

const HANDOFF_RESULT_LEAD = "Done - here's what I shipped for v2.4:";
const HANDOFF_DID = [
  { detail: "Drafted release notes from 18 merged PRs", meta: "doc created" },
  { detail: "Filed “Run the rollback drill”", meta: "→ @Daniel" },
  { detail: "Scheduled “Promote to prod”", meta: "tomorrow 9:00 AM" },
];

type HandoffPhase = "assign" | "onit" | "work1" | "work2" | "resume" | "result" | "wrap" | "done";

function ToolChip({ label, live = false }: { label: string; live?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[9px] font-medium transition-colors ${
        live
          ? "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-300"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      }`}
    >
      {live ? <span className="h-1 w-1 animate-pulse rounded-full bg-violet-500" /> : <span className="text-[8px]">✓</span>}
      {label}
    </span>
  );
}

export function HandoffScene({ reduced, onDone }: SceneProps) {
  const [phase, setPhase] = useState<HandoffPhase>(reduced ? "done" : "assign");

  useTimeline(!reduced, [
    { at: 900, run: () => setPhase("onit") },
    { at: 2200, run: () => setPhase("work1") },
    { at: 3500, run: () => setPhase("work2") },
    { at: 4900, run: () => setPhase("resume") },
    { at: 6100, run: () => setPhase("result") },
  ]);

  const resultText = useStream(phase === "result", HANDOFF_RESULT_LEAD, 40, () => setPhase("wrap"));

  useEffect(() => {
    if (reduced || phase !== "wrap") return;
    const t = setTimeout(() => setPhase("done"), 700);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  useHoldThenDone(!reduced && phase === "done", onDone);

  const reached = (p: HandoffPhase) => {
    const order: HandoffPhase[] = ["assign", "onit", "work1", "work2", "resume", "result", "wrap", "done"];
    return order.indexOf(phase) >= order.indexOf(p);
  };

  const status =
    phase === "assign"
      ? { label: "To do", cls: "border-border bg-muted/60 text-muted-foreground" }
      : reached("wrap")
      ? { label: "In review", cls: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" }
      : { label: "In progress", cls: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400" };

  const showComment = reached("onit");
  const working = phase === "work1" || phase === "work2" || phase === "resume";
  const liveTools = phase === "work1" ? HANDOFF_TOOLS.slice(0, 1) : working ? HANDOFF_TOOLS.slice(0, 3) : [];
  const showResult = reached("result");
  const showDid = reached("wrap");
  const isDone = phase === "done";

  return (
    <ShowcaseShell activeNav="tasks" path="/app/task/v2-4-release" heightClass="h-[min(480px,74vh)] sm:h-[480px]">
      {/* Task header: title, durable status, multitasking hint */}
      <header className="flex flex-shrink-0 items-start justify-between gap-2 border-b border-border/60 px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">Draft v2.4 release notes &amp; file the follow-ups</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={`rounded border px-1.5 py-px font-medium transition-colors duration-500 ${status.cls}`}>{status.label}</span>
            <span aria-hidden>·</span>
            <span className="truncate">#engineering</span>
          </p>
        </div>
        <span className="flex-shrink-0 rounded-md border border-violet-500/30 bg-violet-500/[0.07] px-2 py-1 text-[10px] font-medium text-violet-600 dark:text-violet-400">
          ⚡ Durable · survives restarts
        </span>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 sm:p-4">
        {/* Assignee row: the AI teammate is the assignee, badged */}
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2">
          <span className="text-[11px] font-medium text-muted-foreground">Assignee</span>
          <span className="flex items-center gap-1.5">
            <BotAvatar />
            <span className="text-xs font-semibold text-foreground">Release Captain</span>
            <AiBadge />
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">also on 2 other tasks</span>
        </div>

        {/* Activity: you handed the work off */}
        <p className="text-center text-[10px] text-muted-foreground animate-fade-up">
          You assigned this to <span className="font-medium text-foreground">Release Captain</span> · 9:39 PM
        </p>

        {/* The single evolving status comment */}
        {showComment && (
          <article className="flex gap-2.5 animate-fade-up">
            <BotAvatar />
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold text-foreground">Release Captain</span>
                <AiBadge />
                <span className="text-[10px] text-muted-foreground">now · updating live</span>
              </p>

              <div className="mt-1 rounded-lg rounded-tl-sm border border-border bg-muted/50 px-3 py-2.5">
                {/* On it / working header line */}
                {!showResult && (
                  <div className="flex items-center gap-2">
                    {working ? (
                      <span className="h-3 w-3 flex-shrink-0 animate-spin rounded-full border-[1.5px] border-violet-500/40 border-t-violet-500" />
                    ) : (
                      <span className="grid h-3.5 w-3.5 flex-shrink-0 place-items-center rounded-full bg-violet-500/15 text-[8px] text-violet-600 dark:text-violet-400">
                        <IconSparkles className="h-2 w-2" />
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-foreground">
                      {working ? "Working…" : "On it — I'll post back here when it's done."}
                    </span>
                  </div>
                )}

                {/* Live tool chips while working */}
                {working && liveTools.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <span className="text-[9px] text-muted-foreground">using</span>
                    {liveTools.map((t) => (
                      <ToolChip key={t} label={t} live />
                    ))}
                  </div>
                )}

                {/* Streamed result */}
                {showResult && (
                  <p className="text-[11px] font-medium leading-snug text-foreground">
                    {resultText}
                    {phase === "result" && <Caret />}
                  </p>
                )}

                {/* What it actually did */}
                {showDid && (
                  <div className="mt-2 space-y-1">
                    {HANDOFF_DID.map((d) => (
                      <div key={d.detail} className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/[0.06] px-2 py-1.5">
                        <span className="grid h-4 w-4 flex-shrink-0 place-items-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">✓</span>
                        <span className="min-w-0 flex-1 truncate text-[10px] text-foreground">{d.detail}</span>
                        <span className="flex-shrink-0 text-[9px] text-muted-foreground">{d.meta}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tools-used footer on completion */}
                {isDone && (
                  <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-border/70 pt-2">
                    <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Used</span>
                    {HANDOFF_TOOLS.map((t) => (
                      <ToolChip key={t} label={t} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        )}

        {/* The wow beat: it survived a restart and kept going */}
        {phase === "resume" && (
          <div className="pointer-events-none absolute inset-x-0 top-1.5 z-10 flex justify-center animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-[10px] font-medium text-amber-700 shadow-sm dark:text-amber-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              Server restarted — resumed exactly where it left off
            </span>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-border p-2.5 sm:p-3">
        <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">Comment on this task…</div>
      </div>
    </ShowcaseShell>
  );
}
