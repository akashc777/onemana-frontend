import { AppFrame } from "./AppFrame"
import { BoardColumn, BoardView, TaskCard, type Project } from "./BoardView"
import { Plate } from "./Gallery"
import { Scene } from "./Scene"
import { Sidebar } from "./Sidebar"
import { JONAS, MAYA, SAM } from "./data"
import { boardDesktop, boardPhone } from "./scenes/board"
import type { SceneSpec } from "./scenes/types"

/**
 * The board's plates for /playful-dev (Gallery.tsx). "tasks" is the live
 * demo's board as it was captured on 11 Oct 2026 (live-v3/tasks-*.png), with
 * the capture's own dates and the hues the demo's ids gave its people there,
 * to hold the drawing against the app. "tasks-tour" and "tasks-phone" are the
 * Tasks tab's scenes, playing (for reduced motion, their end).
 */

// The demo hashes a person's board avatar from their id: Sam and Jonas came
// out sun and Maya dusk in the capture (the channel's are from their names).
const LIVE_SAM = { ...SAM, hue: "sun" as const }
const LIVE_MAYA = { ...MAYA, hue: "dusk" as const }
const LIVE_JONAS = { ...JONAS, hue: "sun" as const }

const LIVE: Project = {
  name: "Q4 launch",
  hue: "sun",
  members: [LIVE_JONAS, LIVE_MAYA, LIVE_SAM],
  glance: { open: 6, week: 5, done: 11 },
  goal: { title: "Launch the Business tier", percent: 65 },
}

function LiveBoard() {
  return (
    <BoardView
      uid="bd-live"
      project={LIVE}
      columns={
        <>
          <BoardColumn name="To do" kind="todo" count={3}>
            <TaskCard card={{ title: "Review the pricing page copy", field: "Email", priority: 2, due: "Tomorrow", who: LIVE_SAM }} />
            <TaskCard card={{ title: "Record the product walkthrough", field: "Social", priority: 2, due: "15 Oct", who: LIVE_JONAS }} />
            <TaskCard card={{ title: "Update the onboarding checklist", priority: 1, due: "17 Oct", blocked: 1, who: LIVE_JONAS }} />
          </BoardColumn>
          <BoardColumn name="In progress" kind="progress" count={1}>
            <TaskCard card={{ title: "Write the launch announcement", field: "Blog", priority: 3, due: "Today", who: LIVE_SAM }} />
          </BoardColumn>
          <BoardColumn name="QA" kind="review" hue="dusk" count={1}>
            <TaskCard card={{ title: "Set up SSO for the pilot customer", priority: 3, due: "13 Oct", who: LIVE_MAYA }} />
          </BoardColumn>
          <BoardColumn name="Done" kind="done" count={11}>
            <TaskCard card={{ title: "Import #support history from Slack", priority: 2, due: "8 Oct", who: LIVE_MAYA, done: true }} />
          </BoardColumn>
        </>
      }
    />
  )
}

function ScenePlate({ name, spec }: { name: string; spec: SceneSpec }) {
  return (
    <Plate name={name} width={spec.w} height={spec.h}>
      <Scene w={spec.w} h={spec.h} label={spec.label} script={spec.script} window={false}>
        {spec.render()}
      </Scene>
    </Plate>
  )
}

export function Plates() {
  return (
    <>
      <Plate name="tasks" width={1120} height={700}>
        <AppFrame sidebar={<Sidebar place="project:Q4 launch" />}>
          <LiveBoard />
        </AppFrame>
      </Plate>
      <ScenePlate name="tasks-tour" spec={boardDesktop} />
      <ScenePlate name="tasks-phone" spec={boardPhone} />
    </>
  )
}
