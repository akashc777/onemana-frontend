"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/** GitHub uses amber/gold for the star icon in repo badges - not foreground gray. */
function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${className}`} fill="currentColor" aria-hidden>
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `${n}`;
}

export function GitHubStars({
  className = "",
  compact = false,
  stars: starsProp,
}: {
  className?: string;
  compact?: boolean;
  stars?: number | null;
}) {
  const [stars, setStars] = useState<number | null>(starsProp ?? null);

  useEffect(() => {
    if (starsProp !== undefined && starsProp !== null) {
      setStars(starsProp);
      return;
    }
    if (starsProp === null) return;
    let alive = true;
    fetch(`https://api.github.com/repos/${site.githubRepo}`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && typeof d.stargazers_count === "number") setStars(d.stargazers_count);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [starsProp]);

  return (
    <a
      href={site.githubUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`Star ${site.githubRepo} on GitHub${stars !== null ? ` - ${stars} stars` : ""}`}
      className={`inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted ${className}`}
    >
      <GitHubMark />
      {!compact && <span>Star</span>}
      <span className="flex items-center gap-1 rounded-md border border-border/80 bg-muted/50 px-1.5 py-0.5 text-xs">
        <StarIcon className="text-[#E3B341]" />
        <span className="tabular-nums font-medium text-foreground">{stars !== null ? formatStars(stars) : "-"}</span>
      </span>
    </a>
  );
}