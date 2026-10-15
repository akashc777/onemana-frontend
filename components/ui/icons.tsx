import type { SVGProps } from "react"

import { cx } from "@/components/ui/graphics/hues"

/**
 * THE SITE'S ICONS, in one place (design v3, DESIGN_V3 §3.12; site.md G9).
 *
 * Every icon is drawn on the 24 grid with round caps and joins, and every
 * line in it is a non-scaling stroke of 1.25px: one rendered weight whatever
 * size a call site gives it (16 beside text, 14 in chips, 18 to 24 in a
 * tile), as the app's Lucide icons have at stroke-width = 30 / size. Before
 * this file the site drew forty icons inline, each with its own stroke on its
 * own grid, and a 14px arrow came out at 1.09px while a tile's 20px glyph came
 * out at 1.57px (design/site-polish/AUDIT.md, I1).
 *
 * The drawings are not icons and keep their own weights: the logo ring, the
 * spark, the spots, the orbits and the marks (components/ui/graphics,
 * components/ui/v3.tsx). app/iconStroke.test.ts fails on any other <svg> in
 * the site's pages and components.
 *
 * Decorative by default (aria-hidden), since an icon sits beside the words
 * it illustrates; pass `title` for one that stands alone.
 *
 *   <Icon name="check" />
 *   <Icon name="arrow-right" size={14} className="go-arrow" />
 *   <Icon d="M4 20V10M10 20V4" />          a drawing from a data table
 */

/** One stroke for every icon, in CSS px (DESIGN_V3 §3.12). */
export const ICON_STROKE = 1.25

type Shape =
  | readonly ["path", string]
  | readonly ["circle", number, number, number]
  | readonly ["rect", number, number, number, number, number]
  /** A filled shape: a dot, or the play triangle. */
  | readonly ["fill", string]
  | readonly ["dot", number, number, number]

const ICONS = {
  "arrow-right": [["path", "M5 12h14M13 6l6 6-6 6"]],
  "arrow-left": [["path", "M19 12H5M11 6l-6 6 6 6"]],
  // Lucide's arrow-up-right: a link that leaves the site, in a new tab.
  "arrow-up-right": [["path", "M7 7h10v10M7 17 17 7"]],
  "chevron-right": [["path", "M9 6l6 6-6 6"]],
  "chevron-down": [["path", "M6 9l6 6 6-6"]],
  check: [["path", "M5 12.5l4.5 4.5L19 7.5"]],
  plus: [["path", "M12 5v14M5 12h14"]],
  close: [["path", "M6 6l12 12M18 6L6 18"]],
  menu: [["path", "M4 7h16M4 12h16M4 17h16"]],
  sun: [
    ["circle", 12, 12, 4],
    ["path", "M12 2.5v2M12 19.5v2M5.28 5.28l1.41 1.41M17.31 17.31l1.41 1.41M2.5 12h2M19.5 12h2M5.28 18.72l1.41-1.41M17.31 6.69l1.41-1.41"],
  ],
  moon: [["path", "M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a7 7 0 1 0 11 11z"]],
  info: [
    ["circle", 12, 12, 9],
    ["path", "M12 11v5M12 8h.01"],
  ],
  alert: [
    ["circle", 12, 12, 9],
    ["path", "M12 7.5v5.5M12 16.5h.01"],
  ],
  lock: [
    ["rect", 5, 11, 14, 9, 2],
    ["path", "M8 11V8a4 4 0 0 1 8 0v3"],
  ],
  globe: [
    ["circle", 12, 12, 9],
    ["path", "M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"],
  ],
  search: [
    ["circle", 11, 11, 6.5],
    ["path", "M16 16l4 4"],
  ],
  server: [
    ["rect", 4, 4, 16, 6.5, 1.5],
    ["rect", 4, 13.5, 16, 6.5, 1.5],
    ["path", "M7.75 7.25h.01M7.75 16.75h.01"],
  ],
  terminal: [["path", "M4 6l5 6-5 6M12 18h8"]],
  clock: [
    ["circle", 12, 12, 8.5],
    ["path", "M12 7.5v4.75l3 1.75"],
  ],
  receipt: [["path", "M5.5 3.5h13v17l-3.25-1.75L12 20.5l-3.25-1.75L5.5 20.5zM9 8.5h6M9 12.5h6"]],
  cloud: [["path", "M7.5 18.5h9.5a3.5 3.5 0 0 0 .4-7A5.5 5.5 0 0 0 6.8 10a4.25 4.25 0 0 0 .7 8.5z"]],
  key: [
    ["circle", 8, 15, 4],
    ["path", "M11 12l8-8M16 7l2.5 2.5M14 9l2 2"],
  ],
  doc: [["path", "M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v4h4M9 12h6M9 16h4"]],
  task: [
    ["rect", 4, 4, 16, 16, 3],
    ["path", "M8.5 12.5l2.5 2.5 4.5-5"],
  ],
  calendar: [
    ["rect", 4, 5, 16, 15, 2],
    ["path", "M4 10h16M9 3v4M15 3v4"],
  ],
  /** An agent, or AI: the motif's four-point spark with a small one beside it. */
  agent: [["path", "M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5zM18.5 16.5v3M17 18h3"]],
  chat: [["path", "M5 5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-4 3.5V17H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM10 8.5l-1 6M14 8.5l-1 6M8.5 10.5h7M8 12.5h7"]],
  people: [
    ["circle", 9, 9, 3],
    ["circle", 16.5, 8, 2.5],
    ["path", "M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5M16 13.5c2.4 0 4 1.3 4.5 4"],
  ],
  user: [
    ["circle", 12, 8, 3.75],
    ["path", "M4.75 20a7.25 7.25 0 0 1 14.5 0"],
  ],
  "user-plus": [
    ["circle", 9, 8, 3.5],
    ["path", "M3 20a6 6 0 0 1 12 0M18 8v6M15 11h6"],
  ],
  shield: [["path", "M12 3.5l7 2.5v5.5c0 4.3-2.9 7.6-7 9-4.1-1.4-7-4.7-7-9V6zM9 12l2 2 4-4.5"]],
  record: [
    ["circle", 5.5, 6, 1.5],
    ["circle", 5.5, 12, 1.5],
    ["circle", 5.5, 18, 1.5],
    ["path", "M10 6h9M10 12h9M10 18h9M5.5 7.5v3M5.5 13.5v3"],
  ],
  board: [
    ["rect", 3.5, 4, 4.5, 12, 1.5],
    ["rect", 9.75, 4, 4.5, 16, 1.5],
    ["rect", 16, 4, 4.5, 8, 1.5],
  ],
  table: [
    ["rect", 3.5, 4.5, 17, 15, 2],
    ["path", "M3.5 9.5h17M3.5 14.5h17M9.5 4.5v15"],
  ],
  bolt: [["path", "M13 3.5L5.5 13.5H11l-1 7 7.5-10H12z"]],
  video: [
    ["rect", 3.5, 6.5, 12, 11, 2],
    ["path", "M15.5 10.5l5-3v9l-5-3"],
  ],
  play: [["fill", "M8 5.5v13a.75.75 0 0 0 1.15.63l10.2-6.5a.75.75 0 0 0 0-1.26L9.15 4.87A.75.75 0 0 0 8 5.5z"]],
  copy: [
    ["rect", 8, 8, 12, 12, 2],
    ["path", "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"],
  ],
  sliders: [
    ["circle", 12, 7, 2.75],
    ["circle", 16, 17, 2.75],
    ["path", "M3.5 7h5.75M14.75 7h5.75M3.5 17h9.75M18.75 17h1.75"],
  ],
  plug: [["path", "M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"]],
  chart: [["path", "M5 20v-9M11 20V5M17 20v-6M3 20h18"]],
  mail: [
    ["rect", 3.5, 5.5, 17, 13, 2],
    ["path", "M4 7.5l8 6 8-6"],
  ],
  branch: [
    ["circle", 6, 18, 2.5],
    ["circle", 18, 6, 2.5],
    ["path", "M6 3.5v12M18 8.5a9 9 0 0 1-9 9"],
  ],
  star: [["path", "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"]],
  briefcase: [
    ["rect", 3.5, 7.5, 17, 12, 2],
    ["path", "M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 13h17"],
  ],
  megaphone: [["path", "M4.5 10v4a1 1 0 0 0 1 1h2l5 4V5l-5 4h-2a1 1 0 0 0-1 1zM16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10"]],
  browser: [
    ["rect", 3.5, 4.5, 17, 15, 2],
    ["path", "M3.5 9h17M6.75 6.75h.01M9.25 6.75h.01"],
  ],
  code: [["path", "M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"]],
  ticket: [["path", "M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5V14a2 2 0 0 0 0-4zM14.5 6v12"]],
  home: [["path", "M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"]],
} as const satisfies Record<string, readonly Shape[]>

