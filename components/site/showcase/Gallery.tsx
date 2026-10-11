import type { ReactNode } from "react"

import "./showcase.css"
import { AppFrame, PhoneFrame } from "./AppFrame"
import { ChannelView, CheckinMessage, Message, PhoneChannel } from "./ChannelView"
import { DayPill, Mention } from "./parts"
import { Sidebar } from "./Sidebar"
import { DRILL, ENGINEERING, SAM } from "./data"
import { AgentRecordView } from "./AgentRecord"
import { Scene } from "./Scene"
import type { SceneSpec } from "./scenes/types"
import { heroDesktop, heroPhone } from "./scenes/hero"
import { chatDesktop, chatPhone } from "./scenes/chat"
import { agentsDesktop, agentsPhone } from "./scenes/agents"
import { Plates as BoardPlates } from "./Gallery.board"
import { Plates as DocPlates } from "./Gallery.doc"
import { Plates as CalendarPlates } from "./Gallery.calendar"
import { Plates as PalettePlates } from "./Gallery.palette"

/**
 * Every view of the kit at the size the live demo was captured at, for the
 * people building the site to hold against the app (/playful-dev, which is a
 * 404 in production). Each sits in a [data-gallery] box a shot can be taken
 * of on its own.
 */
export function Plate({ name, width, height, children }: { name: string; width: number; height: number; children: ReactNode }) {
  return (
    <figure className="m-0 space-y-2">
      <figcaption className="text-caption text-muted-foreground">
        {name} · {width} × {height}
      </figcaption>
      <div data-gallery={name} style={{ width, height }} className="overflow-hidden">
        {children}
      </div>
    </figure>
  )
}

const P = ENGINEERING.posts

export function engineeringHistory(phone = false) {
  return (
    <>
      {!phone && <CheckinMessage question={ENGINEERING.checkin.question} answered={ENGINEERING.checkin.answered} at="5:00 PM" faces={[]} />}
      <DayPill>Yesterday</DayPill>
      <Message by={P.rc.by} at={P.rc.at} phone={phone}>
        {P.rc.text}
      </Message>
      <Message by={P.loadTest.by} at={P.loadTest.at} phone={phone}>
        {P.loadTest.text}
      </Message>
      <Message by={P.checklist.by} at={P.checklist.at} provenance phone={phone}>
        {P.checklist.text}
      </Message>
      <Message by={P.rollback.by} at={P.rollback.at} forMe phone={phone}>
        <Mention kind="me">{SAM.name}</Mention> {P.rollback.text}
      </Message>
      <Message by={P.decisions.by} at={P.decisions.at} phone={phone}>
        {P.decisions.text}
      </Message>
      <Message by={P.announcement.by} at={P.announcement.at} phone={phone}>
        {P.announcement.text}
      </Message>
    </>
  )
}

/** A scene at its design size, playing its script (or its end, for a reader who asked for less motion). */
function ScenePlate({ name, spec }: { name: string; spec: SceneSpec }) {
  return (
    <Plate name={name} width={spec.w} height={spec.h}>
      <Scene w={spec.w} h={spec.h} label={spec.label} script={spec.script} window={false}>
        {spec.render()}
      </Scene>
    </Plate>
  )
}

export function ShowcaseGallery() {
  return (
    <div className="space-y-10">
      <ScenePlate name="hero-scene" spec={heroDesktop} />
      <ScenePlate name="hero-phone" spec={heroPhone} />
      <ScenePlate name="chat-tour" spec={chatDesktop} />
      <ScenePlate name="chat-phone" spec={chatPhone} />
      <ScenePlate name="agents-tour" spec={agentsDesktop} />
      <ScenePlate name="agents-phone" spec={agentsPhone} />
      <Plate name="channel" width={1120} height={700}>
        <AppFrame sidebar={<Sidebar place="channel:engineering" />}>
          <ChannelView
            name="engineering"
            people={ENGINEERING.members}
            count={ENGINEERING.memberCount}
            items={engineeringHistory()}
            placeholder="Message #engineering, or ask @Release Captain"
          />
        </AppFrame>
      </Plate>
      <Plate name="channel-phone" width={390} height={590}>
        <PhoneFrame>
          <PhoneChannel name="engineering" subtitle="4 members · 1 agent" items={engineeringHistory(true)} placeholder="Message or ask @Release" />
        </PhoneFrame>
      </Plate>
      <Plate name="agents" width={1120} height={700}>
        <AppFrame sidebar={<Sidebar place="inbox" />}>
          <AgentRecordView
            entries={[
              { ...DRILL.refused, at: "6:38 AM" },
              { ...DRILL.attempt, at: "6:38 AM" },
              { ...DRILL.refused, at: "6:29 AM" },
              { ...DRILL.attempt, at: "6:29 AM" },
              { ...DRILL.refused, at: "6:29 AM" },
              { ...DRILL.attempt, at: "6:29 AM" },
              { ...DRILL.refused, at: "12:30 AM" },
              { ...DRILL.attempt, at: "12:30 AM" },
            ]}
          />
        </AppFrame>
      </Plate>
      <BoardPlates />
      <DocPlates />
      <CalendarPlates />
      <PalettePlates />
    </div>
  )
}
