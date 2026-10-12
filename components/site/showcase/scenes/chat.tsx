import { AppFrame, PhoneFrame } from "../AppFrame"
import { ChannelView, Message, PhoneChannel, TypingLine } from "../ChannelView"
import { DayPill, Mention } from "../parts"
import { DESIGN, MAYA, SAM } from "../data"
import type { Script } from "../SceneDirector"
import { SIZES, type SceneSpec } from "./types"

/**
 * The Chat tab: #design on the demo's day. The moment is the conversation
 * going on while you watch, as the app shows it: "Maya Chen is typing" on the
 * line over the composer (sent from her first key, kept up while she types),
 * then her answer lands: the line goes at once, the list keeps to the end (it
 * snaps, it doesn't scroll) and her message comes up 6px as it appears
 * (msg-in, 200ms).
 */
const P = DESIGN.posts

function rows(phone: boolean) {
  return (
    <>
      <div data-sc-enter="">
        <DayPill>Today</DayPill>
      </div>
      {[P.hero, P.fits, P.tap, P.ship].map((m, i) => (
        <div key={i} data-sc-enter="">
          <Message by={m.by} at={m.at} forMe={i === 0} phone={phone}>
            {i === 0 ? (
              <>
                {m.text} <Mention kind="me">{SAM.name}</Mention>, want a look before it ships?
              </>
            ) : (
              m.text
            )}
          </Message>
        </div>
      ))}
    </>
  )
}

const reply = (phone: boolean) => (
  <Message id="reply" state="off" by={DESIGN.reply.by} at={DESIGN.reply.at} phone={phone}>
    {DESIGN.reply.text}
  </Message>
)

export const chatScript: Script = {
  delay: 700,
  plays: 1,
  stagger: 45,
  steps: [
    { at: 0, on: ["typing"] },
    { at: 2600, off: ["typing"], on: ["reply"], rise: ["reply"] },
  ],
}

const LABEL = "OneCamp's #design channel: Maya, Jonas and Sam agree the launch page's hero, and Maya answers while you watch."

export const chatDesktop: SceneSpec = {
  ...SIZES.tour,
  label: LABEL,
  script: chatScript,
  render: () => (
    <AppFrame>
      <ChannelView
        name={DESIGN.name}
        people={DESIGN.members}
        count={DESIGN.memberCount}
        agents={0}
        items={rows(false)}
        arrivals={reply(false)}
        typing={<TypingLine id="typing" state="off" who={MAYA.name} />}
        placeholder="Message #design"
        hint={false}
      />
    </AppFrame>
  ),
}

export const chatPhone: SceneSpec = {
  ...SIZES.phone,
  label: LABEL,
  script: chatScript,
  render: () => (
    <PhoneFrame>
      <PhoneChannel
        name={DESIGN.name}
        subtitle="3 members"
        items={rows(true)}
        arrivals={reply(true)}
        typing={<TypingLine id="typing" state="off" who={MAYA.name} />}
        placeholder="Message #design"
      />
    </PhoneFrame>
  ),
}
