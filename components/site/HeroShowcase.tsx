"use client";

import { useEffect, useRef, useState } from "react";
import { ShowcaseShell } from "@/components/site/showcase/ShowcaseShell";
import { IconSparkles } from "@/components/site/showcase/ShowcaseIcons";
import { TypingIndicator } from "@/components/site/TypingIndicator";

interface Post {
  author: string;
  initials: string;
  color: string;
  text: string;
  time: string;
  reaction?: string;
}

const POSTS: Post[] = [
  {
    author: "Priya Nair",
    initials: "PN",
    color: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    text: "Shipped the new checkout flow to staging. Latency is down 40% on the payment path.",
    time: "9:41 AM",
    reaction: "🎉",
  },
  {
    author: "Daniel Cho",
    initials: "DC",
    color: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    text: "Reviewing now. The deploy looks clean — nice work on the rollback guardrails.",
    time: "9:42 AM",
  },
  {
    author: "Aisha Khan",
    initials: "AK",
    color: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    text: "Can we get a recap for the folks in APAC? I missed the morning thread.",
    time: "9:43 AM",
  },
];

const USER_PROMPT = "Summarize #engineering today";

const AI_ANSWER = `Here's today's #engineering recap:

• Priya shipped checkout to staging (latency down 40%)
• Daniel is reviewing the deploy
• Aisha asked for an APAC recap

2 tasks closed today.`;

const SOURCES = [
  { label: "Post", ctx: "#engineering" },
  { label: "Message", ctx: "Daniel Cho" },
  { label: "Task", ctx: "Checkout v2" },
];

type DemoPhase = "channel" | "cue" | "typing" | "sent" | "thinking" | "streaming" | "done";

const POST_GAP_MS = 2400;
const CUE_MS = 1600;
const TYPE_MS = 2000;
const THINK_MS = 1500;
const HOLD_MS = 5500;

