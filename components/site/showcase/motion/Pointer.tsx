/**
 * A mouse pointer, for a scene a hand has to drive (a click that opens a
 * thread, a card carried across a board, a slot dragged out on a calendar).
 * It is drawn as the system draws one, white with a dark edge, and moved by
 * the scene's path (data-sc-path, motion/engine Mover), its point at the
 * path's place. Its shape is an item each, turned on and off by the script:
 * `${id}-arrow`, `${id}-hand` (over something to press), `${id}-grab` (over
 * something to pick up), `${id}-grabbing` (holding it) and `${id}-cell` (the
 * calendar's slots, where a drag makes an event). It starts out of
 * sight and hidden from everything but sight (the scene's label says what it
 * does).
 */
export type PointerShape = "arrow" | "hand" | "grab" | "grabbing" | "cell"

const INK = "rgb(0 0 0 / 0.86)"
const WHITE = "rgb(255 255 255)"

/** Each shape on a 24px grid, with the point it presses with. */
const SHAPES: Record<PointerShape, { point: [number, number]; parts: string[]; seams?: string[] }> = {
  arrow: {
    point: [4, 2],
    parts: ["M4 2.5v16.6l4.2-4 2.8 6.3 3.1-1.4-2.8-6.1h5.9z"],
  },
  hand: {
    point: [9.5, 2],
    parts: [
      "M7.5 3.8a2 2 0 0 1 4 0V13h-4z",
      "M11.5 9.3a1.8 1.8 0 0 1 3.6 0V13h-3.6z",
      "M15.1 10.3a1.7 1.7 0 0 1 3.4 0V13h-3.4z",
      "M18.5 11.3a1.5 1.5 0 0 1 3 0V15h-3z",
      "M7.5 12h14v4c0 3.3-2.7 6-6 6h-3.2c-2 0-3.4-.8-4.6-2.2l-4.2-5.1a1.7 1.7 0 0 1 2.5-2.3L7.5 14.5z",
    ],
    seams: ["M11.5 10v3.2", "M15.1 11v2.6", "M18.5 12v2.4"],
  },
  grab: {
    point: [12, 11],
    parts: [
      "M6.6 6.8a1.7 1.7 0 0 1 3.4 0V12H6.6z",
      "M10 4.6a1.7 1.7 0 0 1 3.4 0V12H10z",
      "M13.4 5.4a1.7 1.7 0 0 1 3.4 0V12h-3.4z",
      "M16.8 7.6a1.6 1.6 0 0 1 3.2 0V13h-3.2z",
      "M6.6 11h13.4v4.2c0 3.6-2.9 6.6-6.5 6.6h-1.4c-2.3 0-3.7-.9-4.9-2.5L3.6 14.4a1.6 1.6 0 0 1 2.4-2l.6.7z",
    ],
    seams: ["M10 5.6v6", "M13.4 6.4v5.4", "M16.8 8.4v4"],
  },
  cell: {
    point: [12, 12],
    parts: ["M9.6 3.5h4.8v6.1h6.1v4.8h-6.1v6.1H9.6v-6.1H3.5V9.6h6.1z"],
  },
  grabbing: {
    point: [12, 12],
    parts: [
      "M6.8 10.2a1.7 1.7 0 0 1 3.4 0V13H6.8z",
      "M10.2 9.4a1.7 1.7 0 0 1 3.4 0V13h-3.4z",
      "M13.6 9.6a1.7 1.7 0 0 1 3.4 0V13H13.6z",
      "M17 10.6a1.5 1.5 0 0 1 3 0V14h-3z",
      "M6.8 12h13.2v3.6c0 3.5-2.8 6.4-6.4 6.4h-1.5c-2.2 0-3.6-.9-4.7-2.4l-2.3-3.3a1.5 1.5 0 0 1 2.3-1.9z",
    ],
    seams: ["M10.2 10.4v2.6", "M13.6 10.6v2.4", "M17 11.4v2.4"],
  },
}

function Shape({ shape }: { shape: PointerShape }) {
  const s = SHAPES[shape]
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginLeft: -s.point[0], marginTop: -s.point[1] }}>
      <g fill="none" stroke={INK} strokeWidth="2.1" strokeLinejoin="round" strokeLinecap="round">
        {s.parts.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g fill={WHITE}>
        {s.parts.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {s.seams && (
        <g fill="none" stroke={INK} strokeWidth="0.9" strokeLinecap="round">
          {s.seams.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      )}
    </svg>
  )
}

/** The pointer, with the shapes a scene uses (the first is the one it starts in). */
export function Pointer({ id, shapes }: { id: string; shapes: PointerShape[] }) {
  return (
    <span className="sc-ptr" data-sc-path={id} data-sc-item={id} data-sc-state="off">
      {shapes.map((s, i) => (
        <span key={s} data-sc-item={`${id}-${s}`} data-sc-state={i === 0 ? undefined : "off"}>
          <Shape shape={s} />
        </span>
      ))}
    </span>
  )
}

/** A pointer over the whole scene, above its window (the scene's stage is its frame). */
export function PointerLayer({ id, shapes }: { id: string; shapes: PointerShape[] }) {
  return (
    <div aria-hidden="true" className="sc pointer-events-none absolute inset-0 z-10">
      <Pointer id={id} shapes={shapes} />
    </div>
  )
}
