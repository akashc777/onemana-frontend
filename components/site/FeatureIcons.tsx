import type { FeatureIconKey } from "@/lib/content";

const stroke = 1.6;

/** Feature icons with per-module SVG micro-animations (triggered on card hover). */
export function FeatureIcon({ icon, className = "" }: { icon: FeatureIconKey; className?: string }) {
  const base = `feat-icon feat-icon-${icon} ${className}`;

  switch (icon) {
    case "ai":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <g className="feat-ai-rays">
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
            <path d="M7.5 7.5l2 2M14.5 14.5l2 2M16.5 7.5l-2 2M9.5 14.5l-2 2" strokeLinecap="round" />
          </g>
          <circle className="feat-ai-core" cx="12" cy="12" r="3.5" />
        </svg>
      );
    case "chat":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <path
            className="feat-chat-bubble"
            d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H10l-4.5 3.5V16H6.5A2.5 2.5 0 0 1 4 13.5v-7z"
            strokeLinejoin="round"
          />
          <path className="feat-chat-line feat-chat-line-a" d="M8 9.5h8" strokeLinecap="round" />
          <path className="feat-chat-line feat-chat-line-b" d="M8 12.5h5" strokeLinecap="round" />
        </svg>
      );
    case "tasks":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <rect className="feat-task-col" x="3" y="4" width="5.5" height="16" rx="1.2" />
          <rect className="feat-task-col" x="9.75" y="4" width="5.5" height="10" rx="1.2" />
          <rect className="feat-task-col" x="16.5" y="4" width="4.5" height="13" rx="1.2" />
          <path className="feat-task-check" d="M4.8 8.2l1.4 1.4 2.4-2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "docs":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <path
            className="feat-doc-page"
            d="M8 4h8l4 4v12a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V5.5A1.5 1.5 0 0 1 8 4z"
            strokeLinejoin="round"
          />
          <path className="feat-doc-fold" d="M16 4v4h4" strokeLinejoin="round" />
          <path className="feat-doc-line" d="M9 12h6" strokeLinecap="round" />
          <path className="feat-doc-line feat-doc-line-b" d="M9 15.5h4" strokeLinecap="round" />
        </svg>
      );
    case "board":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <rect className="feat-board-frame" x="3" y="4" width="18" height="14" rx="2" />
          <rect className="feat-board-node" x="6" y="7.5" width="5.5" height="3.5" rx="1" />
          <circle className="feat-board-node" cx="16.5" cy="9.25" r="1.75" />
          <path className="feat-board-link" d="M11.5 9.25h3.25M9 11v3.5h6.5V11" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21h6" strokeLinecap="round" />
        </svg>
      );
    case "video":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <rect className="feat-video-body" x="3" y="6" width="13" height="12" rx="2" />
          <path className="feat-video-play" d="M16 10.5l5-3v9l-5-3v-3z" strokeLinejoin="round" />
          <circle className="feat-video-rec" cx="9.5" cy="12" r="2" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <rect className="feat-cal-body" x="4" y="5" width="16" height="15" rx="2" />
          <path d="M4 9.5h16M8 3v3M16 3v3" strokeLinecap="round" />
          <path className="feat-cal-dot" d="M8 13h2.5" strokeLinecap="round" />
          <path className="feat-cal-dot feat-cal-dot-b" d="M13.5 13H16" strokeLinecap="round" />
          <path className="feat-cal-dot feat-cal-dot-c" d="M8 16.5h2.5" strokeLinecap="round" />
        </svg>
      );
    case "teams":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <circle className="feat-team-a" cx="9" cy="9" r="2.5" />
          <circle className="feat-team-b" cx="16.5" cy="10" r="2" />
          <path className="feat-team-base" d="M4.5 18.5c.6-2.4 2.4-4 4.5-4s3.9 1.6 4.5 4M13 18.5c.4-1.8 1.6-3 3.5-3.2" strokeLinecap="round" />
        </svg>
      );
    case "lock":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <rect className="feat-lock-body" x="5" y="11" width="14" height="9" rx="2" />
          <path className="feat-lock-shackle" d="M8 11V8.5a4 4 0 0 1 8 0V11" strokeLinecap="round" />
          <circle className="feat-lock-key" cx="12" cy="15.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "table":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <rect className="feat-table-frame" x="3.5" y="4.5" width="17" height="15" rx="2" />
          <path d="M3.5 9h17M9 9v10.5M3.5 14.5h17" strokeLinecap="round" />
          <path className="feat-table-cell" d="M5.5 6.7h2" strokeLinecap="round" />
        </svg>
      );
    case "agent":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <rect className="feat-agent-head" x="5" y="8" width="14" height="10" rx="3" />
          <path d="M12 5.5V8M9.5 13h.01M14.5 13h.01" strokeLinecap="round" />
          <circle cx="12" cy="4.5" r="1.2" />
          <path className="feat-agent-ear" d="M5 12H3.5M19 12h1.5" strokeLinecap="round" />
        </svg>
      );
    case "automation":
      return (
        <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} aria-hidden>
          <path className="feat-auto-bolt" d="M13 3L5 13h5l-1 8 8-10h-5l1-8z" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}