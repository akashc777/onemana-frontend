import "./hero.css"
import { RecordCard } from "./AgentRecord"
import { Scene } from "./Scene"
import { heroDesktop, heroPhone, heroRecord } from "./scenes/hero"

/**
 * THE HERO (design v3, owner direction of 11 Oct 2026: the product drawn by
 * its own components, not a screenshot). One window, the app's #engineering
 * at its real size from 1184px (never under 91% from 1024px), a single
 * campfire glow behind it, and one annotation: the record of the refusal
 * the story ends on, hanging off the window's bottom-left edge. A tablet gets
 * the window without its sidebar (hero.css), a phone the phone's own
 * channel: never a squeezed desktop.
 *
 * Both are drawn on the server, complete; the story plays once the browser is
 * idle and the window is on screen (SceneDirector). The annotation is part of
 * the picture, so it is hidden from screen readers: the scene's own label
 * says what it shows.
 */
export function HeroScene() {
  return (
    <div className="sc-hero">
      <div aria-hidden="true" className="sc-hero-glow" />
      <div className="sc-hero-desk hidden md:block">
        <div className="sc-hero-rise">
          <Scene w={heroDesktop.w} h={heroDesktop.h} label={heroDesktop.label} script={heroDesktop.script} className="sc-hero-fit">
            {heroDesktop.render()}
          </Scene>
        </div>
        <div aria-hidden="true" className="sc sc-hero-note hidden lg:block" data-sc-scope="hero">
          <div data-sc-item="record" data-sc-state="off">
            <RecordCard e={heroRecord} />
          </div>
        </div>
      </div>
      <div className="sc-hero-rise mx-auto w-full max-w-[400px] md:hidden">
        <Scene w={heroPhone.w} h={heroPhone.h} label={heroPhone.label} script={heroPhone.script}>
          {heroPhone.render()}
        </Scene>
      </div>
    </div>
  )
}
