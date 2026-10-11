import type { CSSProperties } from "react"

import { AppFrame, PhoneFrame } from "../AppFrame"
import {
  BoardColumn,
  BoardView,
  ColumnFoot,
  ColumnOver,
  PHONE_COLUMN_STEP,
  PhoneBoardView,
  StatusGlyph,
  TaskCard,
  Tick,
  type Card,
  type Project,
} from "../BoardView"
import { JONAS, MAYA, SAM } from "../data"
import type { Script } from "../SceneDirector"
import { SIZES, type SceneSpec } from "./types"

/**
 * THE TASKS TAB'S MOMENT: Maya's "Set up SSO for the pilot customer" leaves
 * QA for Done. The card is picked up (its copy lifts 3% and tilts, a dashed
 * slot stays behind), carried to Done, which lights while it is over it and
 * makes room, and put down; it lands done, the moss check springs, the
 * columns' counts tick, and the project's line under its name moves with it.
 *
 * The board is the demo's Q4 launch (business/DemoSeed CuratedProject),
 * scrolled to its last two columns, under the project's own header (the
 * breadcrumb bar above it, which names the project again, is left out so the
 * columns hold whole cards); dates beyond tomorrow are weekdays, so the scene
 * never goes stale. Everything is laid out where it ends from the
 * start and only moves (BoardView, board.css "the moment").
 */

const PROJECT: Project = {
  name: "Q4 launch",
  hue: "sun",
  members: [JONAS, MAYA, SAM],
  glance: {
    open: <Tick from={6} to={5} item="glance" />,
    week: <Tick from={5} to={4} item="glance" />,
    done: <Tick from={11} to={12} item="glance" />,
  },
  goal: { title: "Launch the Business tier", percent: 65 },
  // The line as a reader who may not post an update sees it (no health
  // chip), so the goal keeps its whole name in the tour's narrow window.
  health: false,
}

const SSO: Card = { title: "Set up SSO for the pilot customer", priority: 3, due: "Wed", who: MAYA }

/**
 * Done, most recent first: the card that lands goes on top of these. Each
 * list is cut to its column so that before the move and after it the
 * column ends on a card's edge, never through one: on the desktop's 280px
 * column, two cards of two lines (94px each, 196 of room); on the phone's
 * 328px one, a card with its Channel (98) over a one-line card (74), and
 * after the landing the 74px card over the 98 (180 of room).
 */
const DONE_DESKTOP: Card[] = [
  { title: "Import #support history from Slack", priority: 2, who: MAYA, done: true },
  { title: "Update the help centre screenshots", priority: 1, who: JONAS, done: true },
  { title: "Plan the load test", priority: 3, who: JONAS, done: true },
]
const DONE_PHONE: Card[] = [
  { title: "Write the pricing FAQ", field: "Blog", priority: 2, who: MAYA, done: true },
  { title: "Import #support history from Slack", priority: 2, who: MAYA, done: true },
  { title: "Plan the load test", priority: 3, who: JONAS, done: true },
]

/** The moving card's height: 12 + two lines of title + 8 + the 22px meta row + 12 on a 280px column. */
const DESKTOP_CARD = 94
/** On the phone's 328px column its title takes one line. */
const PHONE_CARD = 74
const GAP = 8

/**
 * The four columns, To do to Done; the two in view arrive in turn when the
 * tab is picked. In QA, the card that will be picked up over its dashed
 * slot; in Done, the card that lands (out of sight) over the rest, which
 * stand where it will be until they make room.
 */
function columns(card: number, done: Card[]) {
  const room = { "--bd-room": `${-(card + GAP)}px` } as CSSProperties
  return (
    <>
      <BoardColumn name="To do" kind="todo" count={3}>
        <TaskCard card={{ title: "Review the pricing page copy", field: "Email", priority: 2, due: "Tomorrow", who: SAM }} />
        <TaskCard card={{ title: "Record the product walkthrough", field: "Social", priority: 2, due: "Fri", who: JONAS }} />
        <TaskCard card={{ title: "Update the onboarding checklist", priority: 1, due: "Sun", blocked: 1, who: JONAS }} />
      </BoardColumn>
      <BoardColumn name="In progress" kind="progress" count={1}>
        <TaskCard card={{ title: "Write the launch announcement", field: "Blog", priority: 3, due: "Today", who: SAM }} />
      </BoardColumn>
      <BoardColumn
        name="QA"
        kind="review"
        hue="dusk"
        count={<Tick from={1} to={0} item="qa-n" />}
        foot={<ColumnFoot data-sc-item="empty" data-bd="empty" data-sc-state="off" />}
        enter
      >
        <div className="relative flex-none">
          <span className="bd-slot" data-sc-item="slot" data-bd="slot" data-sc-state="off" />
          <TaskCard card={SSO} data-sc-item="src" data-bd="src" data-sc-state="off" />
        </div>
      </BoardColumn>
      <BoardColumn
        name="Done"
        kind="done"
        count={<Tick from={11} to={12} item="done-n" />}
        over={<ColumnOver data-sc-item="over" data-bd="over" data-sc-state="off" />}
        enter
      >
        <TaskCard
          card={{ ...SSO, done: true }}
          check={
            <span className="flex" data-sc-item="check" data-bd="check" data-sc-state="off">
              <StatusGlyph kind="done" size={14} />
            </span>
          }
          data-sc-item="land"
          data-bd="land"
          data-sc-state="off"
        />
        <div className="flex flex-none flex-col gap-2" data-sc-item="room" data-bd="room" data-sc-state="off" style={room}>
          {done.map((c) => (
            <TaskCard key={c.title} card={c} />
          ))}
        </div>
      </BoardColumn>
    </>
  )
}

