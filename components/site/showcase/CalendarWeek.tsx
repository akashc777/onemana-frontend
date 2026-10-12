import type { CSSProperties, ReactNode } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, MoreHorizontal, Moon, Plus, Search } from "lucide-react"

import "./calendar.css"
import type { CampHue } from "@/lib/campHue"
import { Ico, Kbd, WorkspaceMark } from "./parts"

/**
 * The calendar (onecamp-fe components/calendar), drawn without the app: the
 * header, the week (day headers, the all-day rail, the time grid with its
 * hue blocks and the now line) and the phone's day. Server components with
 * no state: a scene is a picture.
 *
 * Dates are counted in UTC, so the picture is the same wherever the server
 * runs. A week is given by its Monday (the app's WEEK_STARTS_ON), today by
 * its place in that week (-1 when it isn't in it), and now by the minute of
 * the day.
 */

/* ------------------------------------------------------------------ dates */

const DAY_MS = 86_400_000
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** The start of a date's day, in UTC. */
export function utcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS)
}

/** 0 for Monday to 6 for Sunday. */
export const weekday = (d: Date) => (d.getUTCDay() + 6) % 7

/** The Monday a date's week starts on. */
export function mondayOf(d: Date): Date {
  const day = utcDay(d)
  return addDays(day, -weekday(day))
}

const dm = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`

/**
 * The en dash, only ever between two numbers (lib/prose.test.ts: the site
 * keeps it for numeric ranges, and cannot see the digits inside ${...}).
 * The app writes its ranges with a spaced dash ("12 – 18 Oct 2026",
 * "10:15 AM – 11:15 AM"); the site's prose closes them up, and says "to"
 * where a dash would not sit between numbers.
 */
const RANGE = "\u2013"

/** The week's title (calendarApp's periodTitle): "12–18 Oct 2026", or "28 Sep to 4 Oct 2026" across two months. */
export function weekTitle(monday: Date): string {
  const sunday = addDays(monday, 6)
  const sameMonth = monday.getUTCMonth() === sunday.getUTCMonth() && monday.getUTCFullYear() === sunday.getUTCFullYear()
  const end = `${dm(sunday)} ${sunday.getUTCFullYear()}`
  return sameMonth ? `${monday.getUTCDate()}${RANGE}${end}` : `${dm(monday)} to ${end}`
}

/**
 * A few days' title, short enough for the compact header (about 96px at
 * title-3): "12–15 Oct", or across two months "Sep to Oct", the day headers
 * under it carrying the dates.
 */
export function rangeTitle(first: Date, last: Date): string {
  return first.getUTCMonth() === last.getUTCMonth()
    ? `${first.getUTCDate()}${RANGE}${dm(last)}`
    : `${MONTHS[first.getUTCMonth()]} to ${MONTHS[last.getUTCMonth()]}`
}

/** A day's title, as periodTitle for the day view: "Thu 15 Oct". */
export function dayTitle(d: Date): string {
  return `${WEEKDAYS[weekday(d)].slice(0, 3)} ${dm(d)}`
}

/** A minute of the day as shortTime writes it: "9:15 AM". */
export function clock(min: number): string {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`
}

/** An event's times: "10:15–11:15 AM", or "11:30 AM to 12:30 PM" across noon. */
export function timeRange(start: number, end: number): string {
  const [a, b] = [clock(start), clock(end)]
  return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)}${RANGE}${b}` : `${a} to ${b}`
}

/** An hour as the gutter writes it: "8 AM", "12 PM". */
const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`

/* ------------------------------------------------------------ the content */

/** Something on time: an event (its calendar's hue), a focus block, or a timed booking. */
export type TimedItem = {
  title: string
  /** 0 for Monday to 6 for Sunday. */
  day: number
  /** Minutes from midnight. */
  start: number
  end: number
  hue?: CampHue
  focus?: boolean
}

/** Something on a day: an all-day event, or a task on its due day (in its project's hue). */
export type DayItem = {
  title: string
  day: number
  hue: CampHue
  task?: "todo" | "backlog"
}

