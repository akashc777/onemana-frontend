import type { CampHue } from "@/lib/campHue";
import { HUE_CLASS } from "./hues";

/**
 * The apps' lanes: each leaves the server's line and runs down to its own
 * node, the farthest leaving first so no two lines cross. Their hues are
 * the cards' (lib/openSource.ts).
 */
const LANES: { hue: CampHue; from: number; x: number }[] = [
  { hue: "dusk", from: 40, x: 216 },
  { hue: "sun", from: 72, x: 160 },
  { hue: "moss", from: 104, x: 104 },
];

/** Where every lane ends, the server's included. */
const FOOT = 188;

/**
 * /open-source's art (the family of site.md S4's page marks, beside
 * /changelog's rail): a branch graph in the cards' hues. The server is the
 * sky line on the left; the web app, the desktop app and the Omarchy kit
 * branch off it and run on, each to a node of its own. Still: nothing here
 * needs to move to say that the code is there to read.
 */
export function OpenSourceMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 248 216" width="248" height="216" fill="none">
      <path d={`M48 20V${FOOT}`} className={`${HUE_CLASS.sky} stroke-hue`} strokeWidth="3" strokeLinecap="round" />
      {LANES.map((l) => (
        <path
          key={l.hue}
          d={`M48 ${l.from}C48 ${l.from + 24} ${l.x} ${l.from + 16} ${l.x} ${l.from + 40}V${FOOT}`}
          className={`${HUE_CLASS[l.hue]} stroke-hue`}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      {/* Where each app branches: a ring on the server's line, in the app's hue. */}
      {LANES.map((l) => (
        <circle key={l.hue} cx="48" cy={l.from} r="6" className={`${HUE_CLASS[l.hue]} fill-card stroke-hue`} strokeWidth="2.5" />
      ))}
      {/* Each line's head: a filled node, the server's ringed in its tint. */}
      <circle cx="48" cy={FOOT} r="13" className={`${HUE_CLASS.sky} fill-hue-tint`} />
      <circle cx="48" cy={FOOT} r="8" className={`${HUE_CLASS.sky} fill-hue`} />
      {LANES.map((l) => (
        <circle key={l.hue} cx={l.x} cy={FOOT} r="8" className={`${HUE_CLASS[l.hue]} fill-hue`} />
      ))}
    </svg>
  );
}
