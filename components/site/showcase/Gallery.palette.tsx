import type { ReactNode } from "react"

import { AppFrame } from "./AppFrame"
import { Scene } from "./Scene"
import { ChannelView } from "./ChannelView"
import { Sidebar } from "./Sidebar"
import { ENGINEERING } from "./data"
import { Plate, engineeringHistory } from "./Gallery"
import { LaunchSearch, PaletteOver, QuestionPalette, listCap } from "./Palette"
import { PalettePhone, PaletteTour, paletteDesktop, palettePhone } from "./scenes/palette"
import { SIZES } from "./scenes/types"

const DESK = { w: 1120, h: 700 }

/** The whole window as the live demo was captured: the sidebar, #engineering, and the palette over them. */
function Desk({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <AppFrame sidebar={<Sidebar place="channel:engineering" />}>
        <ChannelView
          name="engineering"
          people={ENGINEERING.members}
          count={ENGINEERING.memberCount}
          items={engineeringHistory()}
          placeholder="Message #engineering, or ask @Release Captain"
        />
      </AppFrame>
      <PaletteOver w={DESK.w} h={DESK.h}>
        {children}
      </PaletteOver>
    </div>
  )
}

/**
 * The palette's plates: Search and Ask over the whole window, and the
 * scenes (the tour's and the phone's) at their first picture, which is what
 * a reader without JavaScript sees, and their last.
 */
export function Plates() {
  const { tour, phone } = SIZES
  return (
    <>
      <Plate name="palette-search" width={DESK.w} height={DESK.h}>
        <Desk>
          <LaunchSearch cap={listCap(DESK.h)} />
        </Desk>
      </Plate>
      <Plate name="palette-ask" width={DESK.w} height={DESK.h}>
        <Desk>
          <QuestionPalette only="ask" cap={listCap(DESK.h)} />
        </Desk>
      </Plate>
      <Plate name="palette-tour-start" width={tour.w} height={tour.h}>
        <PaletteTour at="start" />
      </Plate>
      <Plate name="palette-tour" width={tour.w} height={tour.h}>
        <PaletteTour at="end" />
      </Plate>
      <Plate name="palette-phone-start" width={phone.w} height={phone.h}>
        <PalettePhone at="start" />
      </Plate>
      <Plate name="palette-phone" width={phone.w} height={phone.h}>
        <PalettePhone at="end" />
      </Plate>
      {/* The scenes as a page places them, playing (SceneDirector). */}
      <Plate name="palette-play" width={tour.w} height={tour.h}>
        <Scene w={tour.w} h={tour.h} label={paletteDesktop.label} script={paletteDesktop.script}>
          {paletteDesktop.render()}
        </Scene>
      </Plate>
      <Plate name="palette-phone-play" width={phone.w} height={phone.h}>
        <Scene w={phone.w} h={phone.h} label={palettePhone.label} script={palettePhone.script} window={false}>
          {palettePhone.render()}
        </Scene>
      </Plate>
    </>
  )
}
