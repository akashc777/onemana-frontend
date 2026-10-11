import { Scene } from "./Scene"
import type { SceneSpec } from "./scenes/types"

/**
 * One surface as the page shows it: the desktop scene from 768px, the phone's
 * own scene below that (never a squeezed desktop). Only the one on screen is
 * in the layout and the accessibility tree; the other is display: none, so it
 * never plays (SceneDirector waits for it to be seen).
 */
export function TourScene({ desktop, phone, className }: { desktop: SceneSpec; phone: SceneSpec; className?: string }) {
  return (
    <div className={className}>
      <div className="hidden md:block">
        <Scene w={desktop.w} h={desktop.h} label={desktop.label} script={desktop.script}>
          {desktop.render()}
        </Scene>
      </div>
      <div className="mx-auto w-full max-w-[400px] md:hidden">
        <Scene w={phone.w} h={phone.h} label={phone.label} script={phone.script}>
          {phone.render()}
        </Scene>
      </div>
    </div>
  )
}
