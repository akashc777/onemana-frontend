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

/**
 * GridTicks tiles a crisp SVG "+" mark so the soft blurred grid reads as a
 * deliberate, engineered surface. Static, masked to fade outward, aria-hidden.
 */
export function GridTicks({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 h-full w-full text-white/[0.08] [mask-image:radial-gradient(80%_70%_at_50%_30%,black,transparent)] ${className}`}
    >
      <defs>
        <pattern id="grid-ticks" width="88" height="88" patternUnits="userSpaceOnUse">
          <path
            d="M44 39.5 V48.5 M39.5 44 H48.5"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-ticks)" />
    </svg>
  );
}

/**
 * SectionHairline is a thin top border with a light blip that sweeps across it,
 * tying sections together. The sweep is transform-only (GPU) and stops under
 * prefers-reduced-motion (global media query neutralises the animation).
 */
export function SectionHairline({ delay = 0 }: { delay?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div
        className="hairline-sweep absolute top-0 h-px w-40 bg-gradient-to-r from-transparent via-brand-light to-transparent"
        style={{ animationDelay: `${delay}ms` }}
      />
    </div>
  );
}

/**
 * Constellation is a deterministic node-and-edge graph (hardcoded so SSR and
 * client render identically) that drifts and twinkles faintly behind the hero,
 * echoing "one workspace, everything connected." Pure stroke/opacity.
 */
export function Constellation({ className = "" }: { className?: string }) {
  const nodes = [
    { x: 80, y: 70 },
    { x: 230, y: 130 },
    { x: 150, y: 250 },
    { x: 380, y: 60 },
    { x: 420, y: 210 },
    { x: 560, y: 120 },
    { x: 680, y: 250 },
    { x: 720, y: 80 },
    { x: 300, y: 330 },
    { x: 540, y: 320 },
  ];
  const edges = [
    [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [5, 7], [2, 8], [4, 9], [6, 9], [8, 9],
  ];
  return (
    <svg
      viewBox="0 0 800 400"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
      className={`constellation pointer-events-none absolute inset-0 -z-10 h-full w-full ${className}`}
    >
      <g stroke="currentColor" className="text-brand-light/20">
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} strokeWidth="1" />
        ))}
      </g>
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={i % 3 === 0 ? 3 : 2}
          className="constellation-node fill-accent-cyan/60"
          style={{ animationDelay: `${(i % 5) * 0.6}s` }}
        />
      ))}
    </svg>
  );
}

/**
 * CornerBrackets frames a product showcase with four crisp SVG L-brackets - a
 * polished product-shot detail. Presentational, aria-hidden.
 */
export function CornerBrackets({ className = "" }: { className?: string }) {
  const Bracket = ({ d, pos }: { d: string; pos: string }) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden className={`absolute text-brand/50 ${pos}`}>
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      <Bracket pos="-left-2 -top-2" d="M1 8 V1 H8" />
      <Bracket pos="-right-2 -top-2 rotate-90" d="M1 8 V1 H8" />
      <Bracket pos="-bottom-2 -right-2 rotate-180" d="M1 8 V1 H8" />
      <Bracket pos="-bottom-2 -left-2 -rotate-90" d="M1 8 V1 H8" />
    </div>
  );
}
