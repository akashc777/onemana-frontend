/**
 * SiteBackground is a fixed, full-viewport ambient layer that sits behind all
 * content so no section ever reads as flat/empty: a faint grid, vertical guide
 * lines, slow-drifting color glows, and a vignette. Pure CSS, GPU-cheap,
 * reduced-motion aware (drift stops via the global media query).
 */
export function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* faint grid, fading toward the bottom */}
      <div className="absolute inset-0 bg-grid-dark [background-size:48px_48px] opacity-60 [mask-image:radial-gradient(120%_80%_at_50%_0%,black,transparent_75%)]" />

      {/* vertical guide lines (desktop only) */}
      <div className="absolute inset-0 hidden md:block">
        <div className="absolute inset-y-0 left-[16.66%] w-px bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />
        <div className="absolute inset-y-0 left-[83.33%] w-px bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
      </div>

      {/* drifting ambient glows */}
      <div className="absolute -left-[6%] top-[8%] h-[34rem] w-[34rem] rounded-full bg-brand/10 blur-[150px] animate-drift" />
      <div className="absolute right-[-4%] top-[38%] h-[30rem] w-[30rem] rounded-full bg-accent-cyan/[0.07] blur-[150px] animate-drift [animation-delay:-8s]" />
      <div className="absolute bottom-[4%] left-1/3 h-[32rem] w-[32rem] rounded-full bg-accent-pink/[0.05] blur-[160px] animate-drift [animation-delay:-16s]" />

      {/* vignette to ground the content */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,transparent_55%,rgba(0,0,0,0.55))]" />
    </div>
  );
}

/** The Huly-style vertical light beam erupting upward behind the hero. */
export function HeroBeam() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex justify-center overflow-hidden">
      {/* wide soft base glow */}
      <div className="absolute bottom-0 h-[36vh] w-[80vw] max-w-3xl rounded-[50%] bg-brand/20 blur-[120px]" />
      {/* the core beam */}
      <div className="h-[62vh] w-px origin-bottom bg-gradient-to-t from-white via-brand-light to-transparent animate-beam-pulse" />
      {/* beam halo */}
      <div className="absolute bottom-0 h-[62vh] w-24 origin-bottom bg-gradient-to-t from-brand/40 via-brand/10 to-transparent blur-2xl animate-beam-pulse" />
    </div>
  );
}