/**
 * The demo's week (the live demo's calendar, Sam Rivera's): a standup every
 * weekday, a launch review, focus time and a copy sync on the OneCamp
 * calendar (sky, the app's CALENDAR_HUE.onecamp), Launch day on Thursday,
 * and two Q4 launch tasks (sun, the project's hue) on their due days.
 */
export const DEMO_WEEK: { timed: TimedItem[]; allDay: DayItem[] } = {
  timed: [
    ...[0, 1, 2, 3, 4].map((day) => ({ title: "Standup", day, start: 9 * 60 + 15, end: 9 * 60 + 30, hue: "sky" as CampHue })),
    { title: "Launch review", day: 1, start: 10 * 60 + 15, end: 11 * 60 + 15, hue: "sky" },
    { title: "Focus time", day: 0, start: 12 * 60, end: 14 * 60, focus: true },
    { title: "Copy sync", day: 2, start: 15 * 60, end: 16 * 60, hue: "sky" },
  ],
  allDay: [
    { title: "Review the pricing page copy", day: 0, hue: "sun", task: "todo" },
    { title: "Launch day", day: 3, hue: "sky" },
    { title: "Book the launch retro", day: 6, hue: "sun", task: "backlog" },
  ],
}

/**
 * The hour the grid opens on, as weekView does: an hour before now when today
 * is shown, else 8 AM; earlier for an earlier first event.
 */
export function openingHour(todayShown: boolean, nowMin: number, timed: TimedItem[]): number {
  let hour = todayShown ? Math.max(0, Math.min(Math.floor(nowMin / 60) - 1, 16)) : 8
  const first = Math.min(...timed.map((t) => t.start), 24 * 60)
  if (first / 60 < hour) hour = Math.floor(first / 60)
  return hour
}

/* -------------------------------------------------------------- the parts */

/** An hour on the grid (weekView HOUR_HEIGHT): 15 minutes is 14px. */
export const HOUR = 56
const GUTTER = 56

/** A task's status glyph (StatusGlyph), 12px. Its stroke is in calendar.css. */
function StatusGlyph({ status }: { status: "todo" | "backlog" }) {
  return (
    <svg width={12} height={12} viewBox="0 0 16 16" aria-hidden="true" className="sc-glyph" data-status={status}>
      <circle cx="8" cy="8" r="6" />
    </svg>
  )
}

/** An all-day chip (HueBlock variant chip): a task with its glyph, an event with its bar. */
function Chip({ item }: { item: DayItem }) {
  return (
    <div className="sc-hb" data-variant="chip" data-kind={item.task ? "task" : "event"} data-hue={item.hue} data-sc-enter="">
      {!item.task && <i />}
      {item.task && <StatusGlyph status={item.task} />}
      <span className="sc-hb-trunc">{item.title}</span>
    </div>
  )
}

/**
 * A block on the grid (HueBlock variant block, placed by weekView): from 44px
 * the title over the times, from 28px the title and the start, and below
 * that one 11px line. A focus block carries the moon.
 */
