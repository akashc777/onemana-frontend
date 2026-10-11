"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { Icon } from "@/components/ui/icons";

/**
 * The launch film, loaded from YouTube only when somebody asks to play it
 * (site.md V1). The film sits in a window at r14 and e4, as product imagery
 * does: it used to sit in a grey padded box with a bordered box inside it, a
 * window in a window (design/site-polish/AUDIT.md, P11).
 */
export function HeroProductVideo({ className = "" }: { className?: string }) {
  const [playing, setPlaying] = useState(false);
  const id = site.demoVideoId;

  return (
    <div className={`w-full ${className}`}>
      {/* The night tokens (globals.css .night): the film's own dark frame
          while the poster loads, and a dark control chip on it in both themes. */}
      <div className="night relative aspect-video overflow-hidden rounded-[14px] shadow-e4">
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
              width={1920}
              height={1080}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Bottom-left, not centred: a centred button sat on the film's
                wordmark. A chip on the pop surface at e3, with the play glyph
                on a brand disc that grows a little under the pointer. */}
            <span className="absolute bottom-3 left-3 inline-flex h-11 items-center gap-2.5 rounded-full bg-pop py-1.5 pl-1.5 pr-4 text-small font-[510] text-foreground shadow-e3 sm:bottom-5 sm:left-5">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand text-brand-foreground transition-transform duration-hover ease-out group-hover:scale-[1.06]">
                <Icon name="play" size={14} />
              </span>
              Watch the film
              <span className="font-normal tabular-nums text-muted-foreground">1:32</span>
            </span>
          </button>
        )}
      </div>
      <p className="mt-3 text-caption text-muted-foreground">92 seconds. The product screens are recorded in the live demo.</p>
    </div>
  );
}
