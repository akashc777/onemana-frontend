import { AppFrame, PhoneFrame } from "../AppFrame"
import { Block, CalendarWeek, DEMO_WEEK, HOUR, PhoneCalendarDay, addDays, clock, mondayOf, utcDay, weekday, type TimedItem } from "../CalendarWeek"
import { EventDialog, Ghost, HoverBand, QuickCreateCard, span } from "../QuickCreate"
import { keyTimes, lastTime } from "../motion/cadence"
import { pathAt, type PathKey } from "../motion/engine"
import { PointerLayer } from "../motion/Pointer"
import type { Script, Step } from "../SceneDirector"
import { SIZES, type SceneSpec } from "./types"

/**
 * The Calendar tab's moment, as the app makes an event (weekView,
 * quickCreateCard): the pointer comes to Thursday at 2 PM, where the
 * 15-minute band shows its time; it presses and drags down to 3 PM, the
 * ghost growing a quarter of an hour at a time with its times; on release
 * the quick-create card opens beside it, "Kickoff with Acme" is typed (the
 * card takes "with Acme" as a guest as it is typed), ⏎ saves it, and the
 * event is in the week. On a phone, a tap on 2 PM opens the full dialog
 * instead, where the title is typed and the event created.
 *
 * The week is the real one, worked out when the page is drawn: this week
 * until Thursday, then the next, so the kickoff is never made in the past.
 * Now is a working morning, 11:40, wherever the reader is: the picture is a
 * calendar at work, not a clock.
 */

/** The time of day the scenes show. */
const NOW_MIN = 11 * 60 + 40

/** Thursday, the day the kickoff is made on. */
const THURSDAY = 3

/** What is typed, and what the app understands in it (the name after "with"). */
const TITLE = "Kickoff with Acme"
const NAME = TITLE.indexOf("Acme")

/** The week a scene shows, and today's place in it (-1 when it isn't in it). */
export function sceneWeek(now: Date): { monday: Date; today: number } {
  const today = utcDay(now)
  const day = weekday(today)
  if (day <= THURSDAY) return { monday: mondayOf(today), today: day }
  return { monday: addDays(mondayOf(today), 7), today: -1 }
}

const DAYS3 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
/** "Thu 15 Oct" (the card's EEE d MMM). */
const dayLabel = (d: Date) => `${DAYS3[weekday(d)]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`

/**
 * The tab's window gives the sheet 636 by 504, where the app's week (seven
 * columns of at least 90px, a header that needs about 850px) does not fit.
 * It is drawn at 1:1 all the same, narrowed as a narrower calendar would be:
 * four days, Monday to Thursday, under the compact header.
 */
const DAYS = [0, 1, 2, 3]

/** The grid's place in the tour's window: the sheet 8px in, the header, the day heads and the all-day rail above it (calendar.css). */
const SHEET = 8
const CHROME = 52 + 57 + 33
const GUTTER = 56
/** Where the grid is scrolled to: 11:15 at its top, so the afternoon is in view and the card fits under 2 PM. */
const TOUR_FROM = 11.25
/** A minute's height in the window (the grid opens 12px above its first hour). */
const yOf = (min: number) => SHEET + CHROME + 12 + (min / 60 - TOUR_FROM) * HOUR
/** Thursday's column, across the sheet's 636px. */
const COL = (SIZES.tour.w - 2 * SHEET - GUTTER) / 4
const xThu = SHEET + GUTTER + 3 * COL

/** The minutes the drag runs: pressed at 2:04, let go at 2:56. */
const PRESS_MIN = 14 * 60 + 4
const LET_GO_MIN = 14 * 60 + 56

/* The beats, in ms from the start of a play. */
const COME = 0
const PRESS = 900
const LET_GO = 1900
const OPEN = LET_GO + 40
const TYPE = OPEN + 380
const KEYS = keyTimes(TITLE, "sam-names", { pace: 78 })
const SAVE = TYPE + lastTime(KEYS) + 520
const FETCHED = SAVE + 240

/** The pointer: in from the window's right edge to 2:04 on Thursday, a beat, then down to 2:56 (a slow, steady drag), held there. */
const POINTER: PathKey[] = [
  { at: COME, x: SIZES.tour.w + 40, y: yOf(PRESS_MIN) + 26 },
  { at: PRESS - 160, x: xThu + 72, y: yOf(PRESS_MIN), ease: "move", arc: -16 },
  { at: PRESS + 60, x: xThu + 72, y: yOf(PRESS_MIN) },
  { at: LET_GO, x: xThu + 75, y: yOf(LET_GO_MIN), ease: "move", arc: 3 },
]

