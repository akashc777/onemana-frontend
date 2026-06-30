import type { ReactNode } from "react";

/** Cloudflare-style hero atmosphere: line grid + top orange beam. */
export function HeroAmbient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="cf-orange-beam absolute inset-0" />
      <div
        className="cf-line-grid absolute inset-0 opacity-[0.5] dark:opacity-[0.28] [mask-image:linear-gradient(to_bottom,black_0%,black_45%,transparent_88%)]"
      />
      <div
        className="absolute inset-x-0 top-[42%] h-px opacity-[0.35] dark:opacity-[0.2]"
        style={{
          background: "linear-gradient(90deg, transparent, rgb(var(--border)), transparent)",
        }}
      />
    </div>
  );
}

export function FrameBrackets({ className = "" }: { className?: string }) {
  const Bracket = ({ className: pos }: { className: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className={`absolute text-brand/30 ${pos}`}>
      <path d="M2 10V2H10" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
    </svg>
  );
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <Bracket className="-left-3 -top-3" />
      <Bracket className="-right-3 -top-3 rotate-90" />
      <Bracket className="-bottom-3 -right-3 rotate-180" />
      <Bracket className="-bottom-3 -left-3 -rotate-90" />
    </div>
  );
}

/** Static brand emphasis - CF uses orange ink, not animated shimmer. */
export function ShimmerText({ children }: { children: ReactNode }) {
  return <span className="text-brand">{children}</span>;
}

const TRUST_ICONS: Record<string, ReactNode> = {
  "No per-seat fees": (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="10" cy="10" r="7" />
      <path d="M6.5 10l2.2 2.2L13.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "Data stays yours": (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="9" width="12" height="8" rx="1.5" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" strokeLinecap="round" />
    </svg>
  ),
  "License in minutes": (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M10 2v4M10 14v4M2 10h4M14 10h4" strokeLinecap="round" />
      <circle cx="10" cy="10" r="3" />
    </svg>
  ),
  "Open-source frontend": (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M10 3c-4 0-7 2.5-7 6.5 0 2.8 1.8 5.2 4.5 6.2L5 18l3.8-2.1c.4.05.8.1 1.2.1 4 0 7-2.5 7-6.5S14 3 10 3z" strokeLinejoin="round" />
    </svg>
  ),
};

/** Compact trust row - no pricing, icon-led. */
export function TrustStrip({ points }: { points: { label: string; detail: string }[] }) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8 sm:gap-y-4">
      {points.map((p) => (
        <div key={p.label} className="trust-item flex items-center gap-2.5 text-left">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-brand">
            {TRUST_ICONS[p.label]}
          </span>
          <span>
            <p className="text-xs font-semibold text-foreground">{p.label}</p>
            <p className="text-[11px] text-muted-foreground">{p.detail}</p>
          </span>
        </div>
      ))}
    </div>
  );
}