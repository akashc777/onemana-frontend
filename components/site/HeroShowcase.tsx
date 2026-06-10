"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HeroShowcase renders a realistic, animated OneCamp workspace window modeled
 * on the real product: a live channel chat (messages slide in, a typing
 * indicator resolves into a reply) and the OneCamp AI Assistant panel that
 * streams a grounded answer with source citations — exactly like the app.
 * Pure CSS + light timers, fully responsive, reduced-motion aware.
 */

interface Msg {
  author: string;
  initials: string;
  color: string;
  text: string;
  time: string;
  reaction?: string;
}

const SCRIPT: Msg[] = [
  { author: "Priya Nair", initials: "PN", color: "from-rose-400 to-pink-500", text: "Shipped the new checkout flow to staging 🚀", time: "9:41", reaction: "🎉" },
  { author: "Daniel Cho", initials: "DC", color: "from-sky-400 to-cyan-500", text: "Nice! Reviewing now — the latency drop looks great.", time: "9:42" },
  { author: "Aisha Khan", initials: "AK", color: "from-violet-400 to-brand", text: "Can we get a recap for the folks in APAC?", time: "9:43" },
];

const AI_ANSWER =
  "Here's today in #engineering: Priya shipped the new checkout flow to staging, Daniel is reviewing it (latency is down), and Aisha asked for an APAC recap. Two tasks were closed.";

const SOURCES = [
  { label: "Post", ctx: "#engineering" },
  { label: "Message", ctx: "Daniel Cho" },
  { label: "Task", ctx: "Checkout v2" },
];

