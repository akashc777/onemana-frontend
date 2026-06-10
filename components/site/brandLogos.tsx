/**
 * Brand marks for the tools OneCamp consolidates, as inline SVGs. Used only
 * nominatively (to show what OneCamp replaces) — no endorsement implied.
 * Simplified, recognizable reconstructions on a 48x48 viewBox.
 */
import type { ComponentType } from "react";

type LogoProps = { className?: string };

export function SlackLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Slack">
      <rect x="6" y="15" width="13" height="7" rx="3.5" fill="#36C5F0" />
      <rect x="26" y="6" width="7" height="13" rx="3.5" fill="#2EB67D" />
      <rect x="29" y="26" width="13" height="7" rx="3.5" fill="#ECB22E" />
      <rect x="15" y="29" width="7" height="13" rx="3.5" fill="#E01E5A" />
    </svg>
  );
}

export function NotionLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Notion">
      <rect x="5" y="5" width="38" height="38" rx="7" fill="#fff" stroke="#111" strokeWidth="2" />
      <text x="24" y="34" textAnchor="middle" fontFamily="Georgia, serif" fontSize="26" fontWeight="700" fill="#111">
        N
      </text>
    </svg>
  );
}

export function AsanaLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Asana">
      <circle cx="24" cy="14" r="6.5" fill="#F06A6A" />
      <circle cx="14.5" cy="31" r="6.5" fill="#F06A6A" />
      <circle cx="33.5" cy="31" r="6.5" fill="#F06A6A" />
    </svg>
  );
}

export function TrelloLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Trello">
      <rect x="5" y="5" width="38" height="38" rx="7" fill="#0079BF" />
      <rect x="11" y="11" width="11" height="26" rx="2.5" fill="#fff" />
      <rect x="26" y="11" width="11" height="16" rx="2.5" fill="#fff" />
    </svg>
  );
}

export function ZoomLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Zoom">
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#2D8CFF" />
      <path d="M12 18.5c0-1.4 1.1-2.5 2.5-2.5H27c1.4 0 2.5 1.1 2.5 2.5v11c0 1.4-1.1 2.5-2.5 2.5H14.5A2.5 2.5 0 0 1 12 29.5v-11Z" fill="#fff" />
      <path d="M31.5 21.5 38 17.2c.6-.4 1.5 0 1.5.8v12c0 .8-.9 1.2-1.5.8l-6.5-4.3v-4Z" fill="#fff" />
    </svg>
  );
}

export function GoogleCalendarLogo({ className = "" }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Google Calendar">
      <rect x="9" y="9" width="30" height="30" rx="4" fill="#fff" stroke="#E0E0E0" strokeWidth="1.5" />
      <rect x="9" y="9" width="30" height="7" rx="4" fill="#4285F4" />
      <rect x="9" y="13" width="30" height="3" fill="#4285F4" />
      <text x="24" y="34" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="700" fill="#4285F4">
        31
      </text>
    </svg>
  );
}

export const BRAND_LOGOS: Record<string, ComponentType<LogoProps>> = {
  Slack: SlackLogo,
  Notion: NotionLogo,
  Asana: AsanaLogo,
  Trello: TrelloLogo,
  Zoom: ZoomLogo,
  "Google Calendar": GoogleCalendarLogo,
};