export function Block({
  item,
  h0,
  past,
  sc,
}: {
  item: TimedItem
  /** The first hour drawn. */
  h0: number
  past?: boolean
  /** A scene's arrival: its key and whether it is shown yet. It just appears, as an event does when the calendar fetches it. */
  sc?: { item: string; shown?: boolean }
}) {
  const end = Math.max(item.end, item.start + 20)
  const top = (item.start / 60 - h0) * HOUR
  const height = Math.max(((end - item.start) / 60) * HOUR - 2, 14)
  const time = timeRange(item.start, item.end)
  const style: CSSProperties = { top, height, left: 2, width: "calc(100% - 4px)" }
  return (
    <div
      className="sc-hb"
      data-variant="block"
      data-kind={item.focus ? "focus" : "event"}
      data-hue={item.focus ? undefined : item.hue}
      data-past={past ? "" : undefined}
      data-short={height < 28 ? "" : undefined}
      data-sc-enter={sc ? undefined : ""}
      data-sc-item={sc?.item}
      data-sc-state={sc && !sc.shown ? "off" : undefined}
      data-sc-swap={sc ? "" : undefined}
      style={style}
    >
      <i />
      {item.focus && (
        <span className="sc-hb-lead">
          <Ico icon={Moon} size={12} />
        </span>
      )}
      {height >= 44 ? (
        <>
          <span className="sc-hb-clamp">{item.title}</span>
          <span className="sc-hb-trunc sc-hb-at sc-hb-time">{time}</span>
        </>
      ) : height >= 28 ? (
        <span className="sc-hb-trunc">
          {item.title} <span className="sc-hb-at">· {clock(item.start)}</span>
        </span>
      ) : (
        <span className="sc-hb-trunc sc-hb-micro">
          {item.title} <span className="sc-hb-at">{clock(item.start)}</span>
        </span>
      )}
    </div>
  )
}

/**
 * The time now (NowLine): its time in a pill in the gutter, a faint line
 * across every column, and on today the line in full with its disc.
 */
function NowLine({ top, nowMin, todayIndex, columns }: { top: number; nowMin: number; todayIndex: number; columns: number }) {
  const col = 100 / Math.max(columns, 1)
  return (
    <div className="sc-cal-now" aria-hidden="true" style={{ transform: `translateY(${top}px)` }}>
      <b className="t-micro w-semibold">{clock(nowMin).replace(/\s?[AP]M$/, "")}</b>
      <div>
        <i />
        {todayIndex >= 0 && (
          <em style={{ left: `${todayIndex * col}%`, width: `${col}%` }}>
            <span />
          </em>
        )}
      </div>
    </div>
  )
}

export type WeekGridProps = {
  /** The week's Monday. */
  monday: Date
  /** The days shown: 0 to 6 for a week, one for a day. */
  days?: number[]
  /** Today's place in the week, -1 when it isn't in it. */
  today: number
  /** Now, as a minute of the day. */
  nowMin: number
  timed: TimedItem[]
  allDay: DayItem[]
  /**
   * The hour the grid shows from: weekView opens 12px above it. A fraction
   * is a grid scrolled part of the way into an hour.
   */
  fromHour: number
  /** How many hours are drawn from the hour before it. */
  span?: number
  /**
   * The hour at the grid's bottom edge, when a scene sets it: that hour's
   * label sits on the edge and would be cut in half, so it is left out.
   */
  toHour?: number
  /** A scene's arrival: an item laid out in its place from the start, shown when the script says. */
  arrival?: { item: TimedItem; key: string; shown?: boolean }
  /**
   * What a scene draws into a day's column besides its events (the hover
   * band, a dragged ghost, the card beside it), given the first hour drawn
   * (h0) to place it by.
   */
  extra?: (day: number, h0: number) => ReactNode
}

