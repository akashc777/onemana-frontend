"use client";

import { useState } from "react";
import { site } from "@/lib/site";

/** The launch film, loaded from YouTube only when somebody asks to play it. */
export function HeroProductVideo({ className = "" }: { className?: string }) {
  const [playing, setPlaying] = useState(false);
  const id = site.demoVideoId;

  return (
    <div className={`w-full ${className}`}>
      {/* On the same stage as the screenshots (ProductShot's Stage). */}
      <div className="rounded-lg border border-border bg-muted p-2 sm:p-3 lg:p-4">
      <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
        {playing ? (
          <iframe
            title="OneCamp launch film"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 text-left">
            {/* OUR OWN COVER, not YouTube's thumbnail: the film's reveal at 14.5 s,
                taken from the delivered 1080p file. Take it again if the film is recut. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/launch-film-cover.jpg"
              alt="OneCamp. Permissions, not promises. The opening of the launch film"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Bottom-left, not centred: a centred button sat on the film's
                wordmark. White on the film's dark frame, as a player's own
                control is: in the accent it was a second filled orange
                button in view beside "Try the live demo", and its "1:32"
                at 80% white on orange read at 3.5:1. */}
            <span className="absolute bottom-3 left-3 inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-small font-medium text-black/90 transition-colors group-hover:bg-white/90 sm:bottom-5 sm:left-5 sm:h-10">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
              Watch the film
              <span className="font-normal tabular-nums text-black/60">1:32</span>
            </span>
          </button>
        )}
      </div>
      </div>
      <p className="mt-3 text-caption text-muted-foreground">92 seconds. The product screens are recorded in the live demo.</p>
    </div>
  );
}