/** When the pointer is first at `min` or lower, sampling its path. */
function reaches(min: number, from: number, to: number): number {
  for (let t = from; t <= to; t += 5) if (pathAt(POINTER, t).y >= yOf(min)) return t
  return to
}
/** When it first comes over Thursday's column. */
function overThursday(): number {
  for (let t = COME; t <= PRESS; t += 5) if (pathAt(POINTER, t).x <= SIZES.tour.w - SHEET) return t
  return PRESS
}

/**
 * The ghost as the drag draws it (weekView, calendarDrag): a press draws a
 * click's half hour, 2:00 to 2:30; once the pointer has gone 4 minutes it is
 * the drag's own, from 2:00 to the next quarter past it, so it drops to
 * 2:15 and grows again a quarter at a time.
 */
const GHOSTS: { end: number; item: string }[] = [
  { end: 14 * 60 + 15, item: "cal-g15" },
  { end: 14 * 60 + 30, item: "cal-g30" },
  { end: 14 * 60 + 45, item: "cal-g45" },
  { end: 15 * 60, item: "cal-g60" },
]

function dragSteps(): Step[] {
  const steps: Step[] = []
  let shown = "cal-g30"
  const at = (t: number, item: string) => {
    steps.push({ at: t, off: [shown], on: [item] })
    shown = item
  }
  // 4 minutes of travel make it a drag: 2:00 to 2:15.
  at(reaches(PRESS_MIN + 5, PRESS, LET_GO), "cal-g15")
  // Past each quarter, the next.
  at(reaches(14 * 60 + 15 + 1, PRESS, LET_GO), "cal-g30")
  at(reaches(14 * 60 + 30 + 1, PRESS, LET_GO), "cal-g45")
  at(reaches(14 * 60 + 45 + 1, PRESS, LET_GO), "cal-g60")
  return steps
}

/** The guests chip as the title is typed: the card reads a name after "with" once two of its letters are in. */
const GUESTS = [
  { text: "Add guests", item: { id: "cal-chips0" } },
  { text: "Ac", item: { id: "cal-chips1", state: "off" as const } },
  { text: "Acm", item: { id: "cal-chips2", state: "off" as const } },
  { text: "Acme", item: { id: "cal-chips3", state: "off" as const } },
]

const desktopScript: Script = {
  plays: 1,
  delay: 700,
  stagger: 30,
  steps: [
    { at: COME, on: ["cal-ptr"] },
    { at: overThursday(), on: ["cal-band"] },
    // The press: the band goes, the click's half hour is drawn.
    { at: PRESS, off: ["cal-band"], on: ["cal-g30"] },
    ...dragSteps(),
    // Let go: the card opens beside the ghost a frame later, its title ready for keys.
    { at: OPEN, on: ["cal-card"] },
    { at: TYPE, type: ["qc-title"], off: ["cal-qc-ph"], on: ["cal-qc-text"] },
    ...GUESTS.slice(1).map((g, i) => ({ at: TYPE + KEYS[NAME + 1 + i], off: [GUESTS[i].item.id], on: [g.item.id] })),
    // ⏎: the card closes and the ghost with it; the calendar fetches, and the event is there, under the pointer.
    { at: SAVE, off: ["cal-card", "cal-g60"] },
    { at: FETCHED, on: ["cal-event", "cal-ptr-grab"], off: ["cal-ptr-cell"] },
  ],
  paths: { "cal-ptr": POINTER },
}

/** The event the card makes: the OneCamp calendar's sky (calendarTones CALENDAR_HUE). */
const KICKOFF: TimedItem = { title: TITLE, day: THURSDAY, start: 14 * 60, end: 15 * 60, hue: "sky" }

export function CalendarTour({ now = new Date(), final = false }: { now?: Date; final?: boolean }) {
  const { monday, today } = sceneWeek(now)
  const thursday = addDays(monday, THURSDAY)
  return (
    <>
      <AppFrame>
        <CalendarWeek
          compact
          monday={monday}
          days={DAYS}
          today={today}
          nowMin={NOW_MIN}
          timed={DEMO_WEEK.timed}
          allDay={DEMO_WEEK.allDay}
          fromHour={TOUR_FROM}
          span={8}
          extra={(day, h0) =>
            day === THURSDAY ? (
              <>
                <HoverBand min={14 * 60} h0={h0} item={{ id: "cal-band", state: "off" }} />
                {GHOSTS.map((g) => (
                  <Ghost key={g.item} start={14 * 60} end={g.end} h0={h0} item={{ id: g.item, state: "off" }} />
                ))}
                <div className="sc-qc-anchor" style={{ top: (14 - h0) * HOUR }}>
                  <QuickCreateCard
                    title={TITLE}
                    mark={[NAME, NAME + 4, 2]}
                    date={dayLabel(thursday)}
                    time={span(14 * 60, 15 * 60)}
                    guests={GUESTS}
                    card={{ id: "cal-card", state: "off" }}
                    typed={{ ph: { id: "cal-qc-ph" }, text: { id: "cal-qc-text", state: "off" } }}
                  />
                </div>
                <Block item={KICKOFF} h0={h0} sc={{ item: "cal-event", shown: final }} />
              </>
            ) : null
          }
        />
      </AppFrame>
      {!final && <PointerLayer id="cal-ptr" shapes={["cell", "grab"]} />}
    </>
  )
}