/** The week or the day under the header (weekView): day headers, the all-day rail and the time grid. */
export function WeekGrid({ monday, days = [0, 1, 2, 3, 4, 5, 6], today, nowMin, timed, allDay, fromHour, span = 12, toHour, arrival, extra }: WeekGridProps) {
  const single = days.length === 1
  const h0 = Math.max(0, Math.floor(fromHour) - 1)
  const h1 = Math.min(24, Math.ceil(fromHour) + span)
  const hours = Array.from({ length: h1 - h0 }, (_, i) => h0 + i)
  const todayIndex = days.indexOf(today)
  const past = (t: TimedItem) => today >= 0 && (t.day < today || (t.day === today && t.end < nowMin))
  const showsNow = nowMin >= h0 * 60 && nowMin <= h1 * 60
  const flag = (on: boolean) => (on ? "" : undefined)

  return (
    <div className="sc-cal-week">
      <div className="sc-cal-days">
        <div className="sc-cal-gutter" />
        {days.map((d) => {
          const date = addDays(monday, d)
          const name = WEEKDAYS[d]
          return (
            <div key={d} className="sc-cal-dayhead" data-today={flag(d === today)} data-weekend={flag(d >= 5)} data-single={flag(single)}>
              <span className="t-micro sc-cal-wd">{single ? name : name.slice(0, 3)}</span>
              <span className="sc-cal-date t-title-2">{date.getUTCDate()}</span>
            </div>
          )
        })}
      </div>

      <div className="sc-cal-rail">
        <div className="sc-cal-railgutter t-micro">All day</div>
        {days.map((d) => (
          <div key={d} className="sc-cal-railcell" data-weekend-rail={flag(d >= 5)} data-single={flag(single)}>
            {allDay
              .filter((a) => a.day === d)
              .map((a) => (
                <Chip key={a.title} item={a} />
              ))}
          </div>
        ))}
      </div>

      <div className="sc-cal-grid">
        <div className="sc-cal-hours" style={{ top: -((fromHour - h0) * HOUR - 12), height: hours.length * HOUR }}>
          <div className="sc-cal-gutter" style={{ width: GUTTER }}>
            {hours.map((h) => (
              <div key={h} className="sc-cal-hour">
                {h > 0 && h !== toHour && Math.abs(nowMin - h * 60) >= 20 ? <span className="t-micro">{hourLabel(h)}</span> : null}
              </div>
            ))}
          </div>
          <div className="sc-cal-cols">
            {days.map((d) => (
              <div key={d} className="sc-cal-col" data-weekend={flag(d >= 5)} data-single={flag(single)}>
                {h0 < 9 && <div className="sc-cal-off" style={{ top: 0, height: (9 - h0) * HOUR }} />}
                {h1 > 18 && <div className="sc-cal-off" style={{ top: Math.max(0, 18 - h0) * HOUR, height: (h1 - Math.max(18, h0)) * HOUR }} />}
                {hours.map((h) => (
                  <div key={h} className="sc-cal-line">
                    <span />
                  </div>
                ))}
                {timed
                  .filter((t) => t.day === d)
                  .map((t) => (
                    <Block key={`${t.title}-${t.start}`} item={t} h0={h0} past={past(t)} />
                  ))}
                {arrival && arrival.item.day === d && <Block item={arrival.item} h0={h0} sc={{ item: arrival.key, shown: arrival.shown }} />}
                {extra?.(d, h0)}
              </div>
            ))}
          </div>
          {showsNow && <NowLine top={(nowMin / 60 - h0) * HOUR} nowMin={nowMin} todayIndex={todayIndex} columns={days.length} />}
        </div>
      </div>
    </div>
  )
}

/** The view switch's views, Week at 64px a step. */
const VIEWS = ["Day", "Week", "Month", "Agenda"]

/**
 * The header (calendarApp, data-calendar-header): the period, back and
 * forward, Today; search, Calendars with the OneCamp calendar's dot, the view
 * switch on Week, and New event with its key.
 *
 * Compact is the header narrowed for a 636px sheet, as the phone's bar
 * narrows it: the period, back, forward and Today stay, and so do the view
 * switch and New event; search and Calendars, which a narrower calendar
 * reaches from its options, go, and so does New event's key hint, as on the
 * phone's bar.
 */
export function CalendarHeader({ title, compact = false }: { title: string; compact?: boolean }) {
  return (
    <div className="sc-cal-head">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="sc-cal-title t-title-3 ink">{title}</span>
        <div className="ml-1 flex flex-none items-center">
          <span className="sc-iconbtn">
            <Ico icon={ChevronLeft} />
          </span>
          <span className="sc-iconbtn">
            <Ico icon={ChevronRight} />
          </span>
        </div>
        <span className="sc-cal-btn" data-size="xs" data-variant="secondary">
          Today
        </span>
      </div>
      <div className="ml-auto flex flex-none items-center gap-1.5">
        {!compact && (
          <>
            <span className="sc-iconbtn">
              <Ico icon={Search} />
            </span>
            <span className="sc-cal-btn" data-variant="ghost">
              <Ico icon={CalendarDays} />
              Calendars
              <span className="flex items-center gap-0.5">
                <span className="sc-cal-dot" data-hue="sky" />
              </span>
            </span>
          </>
        )}
        <div className="sc-cal-views">
          <i style={{ transform: "translateX(64px)" }} />
          {VIEWS.map((v) => (
            <span key={v} data-on={v === "Week" ? "" : undefined}>
              {v}
            </span>
          ))}
        </div>
        <span className="sc-btn sc-cal-new" data-variant="primary">
          <Ico icon={Plus} />
          New event
          {!compact && <Kbd>C</Kbd>}
        </span>
      </div>
    </div>
  )
}