/**
 * The copy in the hand, over QA's first slot (8px in, under the 40px head).
 * `move` carries it to Done on the desktop; on a phone the board moves under
 * it instead.
 */
function Fly({ width, move }: { width: number; move?: number }) {
  const card = (
    <div data-sc-item="lift" data-bd="lift" data-sc-state="off">
      <TaskCard card={SSO} />
    </div>
  )
  return (
    <div className="bd-fly" style={{ left: 8, top: 40, width }} data-sc-item="fly" data-bd="fly" data-sc-state="off">
      {move ? (
        <div data-sc-item="move" data-bd="move" data-sc-state="off" style={{ "--bd-move": `${move}px` } as CSSProperties}>
          {card}
        </div>
      ) : (
        card
      )}
    </div>
  )
}

/** Lift, carry, light Done, make room, put down; it lands done, then the counts and the line move. */
export const boardScript: Script = {
  delay: 700,
  plays: 1,
  steps: [
    { at: 0, on: ["src", "slot", "fly", "lift"] },
    { at: 420, on: ["move"] },
    { at: 560, on: ["over"] },
    { at: 700, on: ["room"] },
    { at: 1050, off: ["lift", "over"] },
    { at: 1260, off: ["fly", "slot"], on: ["land", "qa-n", "done-n", "empty"] },
    { at: 1340, on: ["check"] },
    { at: 1520, on: ["glance"] },
  ],
}

/** On a phone: lift, the board scrolls a column to Done under the card, then the same landing. */
export const boardPhoneScript: Script = {
  delay: 700,
  plays: 1,
  steps: [
    { at: 0, on: ["src", "slot", "fly", "lift"] },
    { at: 380, on: ["scroll", "pager"] },
    { at: 640, on: ["over"] },
    { at: 740, on: ["room"] },
    { at: 1040, off: ["lift", "over"] },
    { at: 1240, off: ["fly", "slot"], on: ["land", "qa-n", "done-n", "empty"] },
    { at: 1320, on: ["check"] },
    { at: 1500, on: ["glance"] },
  ],
}

/** The board's sideways scroll on the desktop: two columns and their gaps, so QA is first in view. */
const DESKTOP_SCROLL = 2 * (280 + 12)

export const boardDesktop: SceneSpec = {
  ...SIZES.tour,
  label:
    "The Q4 launch project's board in OneCamp, at its QA and Done columns: Maya Chen's task “Set up SSO for the pilot customer” is dragged from QA to Done and checked off, and the project's line changes to 5 open, 4 due this week and 12 done.",
  script: boardScript,
  render: () => (
    <AppFrame>
      <BoardView uid="bd-tour" project={PROJECT} bar={false} columns={columns(DESKTOP_CARD, DONE_DESKTOP)} scroll={DESKTOP_SCROLL} overlay={<Fly width={264} move={280 + 12} />} enter />
    </AppFrame>
  ),
}

export const boardPhone: SceneSpec = {
  ...SIZES.phone,
  label:
    "The Q4 launch project's board on a phone, a column at a time: the task “Set up SSO for the pilot customer” is picked up in QA, the board scrolls to Done under it, and it lands there checked off, as the project's line changes to 5 open, 4 due this week and 12 done.",
  script: boardPhoneScript,
  render: () => (
    <PhoneFrame tab="more">
      <PhoneBoardView
        uid="bd-phone"
        project={PROJECT}
        columns={columns(PHONE_CARD, DONE_PHONE)}
        count={4}
        at={2}
        row={{
          "data-sc-item": "scroll",
          "data-bd": "scroll",
          "data-sc-state": "off",
          style: { "--bd-from": `${-2 * PHONE_COLUMN_STEP}px`, "--bd-to": `${-3 * PHONE_COLUMN_STEP}px` } as CSSProperties,
        }}
        pager={
          <div className="bd-pager">
            <span />
            <span />
            <span>
              <i data-sc-item="pager" data-bd="dot-from" data-sc-state="off" />
            </span>
            <span>
              <i data-sc-item="pager" data-bd="dot-to" data-sc-state="off" />
            </span>
          </div>
        }
        overlay={<Fly width={312} />}
        enter
      />
    </PhoneFrame>
  ),
}