export type IconName = keyof typeof ICONS

/** Every icon by name, for the guard and the showcase. */
export const ICON_NAMES = Object.keys(ICONS) as IconName[]

const NS = { vectorEffect: "non-scaling-stroke" } as const

function draw(shapes: readonly Shape[]) {
  return shapes.map((s, i) => {
    switch (s[0]) {
      case "path":
        return <path key={i} d={s[1]} {...NS} />
      case "circle":
        return <circle key={i} cx={s[1]} cy={s[2]} r={s[3]} {...NS} />
      case "rect":
        return <rect key={i} x={s[1]} y={s[2]} width={s[3]} height={s[4]} rx={s[5]} {...NS} />
      case "fill":
        return <path key={i} d={s[1]} fill="currentColor" stroke="none" />
      case "dot":
        return <circle key={i} cx={s[1]} cy={s[2]} r={s[3]} fill="currentColor" stroke="none" />
    }
  })
}

export type IconProps = Omit<SVGProps<SVGSVGElement>, "name" | "d"> & {
  /** In px; 16 beside text. CSS (size-*) wins, and the stroke stays 1.25 either way. */
  size?: number
  /** A name for an icon that stands alone; otherwise it is hidden from assistive tech. */
  title?: string
} & ({ name: IconName; d?: never } | { d: string; name?: never })

/** One icon from the set, or a path from a data table, at the one stroke. */
export function Icon({ name, d, size = 16, title, className, ...rest }: IconProps) {
  const shapes: readonly Shape[] = name ? ICONS[name] : [["path", d!]]
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
      className={cx("icon shrink-0", className)}
      {...rest}
    >
      {draw(shapes)}
    </svg>
  )
}

/**
 * The 16px arrow on a primary marketing CTA and a standalone link (site.md
 * S2, S3); it moves 2px on hover (.go-arrow in globals.css).
 */
export function Arrow({ size = 16 }: { size?: 14 | 16 }) {
  return <Icon name="arrow-right" size={size} className="go-arrow" />
}

/**
 * The mark after a link that leaves the site in a new tab (storefront audit
 * G4, G14): the up-right arrow at 14px for the eye, and the same said to a
 * screen reader.
 */
export function NewTabMark() {
  return (
    <>
      <Icon name="arrow-up-right" size={14} className="opacity-70" />
      <span className="sr-only"> (opens in a new tab)</span>
    </>
  )
}
