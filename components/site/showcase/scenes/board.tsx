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
import { pathAt, type PathKey } from "../motion/engine"
import { PointerLayer } from "../motion/Pointer"
import type { Script } from "../SceneDirector"
import { SIZES, type SceneSpec } from "./types"

/**
 * THE TASKS TAB'S MOMENT, as the app's board drags (TaskBoard on dnd-kit):
 * Maya's "Set up SSO for the pilot customer" leaves QA for Done. The pointer
 * comes to the card (an open hand over it), presses (closed), and after 5px
 * the copy in the hand lifts 3% and tilts towards the move while a dashed
 * slot stays behind; the hand carries it to Done, which lights while the
 * card is over it and makes room; let go, the copy settles into its place
 * over 200ms, the card lands done, flashes and its check springs, the
 * columns' counts tick and the project's line under its name moves with it.
 * On a phone the card is held (it dips, then lifts without a tilt), carried
 * to the screen's edge, the board scrolls a column to Done under it, and it
 * is put down there.
 *
 * The board is the demo's Q4 launch (business/DemoSeed CuratedProject),
 * scrolled to its last two columns, under the project's own header (the
 * breadcrumb bar above it, which names the project again, is left out so the
 * columns hold whole cards); dates beyond tomorrow are weekdays, so the scene
 * never goes stale. Everything is laid out where it ends from the start and
 * only moves (BoardView, board.css "the moment").
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
        <div className="relative flex-none" data-sc-item="src-press" data-bd="press" data-sc-state="off">
          <span className="bd-slot" data-sc-item="slot" data-bd="slot" data-sc-state="off" />
          <TaskCard card={SSO} data-sc-item="src" data-bd="src" data-sc-state="off" data-sc-target="bd-src" />
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
          under={<span className="bd-flash" data-sc-item="flash" data-bd="flash" data-sc-state="off" />}
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
 * The copy in the hand (DragOverlay), over QA's first card (8px in, under
 * the 40px head): moved by the scene's path, lifted and tilted by its own
 * transform, and settled back flat for the drop.
 */
function Fly({ width, phone }: { width: number; phone?: boolean }) {
  return (
    <div className="bd-fly" style={{ left: 8, top: 40, width }} data-sc-path="bd-fly" data-sc-item="fly" data-bd="fly" data-sc-state="off">
      <div className="bd-lift" data-sc-item="lift" data-bd="lift" data-phone={phone ? "" : undefined} data-sc-state="off">
        <TaskCard card={SSO} />
      </div>
    </div>
  )
}

/** Where the hand holds the card: 62% across it, 45% down. */
const HOLD = { to: "bd-src", fx: 0.62, fy: 0.45 }

/** The columns' step: 280px and their 12px gap. */
const STEP = 280 + 12

/* The desktop's beats, in ms from the start of a play. */
const REACH = 760
const PRESS = 900
const PICK = 990
const CARRY = 1720
const SETTLE = 1930
const LET_GO = 2020
const DROPPED = LET_GO + 200

/** The carry, as the card moves from where it was picked up: a hand's reach to Done, a little past and back, and still. */
const CARRY_KEYS: PathKey[] = [
  { at: PRESS, x: 0, y: 0 },
  { at: PICK, x: 6, y: 1, ease: "linear" },
  { at: CARRY, x: STEP + 7, y: 5, ease: "move", arc: -14 },
  { at: SETTLE, x: STEP + 1, y: 2, ease: "move" },
]

/** When the copy is over Done: past the half of the step. */
function overDone(keys: PathKey[], from: number, to: number): number {
  for (let t = from; t <= to; t += 5) if (pathAt(keys, t).x >= STEP / 2) return t
  return to
}

