/**
 * Decorative, dependency-free visual primitives used across the marketing site.
 * Presentational and aria-hidden.
 */

/** Animated aurora blobs + grid backdrop for hero / section backgrounds. */
export function AuroraBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-grid-dark [background-size:44px_44px] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute -top-32 left-1/4 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand/30 blur-[120px] animate-aurora" />
      <div className="absolute -top-20 right-1/4 h-[24rem] w-[24rem] translate-x-1/2 rounded-full bg-accent-cyan/20 blur-[120px] animate-aurora [animation-delay:-6s]" />
      <div className="absolute top-40 left-1/2 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-accent-pink/15 blur-[120px] animate-aurora [animation-delay:-12s]" />
    </div>
  );
}
