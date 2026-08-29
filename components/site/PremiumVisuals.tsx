import type { ReactNode } from "react";
import type { TrustIconKey } from "@/lib/content";

/** Cloudflare-style hero atmosphere: line grid + top orange beam. */
export function HeroAmbient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="brand-beam absolute inset-0" />
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

/**
 * Keyed on a CLOSED UNION, not on the label prose.
 *
 * It was `Record<string, ReactNode>` keyed by label, which accepts any key and therefore checks nothing:
 * rewording the trust points left three of four icon boxes empty, and tsc, eslint and next build were all
 * green. A Record over a union stops compiling instead — see the note on TrustIconKey in lib/content.ts.
 */
const TRUST_ICONS: Record<TrustIconKey, ReactNode> = {
  // Shield with a tick: bounded by permissions. Matches the governance card icon so the hero strip and
  // the section below it read as the same claim.
  bounded: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M10 2.6l5.4 2.2v4.3c0 3.3-2.2 5.9-5.4 6.8-3.2-.9-5.4-3.5-5.4-6.8V4.8L10 2.6z" strokeLinejoin="round" />
      <path d="M7.7 9.9l1.7 1.7 2.9-3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // Document with entry lines: the audit trail.
  audited: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M5 2.8h6.2L15 6.5v10.7H5z" strokeLinejoin="round" />
      <path d="M11.1 3V6.5H15" strokeLinejoin="round" />
      <path d="M7.2 9.4h5.6M7.2 11.7h5.6M7.2 14h3.4" strokeLinecap="round" />
    </svg>
  ),
  server: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="9" width="12" height="8" rx="1.5" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" strokeLinecap="round" />
    </svg>
  ),
  // Person plus a key: identity and provisioning.
  identity: (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="8.2" cy="7" r="2.6" />
      <path d="M3.6 16.4c.5-2.5 2.4-4 4.6-4 1 0 1.9.3 2.7.9" strokeLinecap="round" />
      <circle cx="14.6" cy="13.4" r="2" />
      <path d="M16 14.8l1.9 1.9" strokeLinecap="round" />
    </svg>
  ),
};

/** Compact trust row - no pricing, icon-led. */
export function TrustStrip({ points }: { points: { icon: TrustIconKey; label: string; detail: string }[] }) {
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8 sm:gap-y-4">
      {points.map((p) => (
        <div key={p.label} className="trust-item flex items-center gap-2.5 text-left">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-brand">
            {TRUST_ICONS[p.icon]}
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