/** Lift, carry, light Done, make room, put down; it lands done, flashes, then the counts and the line move. */
export const boardScript: Script = {
  delay: 700,
  plays: 1,
  steps: [
    { at: 0, on: ["bd-ptr"] },
    // Over the card: an open hand. Pressed: closed.
    { at: REACH, off: ["bd-ptr-arrow"], on: ["bd-ptr-grab"] },
    { at: PRESS, off: ["bd-ptr-grab"], on: ["bd-ptr-grabbing"] },
    // 5px of travel: the copy lifts in the hand, the dashed slot stays behind.
    { at: PICK, on: ["src", "slot", "fly", "lift"] },
    { at: overDone(CARRY_KEYS, PICK, SETTLE), on: ["over", "room"] },
    // Let go: it settles into its place, flat, over 200ms.
    { at: LET_GO, off: ["lift", "over", "bd-ptr-grabbing"], on: ["bd-ptr-grab"] },
    { at: DROPPED, off: ["fly", "slot"], on: ["land", "qa-n", "done-n", "empty", "check"] },
    { at: DROPPED + 200, on: ["flash"] },
    { at: DROPPED + 220, off: ["flash"] },
    { at: DROPPED + 260, on: ["glance"] },
  ],
  paths: {
    "bd-fly": [...CARRY_KEYS, { at: LET_GO, x: STEP + 1, y: 2 }, { at: DROPPED, x: STEP, y: 0, ease: "drop" }],
    "bd-ptr": [
      { at: 0, x: SIZES.tour.w + 30, y: 420 },
      { at: REACH, ...HOLD, x: 0, y: 0, ease: "move", arc: 26 },
      ...CARRY_KEYS.map((k) => ({ ...k, ...HOLD })),
    ],
  },
}

/* The phone's beats. */
const P_HOLD = 180
const P_EDGE = 720
const P_SCROLL = 760
const P_BACK = 1300
const P_LET_GO = 1700
const P_DROPPED = P_LET_GO + 200

/** On a phone: held, carried to the edge, the board scrolls a column to Done under it, put down there. */
export const boardPhoneScript: Script = {
  delay: 700,
  plays: 1,
  steps: [
    // The finger: the card dips at once (90ms) and is lifted after the 180ms hold, without a tilt.
    { at: 0, on: ["src-press"] },
    { at: P_HOLD, off: ["src-press"], on: ["src", "slot", "fly", "lift"] },
    // At the edge the board scrolls a column, Done under the card.
    { at: P_SCROLL, on: ["scroll", "pager"] },
    { at: P_SCROLL + 300, on: ["over", "room"] },
    { at: P_LET_GO, off: ["lift", "over"] },
    { at: P_DROPPED, off: ["fly", "slot"], on: ["land", "qa-n", "done-n", "empty", "check"] },
    { at: P_DROPPED + 200, on: ["flash"] },
    { at: P_DROPPED + 220, off: ["flash"] },
    { at: P_DROPPED + 260, on: ["glance"] },
  ],
  paths: {
    "bd-fly": [
      { at: P_HOLD, x: 0, y: 0 },
      { at: P_EDGE, x: 78, y: -4, ease: "move", arc: -6 },
      { at: P_BACK, x: 78, y: -4 },
      { at: P_LET_GO - 60, x: 8, y: 0, ease: "move" },
      { at: P_LET_GO, x: 8, y: 0 },
      { at: P_DROPPED, x: 0, y: 0, ease: "drop" },
    ],
  },
}

/** The board's sideways scroll on the desktop: two columns and their gaps, so QA is first in view. */
const DESKTOP_SCROLL = 2 * STEP

export const boardDesktop: SceneSpec = {
  ...SIZES.tour,
  label:
    "The Q4 launch project's board in OneCamp, at its QA and Done columns: Maya Chen's task “Set up SSO for the pilot customer” is dragged from QA to Done and checked off, and the project's line changes to 5 open, 4 due this week and 12 done.",
  script: boardScript,
  render: () => (
    <>
      <AppFrame>
        <BoardView uid="bd-tour" project={PROJECT} bar={false} columns={columns(DESKTOP_CARD, DONE_DESKTOP)} scroll={DESKTOP_SCROLL} overlay={<Fly width={264} />} enter />
      </AppFrame>
      <PointerLayer id="bd-ptr" shapes={["arrow", "grab", "grabbing"]} />
    </>
  ),
}

export const boardPhone: SceneSpec = {
  ...SIZES.phone,
  label:
    "The Q4 launch project's board on a phone, a column at a time: the task “Set up SSO for the pilot customer” is picked up in QA, carried to the edge as the board scrolls to Done under it, and put down there checked off, as the project's line changes to 5 open, 4 due this week and 12 done.",
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
        overlay={<Fly width={312} phone />}
        enter
      />
    </PhoneFrame>
  ),
}

