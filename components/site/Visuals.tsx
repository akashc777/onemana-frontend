/**
 * Decorative, dependency-free SVG/visual primitives used across the marketing
 * site. All are presentational and aria-hidden.
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

/** A polished, abstract product-window mock rendered entirely in SVG. */
export function ProductMock({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 880 520"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="winBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#13131d" />
          <stop offset="1" stopColor="#0a0a12" />
        </linearGradient>
        <linearGradient id="accentBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#34e3e3" />
          <stop offset="0.5" stopColor="#8b7dff" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="bubble" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6d5efc" />
          <stop offset="1" stopColor="#5847e0" />
        </linearGradient>
      </defs>

      {/* window */}
      <rect x="1" y="1" width="878" height="518" rx="18" fill="url(#winBg)" stroke="rgba(255,255,255,0.10)" />
      {/* top bar */}
      <rect x="1" y="1" width="878" height="44" rx="18" fill="rgba(255,255,255,0.03)" />
      <circle cx="30" cy="23" r="6" fill="#f472b6" />
      <circle cx="52" cy="23" r="6" fill="#facc15" />
      <circle cx="74" cy="23" r="6" fill="#34e3e3" />
      <rect x="360" y="14" width="160" height="18" rx="9" fill="rgba(255,255,255,0.06)" />

      {/* sidebar */}
      <rect x="16" y="60" width="180" height="444" rx="12" fill="rgba(255,255,255,0.03)" />
      <rect x="32" y="80" width="120" height="12" rx="6" fill="rgba(255,255,255,0.16)" />
      {[120, 150, 180, 210, 240, 270].map((y, i) => (
        <g key={y}>
          <rect x="32" y={y} width="14" height="14" rx="4" fill={i === 1 ? "#8b7dff" : "rgba(255,255,255,0.12)"} />
          <rect x="56" y={y + 2} width={i === 1 ? 96 : 84} height="10" rx="5" fill={i === 1 ? "rgba(139,125,255,0.5)" : "rgba(255,255,255,0.1)"} />
        </g>
      ))}

      {/* main: chat bubbles */}
      <rect x="212" y="60" width="450" height="444" rx="12" fill="rgba(255,255,255,0.02)" />
      <rect x="236" y="92" width="220" height="40" rx="12" fill="rgba(255,255,255,0.06)" />
      <rect x="236" y="150" width="300" height="52" rx="12" fill="rgba(255,255,255,0.06)" />
      <rect x="402" y="220" width="236" height="44" rx="12" fill="url(#bubble)" />
      <rect x="236" y="284" width="180" height="40" rx="12" fill="rgba(255,255,255,0.06)" />
      {/* AI bar */}
      <rect x="236" y="440" width="402" height="44" rx="14" fill="rgba(255,255,255,0.05)" stroke="rgba(139,125,255,0.4)" />
      <circle cx="262" cy="462" r="9" fill="url(#bubble)" />
      <rect x="284" y="457" width="150" height="10" rx="5" fill="rgba(255,255,255,0.18)" />

      {/* right rail: tasks */}
      <rect x="678" y="60" width="186" height="444" rx="12" fill="rgba(255,255,255,0.03)" />
      <rect x="694" y="80" width="80" height="12" rx="6" fill="rgba(255,255,255,0.16)" />
      {[112, 168, 224, 280].map((y, i) => (
        <g key={y}>
          <rect x="694" y={y} width="154" height="44" rx="10" fill="rgba(255,255,255,0.05)" />
          <rect x="706" y={y + 12} width="14" height="14" rx="4" fill={i % 2 ? "#34e3e3" : "#8b7dff"} />
          <rect x="730" y={y + 14} width="96" height="10" rx="5" fill="rgba(255,255,255,0.14)" />
        </g>
      ))}

      {/* accent underline */}
      <rect x="16" y="506" width="848" height="3" rx="1.5" fill="url(#accentBar)" opacity="0.7" />
    </svg>
  );
}
