import type { CampHue } from "@/lib/campHue";
import { HUE_CLASS } from "./hues";

// The releases before the newest, each a line in the hue of an area it
// shipped to, in the areas' order (lib/areas.ts: chat, docs, projects).
const ROWS: { hue: CampHue | null; y: number; w: number }[] = [
  { hue: null, y: 36, w: 0 },
  { hue: "sky", y: 100, w: 112 },
  { hue: "dusk", y: 144, w: 132 },
  { hue: "moss", y: 188, w: 92 },
];

/**
 * /changelog's art (the family of site.md S4's page marks): releases on a
 * rail, newest at the top. The newest is a card with its neutral "New", as
 * the home page's pill has it; the ones before it are lines in the hues of
 * the areas they shipped to, fading as they get older. Still: a page about change does
 * not need to move to say so.
 */
export function ChangelogMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 248 216" width="248" height="216" fill="none">
      <path d="M40 36V196" className="stroke-line-3" strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" />
      {/* The newest release: its node ringed, and a card with its New tag. */}
      <circle cx="40" cy="36" r="13" className="stroke-line-3" strokeWidth="1.5" />
      <rect x="64" y="10" width="176" height="56" rx="12" className="fill-card stroke-line-3" strokeWidth="1.5" />
      <rect x="78" y="22" width="34" height="14" rx="7" className="fill-muted stroke-line-2" strokeWidth="1" />
      <rect x="85" y="27" width="20" height="4" rx="2" className="fill-ink-4" />
      <rect x="120" y="25" width="98" height="8" rx="4" className="fill-ink-4" />
      <rect x="78" y="44" width="136" height="6" rx="3" className="fill-line-3" />
      {ROWS.map((r, i) => (
        <g key={r.y} className={r.hue ? HUE_CLASS[r.hue] : ""} opacity={i === 0 ? 1 : 1 - i * 0.18}>
          <circle cx="40" cy={r.y} r={i === 0 ? 7 : 6} className={r.hue ? "fill-hue" : "fill-ink-4"} />
          {r.w ? <rect x="64" y={r.y - 5} width={r.w} height="10" rx="5" className="fill-hue-tint" /> : null}
        </g>
      ))}
    </svg>
  );
}
