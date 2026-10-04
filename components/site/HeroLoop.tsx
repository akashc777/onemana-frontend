"use client";

/**
 * HeroLoop: the headline, acted out. One OneCamp window holding chat, docs,
 * tasks and a call, where a conversation turns into tasks through an agent.
 *
 * WHY THIS AND NOT A SCREENSHOT. The full product screen sits right under the
 * hero; repeating it here would be the same picture twice. This is the claim in
 * motion instead: four things in one window (the headline), and an AI agent
 * doing a useful thing when asked (the sentence under it), in twelve seconds a
 * newcomer can follow without reading a word of jargon.
 *
 * Pure CSS (globals.css, the hl- classes): no animation library, nothing on the
 * critical path. One timeline, every element keyed to it, so the story always
 * plays in order. Paused while scrolled away. Reduced motion shows the finished
 * frame. Decorative to assistive tech, which gets one sentence instead.
 */

import { useEffect, useRef } from "react";

function PaneHeader({ icon, title, meta }: { icon: React.ReactNode; title: string; meta: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-border/70 px-2.5 py-1.5">
      <span className="text-foreground/50">{icon}</span>
      <span className="text-[10px] font-semibold text-foreground/80">{title}</span>
      <span className="ml-auto text-[9px] text-foreground/40">{meta}</span>
    </div>
  );
}

