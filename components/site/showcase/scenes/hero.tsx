import { AppFrame, PhoneFrame } from "../AppFrame"
import { OutcomeTag } from "../AgentRecord"
import { ChannelView, Message, PhoneChannel, TypingLine } from "../ChannelView"
import { Mention } from "../parts"
import { Sidebar } from "../Sidebar"
import { CAPTAIN, ENGINEERING, JONAS, SAM, STORY } from "../data"
import type { Script } from "../SceneDirector"
import { SIZES, type SceneSpec } from "./types"

/**
 * THE HERO'S STORY, in #engineering on the demo's own day: the team gets
 * the release ready, then Jonas asks the Release Captain to post the Q3
 * numbers in #finance. The agent can do only what Jonas can, and Jonas is not
 * in #finance: it says so, the refusal is tagged, and (beside the window) the
 * record of the attempt arrives with Prove it.
 *
 * The conversation is complete before anything plays; the story's messages
 * wait under it, laid out, and rise into place (SceneDirector).
 */

const P = ENGINEERING.posts

/**
 * The conversation before the story. Sized with the window so that both of
 * its states are whole: before, every row sits under the header; after the
 * story's two messages rise, the agent's checklist is the first row in view.
 */
function history(phone: boolean) {
  return (
    <>
      {!phone && (
        <>
          <Message by={P.rc.by} at={P.rc.at}>
            {P.rc.text}
          </Message>
          <Message by={P.loadTest.by} at={P.loadTest.at}>
            {P.loadTest.text}
          </Message>
        </>
      )}
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

function arrivals(phone: boolean) {
  return (
    <>
      <Message id="ask" state="off" by={STORY.ask.by} at={STORY.ask.at} phone={phone}>
        <Mention kind="agent">{CAPTAIN.name}</Mention> {phone ? STORY.ask.phoneText : STORY.ask.text}
      </Message>
      <Message
        id="reply"
        state="off"
        by={STORY.reply.by}
        at={STORY.reply.at}
        phone={phone}
        provenance={{ for: JONAS.name }}
        after={
          <div className="mt-1.5 flex" data-sc-item="refused" data-sc-pop="" data-sc-state="off">
            <OutcomeTag outcome="refused" />
          </div>
        }
      >
        {STORY.reply.text}
      </Message>
    </>
  )
}

/** Jonas asks; the agent works; it answers that it can't; the refusal is tagged; the record arrives. */
export const heroScript: Script = {
  scope: "hero",
  delay: 900,
  plays: 3,
  rest: 7000,
  steps: [
    { at: 0, on: ["ask"], rise: ["ask"] },
    { at: 1100, on: ["typing"] },
    { at: 2900, off: ["typing"], on: ["reply"], rise: ["reply"] },
    { at: 3600, on: ["refused"] },
    { at: 4400, on: ["record"] },
  ],
}

const LABEL =
  "OneCamp's #engineering channel: the team readies the Q4 launch, then Jonas asks the Release Captain agent to post the Q3 numbers in #finance. The agent replies that it can't, because Jonas isn't a member of #finance, and the refusal is on the record."

export const heroDesktop: SceneSpec = {
  ...SIZES.hero,
  label: LABEL,
  script: heroScript,
  render: () => (
    <AppFrame sidebar={<Sidebar place="channel:engineering" compact />}>
      <ChannelView
        name="engineering"
        people={ENGINEERING.members}
        count={ENGINEERING.memberCount}
        items={history(false)}
        arrivals={arrivals(false)}
        typing={<TypingLine id="typing" state="off" who={CAPTAIN.name} agent />}
        placeholder="Message #engineering, or ask @Release Captain"
      />
    </AppFrame>
  ),
}

export const heroPhone: SceneSpec = {
  ...SIZES.phone,
  label: LABEL,
  script: { ...heroScript, scope: undefined, steps: heroScript.steps.filter((s) => !s.on?.includes("record")) },
  render: () => (
    <PhoneFrame>
      <PhoneChannel
        name="engineering"
        subtitle="4 members · 1 agent"
        items={history(true)}
        arrivals={arrivals(true)}
        typing={<TypingLine id="typing" state="off" who={CAPTAIN.name} agent />}
        placeholder="Message or ask @Release"
      />
    </PhoneFrame>
  ),
}

/** The record of the attempt, for the card beside the window. */
export const heroRecord = { ...STORY.record }