/** Hero product preview — channel posts + AI Assistant panel, aligned with OneCamp FE. */
export function HeroShowcase({ className = "" }: { className?: string }) {
  const [visiblePosts, setVisiblePosts] = useState(1);
  const [cycle, setCycle] = useState(0);
  const [phase, setPhase] = useState<DemoPhase>("channel");
  const [inputText, setInputText] = useState("");
  const [aiText, setAiText] = useState("");
  const [showSources, setShowSources] = useState(false);
  const reduce = useRef(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reduce.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setVisiblePosts(POSTS.length);
      setPhase("done");
      setInputText("");
      setAiText(AI_ANSWER);
      setShowSources(true);
    }
  }, []);

  /* Channel: reveal posts one at a time (only rendered posts take space). */
  useEffect(() => {
    if (reduce.current || phase !== "channel") return;
    if (visiblePosts >= POSTS.length) return;

    const t = setTimeout(() => setVisiblePosts((n) => n + 1), POST_GAP_MS);
    return () => clearTimeout(t);
  }, [visiblePosts, phase, cycle]);

  /* After last post lands, start the AI sequence. */
  useEffect(() => {
    if (reduce.current || visiblePosts < POSTS.length || phase !== "channel") return;

    const t = setTimeout(() => setPhase("cue"), CUE_MS);
    return () => clearTimeout(t);
  }, [visiblePosts, phase, cycle]);

  /* cue → typing → sent → thinking → streaming */
  useEffect(() => {
    if (reduce.current) return;
    if (phase === "cue") {
      const t = setTimeout(() => setPhase("typing"), 900);
      return () => clearTimeout(t);
    }
    if (phase === "sent") {
      const t = setTimeout(() => setPhase("thinking"), 400);
      return () => clearTimeout(t);
    }
    if (phase === "thinking") {
      const t = setTimeout(() => setPhase("streaming"), THINK_MS);
      return () => clearTimeout(t);
    }
    if (phase === "done") {
      const t = setTimeout(() => {
        setVisiblePosts(1);
        setPhase("channel");
        setInputText("");
        setAiText("");
        setShowSources(false);
        setCycle((c) => c + 1);
      }, HOLD_MS);
      return () => clearTimeout(t);
    }
  }, [phase, cycle]);

  /* Type prompt into the input field before send. */
  useEffect(() => {
    if (reduce.current || phase !== "typing") return;

    let i = 0;
    const step = Math.max(1, Math.ceil(USER_PROMPT.length / (TYPE_MS / 55)));
    const id = setInterval(() => {
      i = Math.min(USER_PROMPT.length, i + step);
      setInputText(USER_PROMPT.slice(0, i));
      if (i >= USER_PROMPT.length) {
        clearInterval(id);
        setInputText("");
        setPhase("sent");
      }
    }, 55);
    return () => clearInterval(id);
  }, [phase, cycle]);

  /* Stream AI reply word-by-word after thinking. */
  useEffect(() => {
    if (reduce.current || phase !== "streaming") return;

    const words = AI_ANSWER.split(/(\s+)/);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setAiText(words.slice(0, i).join(""));
      if (i >= words.length) {
        clearInterval(id);
        setShowSources(true);
        setPhase("done");
      }
    }, 48);
    return () => clearInterval(id);
  }, [phase, cycle]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [phase, inputText, aiText, showSources]);

  const aiActive = phase !== "channel";
  const showUserBubble = phase === "sent" || phase === "thinking" || phase === "streaming" || phase === "done";
  const showAssistant = phase === "thinking" || phase === "streaming" || phase === "done";
  const isThinking = phase === "thinking";
  const isStreaming = phase === "streaming";
  const highlightCatchMeUp = phase === "cue";

  const aiPanel = (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-border/60 bg-card/40 px-3">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <IconSparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold text-foreground">AI Assistant</span>
        </div>
      </div>

      <div ref={chatRef} className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3">
        {!aiActive && (
          <p className="py-6 text-center text-[11px] text-muted-foreground">Ask your workspace anything…</p>
        )}

        {showUserBubble && (
          <div className="flex justify-end animate-fade-up">
            <div className="max-w-[92%] rounded-lg rounded-br-sm bg-foreground px-3 py-2 text-[11px] leading-snug text-background">
              {USER_PROMPT}
            </div>
          </div>
        )}

        {showAssistant && (
          <div className="flex gap-2 animate-fade-up">
            <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <IconSparkles className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 max-w-[calc(100%-2rem)] flex-1 rounded-lg rounded-bl-sm border border-border bg-muted px-3 py-2.5 text-[11px] leading-[1.55] text-foreground">
              {isThinking && (
                <span className="inline-flex items-center py-0.5">
                  <TypingIndicator />
                </span>
              )}
              {(isStreaming || phase === "done") && (
                <span className="whitespace-pre-line">
                  {aiText}
                  {isStreaming && (
                    <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-brand align-middle" />
                  )}
                </span>
              )}
              {showSources && (
                <div className="mt-2.5 border-t border-border/70 pt-2">
                  <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Sources</p>
                  <div className="space-y-1">
                    {SOURCES.map((s) => (
                      <div key={s.ctx} className="flex items-center gap-1.5 text-[10px]">
                        <span className="font-medium text-foreground">{s.label}</span>
                        <span className="truncate text-muted-foreground">{s.ctx}</span>
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
            phase === "typing"
              ? "border-brand/40 bg-background text-foreground"
              : "border-border bg-muted/50 text-muted-foreground"
          }`}
        >
          {phase === "typing" ? (
            <>
              {inputText}
              <span className="ml-px inline-block h-3.5 w-0.5 animate-pulse bg-brand align-middle" />
            </>
          ) : (
            "Ask your workspace anything…"
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={className}>
      <ShowcaseShell
        activeNav="channels"
        aiPanel={aiPanel}
        aiActive={aiActive}
        heightClass="h-[min(480px,74vh)] sm:h-[480px]"
      >
        <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2 sm:px-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground"># engineering</p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>12 members</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <span className="status-pulse h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                3 online
              </span>
            </p>
          </div>
          <span
            className={`flex-shrink-0 rounded-md border px-2 py-1 text-[11px] font-medium transition-all duration-300 ${
              highlightCatchMeUp
                ? "border-brand/50 bg-brand/[0.08] text-brand shadow-sm"
                : "border-border bg-muted/60 text-foreground"
            }`}
          >
            Catch me up
          </span>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="absolute inset-0 flex flex-col justify-end gap-3 overflow-hidden p-3 sm:gap-3.5 sm:p-4">
            {POSTS.slice(0, visiblePosts).map((post, i) => (
              <article
                key={`${post.author}-${cycle}`}
                className="flex gap-2.5 animate-fade-up sm:gap-3"
                style={{ animationDelay: i === visiblePosts - 1 ? "0ms" : undefined }}
              >
                <span
                  className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-[10px] font-semibold sm:h-9 sm:w-9 ${post.color}`}
                >
                  {post.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                    <span className="text-xs font-semibold text-foreground">{post.author}</span>
                    <span className="text-[10px] text-muted-foreground">{post.time}</span>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">{post.text}</p>
                  {post.reaction && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                      {post.reaction} <span className="text-foreground">4</span>
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-border p-2.5 sm:p-3">
          <div className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Message #engineering…
          </div>
        </div>
      </ShowcaseShell>
    </div>
  );
}