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
// Scene 1 — AI teammates you @mention (in-channel, badged, replies in-thread)
// ===========================================================================

const MENTION_PROMPT = "@Release Captain are we clear to ship v2.4 tonight?";
const MENTION_REPLY = `Checked the v2.4 release checklist:
✓ Migrations applied on staging
✓ Payment latency down 40%
⚠ Rollback drill still open — owner @Daniel

I'd hold for Daniel's sign-off, then ship. Want me to remind him?`;

export function MentionAgentScene({ reduced, onDone }: SceneProps) {
  const [phase, setPhase] = useState<"context" | "typing" | "sent" | "thinking" | "reply" | "approve" | "done">(
    reduced ? "done" : "context",
  );
  const [typed, setTyped] = useState("");

  useTimeline(!reduced, [
    { at: 1500, run: () => setPhase("typing") },
    { at: 7200, run: () => onDone() },
  ]);

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
// Scene 2 — Ask AI to do the work: recap + propose tasks, run only on confirm
// ===========================================================================

const CTX_POSTS = [
  { initials: "PN", tint: "bg-rose-500/15 text-rose-700 dark:text-rose-300", author: "Priya Nair", time: "9:41 AM", text: "Shipped checkout to staging. Payment latency down 40%." },
  { initials: "DC", tint: "bg-sky-500/15 text-sky-700 dark:text-sky-300", author: "Daniel Cho", time: "9:42 AM", text: "I'll run the rollback drill before we promote to prod." },
  { initials: "AK", tint: "bg-violet-500/15 text-violet-700 dark:text-violet-300", author: "Aisha Khan", time: "9:43 AM", text: "Can someone post an APAC recap? I missed the morning thread." },
];

const ACT_PROMPT = "Recap today and turn the follow-ups into tasks";
const ACT_ANSWER = `Today in #engineering:
• Checkout on staging, payment latency −40%
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

  useTimeline(!reduced, [{ at: 9000, run: () => onDone() }]);

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
        <div className="flex justify-end">
          <div className="max-w-[92%] rounded-lg rounded-br-sm bg-foreground px-3 py-2 text-[11px] leading-snug text-background">
            {ACT_PROMPT}
          </div>
        </div>
        <div className="flex gap-2">
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
// Scene 3 — Answers from everything, cited (workspace + connected apps)
// ===========================================================================

const ASK_PROMPT = "What did we promise customers about refund timing?";
const ASK_ANSWER = `The refund SLA is 5 business days (updated last week). Support communicates this and the policy doc matches.`;
const ASK_SOURCES = [
  { tag: "#support", tint: "text-emerald-600 dark:text-emerald-400", note: "“we tell customers 5 business days” — Priya" },
  { tag: "Refund Policy", tint: "text-sky-600 dark:text-sky-400", note: "doc · §3 Refunds" },
  { tag: "Gmail", tint: "text-rose-600 dark:text-rose-400", note: "“Re: Refund SLA” thread" },
];

export function KnowledgeScene({ reduced, onDone }: SceneProps) {
  const [phase, setPhase] = useState<"typing" | "thinking" | "streaming" | "sources" | "done">(
    reduced ? "done" : "typing",
  );
  const [typed, setTyped] = useState("");

  useTimeline(!reduced, [{ at: 8500, run: () => onDone() }]);

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
        <div className="flex justify-end">
          <div className="max-w-[92%] rounded-lg rounded-br-sm bg-foreground px-3 py-2 text-[11px] leading-snug text-background">{ASK_PROMPT}</div>
        </div>
        <div className="flex gap-2">
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