const icon = {
  chat: (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" strokeLinejoin="round" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 2h5.5L12 4.5V14H4z M6 7h4 M6 9.5h4" strokeLinejoin="round" />
    </svg>
  ),
  tasks: (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M3 4.5l1.5 1.5L7 3.5 M3 10.5l1.5 1.5L7 9.5 M9 5h4 M9 11h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  call: (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M2.5 4.5h7.5v7H2.5z M10 7l3.5-2v6L10 9" strokeLinejoin="round" />
    </svg>
  ),
};

function Person({ initials, tint }: { initials: string; tint: string }) {
  return (
    <span className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-full text-[8px] font-semibold ${tint}`}>
      {initials}
    </span>
  );
}

/** The agent as the product draws it: rounded square, its own colour, a sparkle. */
function AgentMark() {
  return (
    <span className="relative grid h-5 w-5 flex-shrink-0 place-items-center rounded-[28%] bg-agent-muted text-[8px] font-semibold text-agent ring-1 ring-agent/30">
      RC
      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-agent ring-1 ring-card" />
    </span>
  );
}

function Task({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`rounded-md border border-border bg-card px-1.5 py-1 text-[9px] leading-tight text-foreground/80 shadow-sm ${className}`}>
      {text}
    </div>
  );
}

export function HeroLoop() {
  const ref = useRef<HTMLElement | null>(null);

  // Off screen, the loop stops: twelve seconds of work nobody is watching is
  // battery on a laptop for nothing.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.removeAttribute("data-paused");
      else el.setAttribute("data-paused", "");
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure
      ref={ref}
      role="img"
      aria-label="One OneCamp window with chat, a doc, tasks and a video call. In the chat, Priya asks the AI agent to file the tasks; three tasks appear, and one is ticked off."
      className="hero-loop relative m-0 select-none"
    >
      <div aria-hidden className="hl-stage overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_60px_-28px_rgb(var(--foreground)/0.35)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-foreground/15" />
            <span className="h-2 w-2 rounded-full bg-foreground/15" />
            <span className="h-2 w-2 rounded-full bg-foreground/15" />
          </span>
          <span className="text-[10px] font-medium text-foreground/60">Acme Inc · OneCamp</span>
          <span className="ml-auto flex items-center gap-1 text-[9px] text-foreground/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 4 online
          </span>
        </div>

        <div className="relative grid grid-cols-2 gap-2 bg-muted/20 p-2">
          {/* Chat */}
          <section className="h-[152px] overflow-hidden rounded-lg border border-border/70 bg-background">
            <PaneHeader icon={icon.chat} title="#launch" meta="Chat" />
            <div className="space-y-1.5 p-2">
              <div className="hl-msg1 flex items-start gap-1.5">
                <Person initials="MA" tint="bg-amber-500/15 text-amber-700 dark:text-amber-300" />
                <p className="m-0 text-[9.5px] leading-snug text-foreground/80"><b className="font-semibold">Maya</b> Can we ship on Tuesday?</p>
              </div>
              <div className="hl-msg2 flex items-start gap-1.5">
                <Person initials="PN" tint="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" />
                <p className="m-0 text-[9.5px] leading-snug text-foreground/80"><b className="font-semibold">Priya</b> Yes. Agent, file the tasks.</p>
              </div>
              <div className="hl-msg3 flex items-start gap-1.5">
                <AgentMark />
                <p className="m-0 text-[9.5px] leading-snug text-foreground/80">
                  <b className="font-semibold">Release Captain</b>{" "}
                  <span className="rounded-sm bg-agent-muted px-1 text-[7.5px] font-bold uppercase tracking-wide text-agent">Agent</span>
                  <br />
                  Filed 3 tasks for Tuesday.
                </p>
              </div>
            </div>
          </section>

          {/* Doc */}
          <section className="h-[152px] overflow-hidden rounded-lg border border-border/70 bg-background">
            <PaneHeader icon={icon.doc} title="Launch plan" meta="Docs" />
            <div className="relative space-y-2 p-2.5">
              <div className="h-2 w-2/3 rounded-sm bg-foreground/70" />
              <div className="hl-line hl-line1 h-1.5 rounded-sm bg-foreground/15" />
              <div className="hl-line hl-line2 h-1.5 rounded-sm bg-foreground/15" />
              <div className="hl-line hl-line3 h-1.5 rounded-sm bg-foreground/15" />
              <div className="hl-line hl-line4 h-1.5 rounded-sm bg-foreground/15" />
              <span className="hl-cursor absolute flex items-start">
                <span className="h-3 w-[2px] bg-sky-500" />
                <span className="-mt-2.5 ml-0.5 rounded-sm bg-sky-500 px-1 text-[7.5px] font-semibold text-white">Daniel</span>
              </span>
            </div>
          </section>

          {/* Tasks */}
          <section className="h-[152px] overflow-hidden rounded-lg border border-border/70 bg-background">
            <PaneHeader icon={icon.tasks} title="Launch" meta="Tasks" />
            <div className="grid grid-cols-2 gap-1.5 p-2">
              <div className="space-y-1">
                <p className="m-0 text-[8px] font-semibold uppercase tracking-wide text-foreground/40">To do</p>
                <Task text="Release notes" className="hl-task hl-task1" />
                <Task text="Rollback drill" className="hl-task hl-task2" />
                <Task text="New sandbox key" className="hl-task hl-task3" />
              </div>
              <div className="space-y-1">
                <p className="m-0 text-[8px] font-semibold uppercase tracking-wide text-foreground/40">Done</p>
                <div className="hl-done relative rounded-md border border-emerald-500/30 bg-emerald-500/5 px-1.5 py-1 text-[9px] leading-tight text-foreground/80">
                  Release notes
                  <span className="absolute right-1 top-1 grid h-3 w-3 place-items-center rounded-full bg-emerald-500 text-[7px] text-white">✓</span>
                </div>
              </div>
            </div>
          </section>

          {/* Call */}
          <section className="h-[152px] overflow-hidden rounded-lg border border-border/70 bg-background">
            <PaneHeader icon={icon.call} title="Launch sync" meta="Call · 2:14" />
            <div className="relative grid grid-cols-2 gap-1.5 p-2">
              {[
                ["MA", "from-amber-500/25 to-amber-500/5"],
                ["PN", "from-emerald-500/25 to-emerald-500/5"],
                ["DA", "from-sky-500/25 to-sky-500/5"],
                ["AK", "from-rose-500/25 to-rose-500/5"],
              ].map(([who, g], i) => (
                <div key={who} className={`relative grid h-[46px] place-items-center rounded-md bg-gradient-to-br ${g} ${i === 1 ? "hl-speak" : ""}`}>
                  <span className="text-[9px] font-semibold text-foreground/60">{who}</span>
                </div>
              ))}
              <span className="hl-notes absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-agent-muted px-2 py-0.5 text-[8.5px] font-semibold text-agent ring-1 ring-agent/30">
                ✦ AI notes ready
              </span>
            </div>
          </section>

          {/* The agent's work travelling from the conversation to the board. */}
          <span className="hl-spark pointer-events-none absolute left-[18%] top-[104px] h-2.5 w-2.5 rounded-full bg-agent shadow-[0_0_0_4px_rgb(var(--agent)/0.18)]" />
        </div>
      </div>
    </figure>
  );
}

export default HeroLoop;
