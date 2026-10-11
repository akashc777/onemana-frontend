import type { CSSProperties, ReactNode } from "react"

import "./showcase.css"
import { SceneDirector, type Script } from "./SceneDirector"

/**
 * A SCENE: OneCamp drawn by its own components, as one picture.
 *
 * It is designed at one size (w by h CSS pixels, where it shows at 1:1) and
 * drawn at whatever width its column gives it, scaled as a whole: the box
 * keeps the scene's aspect, so it reserves its height before anything paints
 * (no layout shift), and nothing inside is ever cropped or re-laid out.
 *
 * It is one image to a screen reader (role="img" with the words a sighted
 * reader takes from it) and nothing in it can be focused or pressed. A
 * `script` makes it play (SceneDirector); without one it is still.
 *
 * `window` draws it as the app's window: r14, e4 (whose first step is the 1px
 * ring) and clipped.
 */
export function Scene({
  w,
  h,
  label,
  children,
  script,
  window: asWindow = true,
  className,
  style,
}: {
  w: number
  h: number
  /** What the scene shows, for a screen reader. */
  label: string
  children: ReactNode
  script?: Script
  window?: boolean
  className?: string
  style?: CSSProperties
}) {
  const stage = <div className="sc-stage">{children}</div>
  return (
    <div
      role="img"
      aria-label={label}
      data-scene=""
      data-window={asWindow ? "" : undefined}
      className={["sc-fit", className].filter(Boolean).join(" ")}
      style={{ ...style, "--sc-w": w, "--sc-h": h } as CSSProperties}
    >
      {script ? <SceneDirector script={script}>{stage}</SceneDirector> : stage}
    </div>
  )
}