export function HeroShowcase({ className = "" }: { className?: string }) {
  const [visible, setVisible] = useState(1);
  const [typing, setTyping] = useState(false);
  const [aiText, setAiText] = useState("");
  const [showSources, setShowSources] = useState(false);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce.current) {
      setVisible(SCRIPT.length);
      setAiText(AI_ANSWER);
      setShowSources(true);
    }
  }, []);

  // Chat stream: reveal messages with a typing beat, then loop.
  useEffect(() => {
    if (reduce.current) return;
    let t: ReturnType<typeof setTimeout>;
    if (visible < SCRIPT.length) {
      setTyping(true);
      t = setTimeout(() => {
        setTyping(false);
        setVisible((v) => v + 1);
      }, 1600);
    } else {
      t = setTimeout(() => {
        setVisible(1);
        setAiText("");
        setShowSources(false);
      }, 6500);
    }
    return () => clearTimeout(t);
  }, [visible]);

  // AI Assistant typewriter once the conversation is in view.
  useEffect(() => {
    if (reduce.current || visible < SCRIPT.length) return;
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setAiText(AI_ANSWER.slice(0, i));
      if (i >= AI_ANSWER.length) {
        clearInterval(id);
        setShowSources(true);
      }
    }, 22);
    return () => clearInterval(id);
  }, [visible]);

  const streaming = aiText.length > 0 && aiText.length < AI_ANSWER.length;

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-canvas-raised shadow-2xl ${className}`}>
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rose-400/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        <div className="mx-auto flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          onecamp.acme.com
        </div>
      </div>

      <div className="flex h-[420px] text-left">
        {/* sidebar */}
        <aside className="hidden w-48 flex-shrink-0 flex-col border-r border-white/10 bg-white/[0.02] p-3 sm:flex">
          <div className="flex items-center gap-2 px-1 pb-3">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-brand to-accent-cyan text-xs font-bold text-white">A</span>
            <span className="text-sm font-semibold text-white">Acme Inc</span>
          </div>
          <p className="px-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Channels</p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {[
              { name: "general", active: false },
              { name: "engineering", active: true, badge: 3 },
              { name: "design", active: false },
              { name: "announcements", active: false },
            ].map((c) => (
              <li
                key={c.name}
                className={`flex items-center justify-between rounded-md px-2 py-1.5 ${
                  c.active ? "bg-brand/20 text-white" : "text-slate-400"
                }`}
              >
                <span className="truncate">
                  <span className="text-slate-500"># </span>
                  {c.name}
                </span>
                {c.badge && <span className="ml-1 rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">{c.badge}</span>}
              </li>
            ))}
          </ul>
          <p className="px-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Direct messages</p>
          <ul className="mt-1 space-y-0.5 text-sm text-slate-400">
            {[
              { n: "Priya Nair", on: true },
              { n: "Daniel Cho", on: true },
              { n: "Aisha Khan", on: false },
            ].map((d) => (
              <li key={d.n} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <span className="relative flex h-2 w-2">
                  {d.on && <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />}
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${d.on ? "bg-emerald-400" : "bg-slate-600"}`} />
                </span>
                <span className="truncate">{d.n}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* chat */}
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white"># engineering</p>
              <p className="text-xs text-slate-500">12 members · 3 online</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-lg border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand-light">✨ Catch me up</span>
              <span className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/5" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
              </span>
            </div>
          </header>

          <div className="flex flex-1 flex-col justify-end gap-3 overflow-hidden p-4">
            {SCRIPT.slice(0, visible).map((m, i) => (
              <div key={`${visible}-${i}`} className="flex animate-fade-up gap-2.5">
                <span className={`grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br ${m.color} text-[10px] font-bold text-white`}>
                  {m.initials}
                </span>
                <div className="min-w-0">
                  <p className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-white">{m.author}</span>
                    <span className="text-[10px] text-slate-500">{m.time}</span>
                  </p>
                  <div className="mt-1 inline-block rounded-2xl rounded-tl-sm bg-white/5 px-3 py-1.5 text-sm text-slate-200">
                    {m.text}
                  </div>
                  {m.reaction && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] text-slate-300">
                      {m.reaction} 4
                    </span>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-brand text-[10px] font-bold text-white">AK</span>
                <div className="flex gap-1 rounded-2xl bg-white/5 px-3 py-2.5">
                  <Dot delay="0ms" />
                  <Dot delay="150ms" />
                  <Dot delay="300ms" />
                </div>
              </div>
            )}
          </div>

          {/* composer */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-500">
              <span>Type a message…</span>
              <span className="ml-auto grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-brand to-accent-cyan text-[11px] text-white">✦</span>
            </div>
          </div>
        </section>

        {/* OneCamp AI Assistant panel — mirrors the real right panel */}
        <aside className="hidden w-72 flex-shrink-0 flex-col border-l border-white/10 bg-white/[0.02] lg:flex">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-brand/15 text-brand-light">✨</span>
            <span className="text-sm font-semibold text-white">AI Assistant</span>
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
            {/* user question */}
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-xl rounded-br-sm bg-brand px-3 py-2 text-xs leading-relaxed text-white">
                Summarize #engineering today
              </div>
            </div>
            {/* assistant answer */}
            <div className="flex gap-2">
              <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg bg-brand/15 text-brand-light">✨</span>
              <div className="min-w-0 rounded-xl rounded-bl-sm border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-slate-200">
                {aiText || <span className="text-slate-500">Thinking…</span>}
                {streaming && <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-brand-light align-middle" />}
                {showSources && (
                  <div className="mt-2.5 border-t border-white/10 pt-2">
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">Sources</p>
                    <div className="space-y-1">
                      {SOURCES.map((s) => (
                        <div key={s.ctx} className="flex items-center gap-1.5 text-[11px]">
                          <span className="grid h-3.5 w-3.5 place-items-center rounded bg-brand/20 text-[8px] text-brand-light">◆</span>
                          <span className="font-medium text-slate-300">{s.label}</span>
                          <span className="truncate text-slate-500">{s.ctx}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-500">
              Ask your workspace anything…
              <span className="ml-auto grid h-5 w-5 place-items-center rounded bg-brand text-[10px] text-white">↑</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: delay }} />;
}
