import { AppFrame, PhoneFrame } from "../AppFrame"
import { CalendarWeek, DEMO_WEEK, HOUR, PhoneCalendarDay, addDays, mondayOf, utcDay, weekday, type TimedItem } from "../CalendarWeek"
import type { Script } from "../SceneDirector"
import { SIZES, type SceneSpec } from "./types"

/**
 * The Calendar tab's moment: Acme books a kickoff from their own time zone,
 * and it lands in Sam's week on Thursday at 2 PM.
 *
 * The week is the real one, worked out when the page is drawn (the home page
 * is drawn again every few minutes): this week until Thursday, then the next,
 * so the kickoff is never booked into the past. Now is a working morning,
 * 11:40, wherever the reader is: the picture is a calendar at work, not a
 * clock.
 */

/** The time of day the scenes show. */
const NOW_MIN = 11 * 60 + 40

/** Thursday, the day the kickoff lands on. */
const THURSDAY = 3

/**
 * The booking (business/Calendar booking.go names a booked event "<page> with
 * <who booked>"), an hour from 2 PM. In the sun hue the tour asked for, so it
 * reads as new among the week's sky events; the app itself draws every
 * OneCamp-calendar event in sky (calendarTones CALENDAR_HUE).
 */
const KICKOFF: TimedItem = { title: "Kickoff with Acme", day: THURSDAY, start: 14 * 60, end: 15 * 60, hue: "sun" }

const KEY = "cal-kickoff"

/** The week a scene shows, and today's place in it (-1 when it isn't in it). */
export function sceneWeek(now: Date): { monday: Date; today: number } {
  const today = utcDay(now)
  const day = weekday(today)
  if (day <= THURSDAY) return { monday: mondayOf(today), today: day }
  return { monday: addDays(mondayOf(today), 7), today: -1 }
}

/** The kickoff arrives a beat after the week has settled, once. */
const script: Script = { steps: [{ at: 400, on: [KEY] }], plays: 1, delay: 700, stagger: 30 }

/**
 * The tab's window gives the sheet 636 by 504, where the app's week (seven
 * columns of at least 90px, a header that needs about 850px) does not fit.
 * It is drawn at 1:1 all the same, narrowed as a narrower calendar would be:
 * four days, Monday to Thursday (so Thursday's kickoff and, Monday to
 * Thursday, today are in it), under the compact header.
 */
const DAYS = [0, 1, 2, 3]

/** The header, the day headers and the all-day rail above the grid (calendar.css). */
const CHROME = 52 + 57 + 33

/**
 * Where the grid is scrolled to: its bottom edge on 3 PM, so the kickoff is
 * whole, the morning's standups are in view, and no block is cut through at
 * the edge (Wednesday's copy sync starts just below it).
 */
const TOUR_FROM = (15 * HOUR + 12 - (SIZES.tour.h - 16 - CHROME)) / HOUR

export function CalendarTour({ now = new Date(), final = false }: { now?: Date; final?: boolean }) {
  const { monday, today } = sceneWeek(now)
  return (
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
        toHour={15}
        span={8}
        arrival={{ item: KICKOFF, key: KEY, shown: final }}
      />
    </AppFrame>
  )
}

/**
 * On a phone the calendar opens on its agenda, and a tap on a day opens that
 * day's grid: this is Thursday's, from 11 AM, where the kickoff lands.
 */
export function CalendarPhone({ now = new Date(), final = false }: { now?: Date; final?: boolean }) {
  const { monday, today } = sceneWeek(now)
  return (
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
        arrival={{ item: KICKOFF, key: KEY, shown: final }}
      />
    </PhoneFrame>
  )
}

export const calendarDesktop: SceneSpec = {
  ...SIZES.tour,
  label:
    "OneCamp's calendar, Monday to Thursday: a standup each morning, a launch review, focus time, and Launch day on Thursday. A kickoff with Acme appears on Thursday at 2 PM.",
  script,
  render: () => <CalendarTour />,
}

export const calendarPhone: SceneSpec = {
  ...SIZES.phone,
  label: "OneCamp's calendar on a phone, open on Thursday: Launch day all day, and a kickoff with Acme appearing at 2 PM.",
  script,
  render: () => <CalendarPhone />,
}