/**
 * The calendar in Week view: the header over the week. Fewer days (a narrow
 * sheet's four) take a shorter title and the compact header.
 */
export function CalendarWeek({ compact = false, ...props }: WeekGridProps & { compact?: boolean }) {
  const days = props.days ?? [0, 1, 2, 3, 4, 5, 6]
  const title = days.length === 7 ? weekTitle(props.monday) : rangeTitle(addDays(props.monday, days[0]), addDays(props.monday, days[days.length - 1]))
  return (
    <div className="sc-cal">
      <CalendarHeader title={title} compact={compact} />
      <WeekGrid {...props} />
    </div>
  )
}

/**
 * The calendar on a phone, on one day (calendarApp PhoneBar over weekView's
 * day): the shell's top bar (the workspace mark, "Calendar", its options),
 * the day's title with Today and New event, the week's days with the chosen
 * one in ink and today ringed, the views on Day, then the day's grid.
 */
export function PhoneCalendarDay({ day, ...grid }: Omit<WeekGridProps, "days"> & { day: number }) {
  const has = (d: number) => grid.timed.some((t) => t.day === d) || grid.allDay.some((a) => a.day === d)
  return (
    <div className="sc-cal">
      <div className="sc-cal-ptop">
        <span className="flex min-w-0 items-center justify-start">
          <span className="sc-cal-ptarget">
            <WorkspaceMark size={24} />
          </span>
        </span>
        <span className="min-w-0 truncate text-center t-title-3 ink" style={{ lineHeight: "22px" }}>
          Calendar
        </span>
        <span className="flex min-w-0 items-center justify-end">
          <span className="sc-cal-ptarget">
            <Ico icon={MoreHorizontal} />
          </span>
        </span>
      </div>

      <div className="sc-cal-pbar">
        <div className="flex h-12 items-center gap-1.5 px-3">
          <span className="sc-cal-title min-w-0 flex-1 t-title-3 ink">{dayTitle(addDays(grid.monday, day))}</span>
          <span className="sc-cal-btn" data-variant="secondary">
            Today
          </span>
          <span className="sc-btn" data-variant="primary" style={{ width: 32, height: 32, padding: 0 }}>
            <Ico icon={Plus} />
          </span>
        </div>
        <div className="sc-cal-pstrip">
          <span className="sc-iconbtn">
            <Ico icon={ChevronLeft} />
          </span>
          <div className="grid flex-1 grid-cols-7">
            {WEEKDAYS.map((name, d) => (
              <div key={name} className="flex flex-col items-center gap-0.5">
                <span className="t-micro ink-3">{name[0]}</span>
                <span className="sc-daycell" data-today={d === grid.today ? "" : undefined} data-selected={d === day ? "" : undefined}>
                  {addDays(grid.monday, d).getUTCDate()}
                  {has(d) ? <i /> : null}
                </span>
              </div>
            ))}
          </div>
          <span className="sc-iconbtn">
            <Ico icon={ChevronRight} />
          </span>
        </div>
        <div className="sc-cal-pviews">
          {["Agenda", "Day", "Month"].map((v) => (
            <span key={v} data-on={v === "Day" ? "" : undefined}>
              {v}
            </span>
          ))}
        </div>
      </div>

      <WeekGrid {...grid} days={[day]} />
    </div>
  )
}
