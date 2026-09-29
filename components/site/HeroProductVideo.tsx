"use client";

import { useState } from "react";
import { site } from "@/lib/site";

/** The launch film, lazy-loaded from YouTube for the dedicated demo section. */
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
              title="OneCamp launch film"
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
          {/* OUR OWN COVER, not YouTube's thumbnail, which picks its own frame.
              This is the film's reveal (14.5 s): the wordmark and the line the
              film argues. Taken from the delivered 1080p file with ffmpeg; take
              it again if the film is recut. The play button sits in the gap
              between the wordmark and the line. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/launch-film-cover.jpg"
            alt="OneCamp. Permissions, not promises. The opening of the launch film"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* Bottom-left, not centred: a centred button sat on the film's
              wordmark. A labelled control also says what the click does. */}
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-md bg-brand py-2 pl-3 pr-3.5 text-sm font-medium text-white shadow-sm transition group-hover:bg-brand-dark sm:bottom-5 sm:left-5">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
            Watch the film
            <span className="font-normal tabular-nums text-white/80">1:32</span>
          </span>
        </div>
      </button>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-center">
        {["Agents", "Audit log", "Channels", "Docs", "Tasks", "Your server"].map((topic) => (
          <span
            key={topic}
            className="rounded border border-border/70 bg-background px-2.5 py-1 text-[11px] text-muted-foreground"
          >
            {topic}
          </span>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">92 seconds. The product screens are recorded in the live demo.</p>
    </div>
  );
}