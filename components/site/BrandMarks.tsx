/**
 * Original, simplified brand-colored marks for the tools OneCamp replaces.
 * These are stylized approximations (not the official trademarked logos) drawn
 * to read instantly while avoiding direct use of competitors' artwork.
 */

export function SlackMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="4" y="10.5" width="7.5" height="3" rx="1.5" fill="#36C5F0" />
      <rect x="10.5" y="4" width="3" height="7.5" rx="1.5" fill="#2EB67D" />
      <rect x="12.5" y="10.5" width="7.5" height="3" rx="1.5" fill="#ECB22E" />
      <rect x="10.5" y="12.5" width="3" height="7.5" rx="1.5" fill="#E01E5A" />
    </svg>
  );
}

/** Slack hash with a periodic "organize" motion — pieces drift, then snap into place. */
export function SlackMarkAnimated({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g className="slack-piece slack-piece-a">
        <rect x="4" y="10.5" width="7.5" height="3" rx="1.5" fill="#36C5F0" />
      </g>
      <g className="slack-piece slack-piece-b">
        <rect x="10.5" y="4" width="3" height="7.5" rx="1.5" fill="#2EB67D" />
      </g>
      <g className="slack-piece slack-piece-c">
        <rect x="12.5" y="10.5" width="7.5" height="3" rx="1.5" fill="#ECB22E" />
      </g>
      <g className="slack-piece slack-piece-d">
        <rect x="10.5" y="12.5" width="3" height="7.5" rx="1.5" fill="#E01E5A" />
      </g>
    </svg>
  );
}

export function NotionMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#fff" />
      <path d="M8 16.5V7.5l8 9v-9" fill="none" stroke="#37352f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AsanaMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="6.5" r="3.2" fill="#F06A6A" />
      <circle cx="6.8" cy="15.5" r="3.2" fill="#F06A6A" />
      <circle cx="17.2" cy="15.5" r="3.2" fill="#F06A6A" />
    </svg>
  );
}

export function ZoomMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#2D8CFF" />
      <rect x="5.5" y="8.5" width="8.5" height="7" rx="2" fill="#fff" />
      <path d="M15 11l3.5-2.2v6.4L15 13z" fill="#fff" />
    </svg>
  );
}

export function CalendarMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3.5" y="4" width="17" height="16.5" rx="3" fill="#fff" />
      <rect x="3.5" y="4" width="17" height="4.5" rx="3" fill="#4285F4" />
      <text x="12" y="17.5" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#4285F4" fontFamily="Inter, sans-serif">
        31
      </text>
    </svg>
  );
}

/** The OneCamp core mark: gradient concentric rings. */
export function OneCampMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id="ocCore" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#e9e6ff" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="15" fill="none" stroke="url(#ocCore)" strokeWidth="3.2" />
      <circle cx="24" cy="24" r="6.5" fill="url(#ocCore)" />
    </svg>
  );
}

/** OneCamp product logo: white ring on a warm orange gradient tile. */
export function OneCampLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="ocLogoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF8A00" />
          <stop offset="1" stopColor="#FF3D00" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#ocLogoGrad)" />
      <circle cx="256" cy="256" r="150" stroke="#FFFFFF" strokeWidth="56" />
    </svg>
  );
}

/** OneMana company logo: white ring on a blue-to-cyan gradient tile (echoes the
 * site's brand → cyan motif). */
export function OneManaLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="omLogoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0066FF" />
          <stop offset="1" stopColor="#34E3E3" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#omLogoGrad)" />
      <circle cx="256" cy="256" r="150" stroke="#FFFFFF" strokeWidth="56" />
    </svg>
  );
}
