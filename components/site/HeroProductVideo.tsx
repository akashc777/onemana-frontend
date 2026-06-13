"use client";

import { useState } from "react";
import { site } from "@/lib/site";

/** Lazy-loaded YouTube product tour for the dedicated demo section. */
export function HeroProductVideo({ className = "" }: { className?: string }) {
  const [playing, setPlaying] = useState(false);
  const id = site.demoVideoId;

  if (playing) {
    return (
      <div className={`mx-auto w-full max-w-4xl ${className}`}>
        <div className="premium-frame overflow-hidden rounded-lg">
          <div className="premium-frame-ring" aria-hidden />
          <div className="premium-frame-accent h-px w-full" aria-hidden />
          <div className="relative aspect-video bg-black">
            <iframe
              title="OneCamp product tour"
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto w-full max-w-4xl ${className}`}>
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="group premium-frame tour-play-ring relative w-full overflow-hidden rounded-lg text-left transition hover:border-brand/25"
      >
        <div className="premium-frame-ring" aria-hidden />
        <div className="premium-frame-accent absolute inset-x-0 top-0 z-10 h-px" aria-hidden />
        <div className="relative aspect-video bg-muted/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
            onError={(e) => {
              e.currentTarget.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-md bg-brand text-white shadow-sm transition group-hover:bg-brand-dark sm:h-[4.5rem] sm:w-[4.5rem]">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-7 w-7 sm:h-8 sm:w-8" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </span>
          </div>
        </div>
      </button>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-center">
        {["Channels", "AI", "Docs", "Tasks", "Video", "Calendar"].map((topic) => (
          <span
            key={topic}
            className="rounded border border-border/70 bg-background px-2.5 py-1 text-[11px] text-muted-foreground"
          >
            {topic}
          </span>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Full product walkthrough · real app, no mockups</p>
    </div>
  );
}