/* The phone: Thursday's day from 11 AM. A tap on 2 PM (a click's half hour), the dialog, the title, the scroll to its foot, Create event. */
const P_TAP = 400
const P_OPEN = P_TAP + 110
const P_TYPE = P_OPEN + 520
const P_KEYS = keyTimes(TITLE, "sam-names-phone", { pace: 96 })
const P_SCROLL = P_TYPE + lastTime(P_KEYS) + 450
/** How far the dialog scrolls to show its foot: its rows' heights less the card's 510 (quickcreate.css). */
const P_SCROLL_BY = 232
const P_PRESS = P_SCROLL + 900
const P_CLOSE = P_PRESS + 110
const P_FETCHED = P_CLOSE + 260

const phoneScript: Script = {
  plays: 1,
  delay: 700,
  stagger: 30,
  steps: [
    { at: P_TAP, on: ["cal-pg30"] },
    { at: P_OPEN, off: ["cal-pg30"], on: ["cal-dialog"] },
    { at: P_TYPE, type: ["ed-title"], off: ["cal-ed-ph"], on: ["cal-ed-text"] },
    { at: P_PRESS, on: ["cal-ed-press"] },
    { at: P_CLOSE, off: ["cal-ed-press", "cal-dialog"] },
    { at: P_FETCHED, on: ["cal-pevent"] },
  ],
  paths: {
    "cal-ed-scroll": [
      { at: P_SCROLL, x: 0, y: 0 },
      { at: P_SCROLL + 520, x: 0, y: -P_SCROLL_BY, ease: "move" },
    ],
  },
}

const PHONE_EVENT: TimedItem = { ...KICKOFF, end: 14 * 60 + 30 }

/**
 * On a phone the calendar opens on its agenda, and a tap on a day opens that
 * day's grid: this is Thursday's, from 11 AM.
 */
export function CalendarPhone({ now = new Date(), final = false }: { now?: Date; final?: boolean }) {
  const { monday, today } = sceneWeek(now)
  const thursday = addDays(monday, THURSDAY)
  const at = (min: number) => `${dayLabel(thursday)} · ${clock(min)}`
  return (
    <div className="relative h-full w-full">
      <PhoneFrame tab="more">
        <PhoneCalendarDay
          day={THURSDAY}
          monday={monday}
          today={today}
          nowMin={NOW_MIN}
          timed={DEMO_WEEK.timed}
          allDay={DEMO_WEEK.allDay}
          fromHour={11}
          span={6}
          extra={(day, h0) =>
            day === THURSDAY ? (
              <>
                <Ghost start={14 * 60} end={14 * 60 + 30} h0={h0} item={{ id: "cal-pg30", state: "off" }} />
                <Block item={PHONE_EVENT} h0={h0} sc={{ item: "cal-pevent", shown: final }} />
              </>
            ) : null
          }
        />
      </PhoneFrame>
      {!final && (
        <div className="sc absolute inset-0">
          <EventDialog
            title={TITLE}
            starts={at(14 * 60)}
            ends={at(14 * 60 + 30)}
            dialog={{ id: "cal-dialog", state: "off" }}
            typed={{ ph: { id: "cal-ed-ph" }, text: { id: "cal-ed-text", state: "off" } }}
            scroll="cal-ed-scroll"
            press={{ id: "cal-ed-press", state: "off" }}
          />
        </div>
      )}
    </div>
  )
}

export const calendarDesktop: SceneSpec = {
  ...SIZES.tour,
  label:
    "OneCamp's calendar, Monday to Thursday: on Thursday a drag from 2 to 3 PM draws the new event, the quick-create card opens beside it, and “Kickoff with Acme” is typed and saved, Acme taken as a guest.",
  script: desktopScript,
  render: () => <CalendarTour />,
}

export const calendarPhone: SceneSpec = {
  ...SIZES.phone,
  label: "OneCamp's calendar on a phone, open on Thursday: a tap at 2 PM opens a new event, “Kickoff with Acme” is typed, and it is created at 2 PM.",
  script: phoneScript,
  render: () => <CalendarPhone />,
}
