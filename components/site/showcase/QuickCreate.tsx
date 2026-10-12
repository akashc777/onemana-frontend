import "./calendar.css"

import type { ReactNode } from "react"
import { Calendar, Clock, Moon, UserPlus, X } from "lucide-react"

import { HOUR, clock } from "./CalendarWeek"
import { Ico, Kbd } from "./parts"
import { TypedText } from "./motion/parts"

/**
 * MAKING AN EVENT (components/calendar weekView, quickCreateCard,
 * createCalendarEventDialog): the 15-minute band under the pointer with its
 * time, the ghost a drag draws (brand at 14%, a dashed brand ring, a 3px
 * brand bar and its times, which pulse as it snaps), the quick-create card a
 * computer opens beside it, and the full dialog a phone opens instead.
 */

type Part = { id: string; state?: "off" }
const part = (p?: Part) => (p ? { "data-sc-item": p.id, "data-sc-state": p.state } : {})

/** A draft's times as the app writes them (shortTime – shortTime): "2:00 PM – 3:00 PM". */
export const span = (start: number, end: number) => `${clock(start)} \u2013 ${clock(end)}`

/** The band under the pointer (weekView): 14px of hover over its 15 minutes, its time at 10/14. */
export function HoverBand({ min, h0, item }: { min: number; h0: number; item: Part }) {
  return (
    <div className="sc-cal-band" style={{ top: (min / 60 - h0) * HOUR }} {...part(item)}>
      <span className="tnum">{clock(min)}</span>
    </div>
  )
}

/** The ghost of a new event (weekView's draft ghost), from `start` to `end` minutes. */
export function Ghost({ start, end, h0, item }: { start: number; end: number; h0: number; item: Part }) {
  return (
    <div className="sc-cal-ghost" style={{ top: (start / 60 - h0) * HOUR, height: Math.max(((end - start) / 60) * HOUR - 2, 12) }} {...part(item)}>
      <i />
      <span className="tnum">
        {span(start, end)}
      </span>
    </div>
  )
}

/** A chip under the title (quickCreateCard chip): 24px, r8, the hover ground, a hairline, 12px at 510. */
function Chip({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="sc-qc-chip">
      {icon}
      {children}
    </span>
  )
}

/** The chips as they read with `guests` in the guests chip. */
function Chips({ date, time, guests, item }: { date: string; time: string; guests: string; item?: Part }) {
  return (
    <div className="sc-qc-chips" {...part(item)}>
      <Chip icon={<Ico icon={Calendar} size={12} />}>{date}</Chip>
      <Chip icon={<Ico icon={Clock} size={12} />}>
        <span className="tnum">{time}</span>
      </Chip>
      <Chip icon={<Ico icon={UserPlus} size={12} />}>{guests}</Chip>
      <Chip icon={<i className="sc-qc-dot" data-hue="sky" />}>Personal</Chip>
      <Chip icon={<Ico icon={Moon} size={12} />}>Focus</Chip>
    </div>
  )
}

/**
 * The quick-create card (quickCreateCard): 340px on the pop surface at e3,
 * r12, beside the ghost; the title field with its example placeholder, the
 * chips (the day, the times, guests, the calendar, Focus), and More options
 * with Discard and Save. A name after "with" is understood as it is typed:
 * underlined in the title, and the guests chip says it. `guests` are the
 * chip's readings as the title is typed (a row of chips each, the scene's
 * items), the first the empty "Add guests".
 */
export function QuickCreateCard({
  title,
  mark,
  date,
  time,
  guests,
  card,
  typed,
}: {
  title: string
  /** Where the name the card understands is in the title: from, to, and how much of it must be typed. */
  mark: [number, number, number]
  date: string
  time: string
  guests: { text: string; item: Part }[]
  card: Part
  typed: { ph: Part; text: Part }
}) {
  return (
    <div className="sc-qc" {...part(card)}>
      <div className="sc-qc-title">
        <span className="sc-qc-ph" {...part(typed.ph)}>
          Lunch with Maya at 1pm tomorrow
        </span>
        <span className="sc-qc-text" {...part(typed.text)}>
          <TypedText id="qc-title" cadence="local" seed="sam-names" pace={78} mark={mark}>
            {title}
          </TypedText>
        </span>
        <span className="sc-qc-caret" data-sc-caret="qc-title" />
      </div>
      <div className="sc-qc-chipstack">
        {guests.map((g) => (
          <Chips key={g.item.id} date={date} time={time} guests={g.text} item={g.item} />
        ))}
      </div>
      <div className="sc-qc-foot">
        <span className="sc-qc-ghostbtn">More options</span>
        <span className="flex items-center gap-1">
          <span className="sc-qc-x">
            <Ico icon={X} size={14} />
          </span>
          <span className="sc-btn" data-variant="primary">
            Save
            <Kbd>⏎</Kbd>
          </span>
        </span>
      </div>
    </div>
  )
}

/** A row of the full dialog on a phone (createCalendarEventDialog): its 13/18 label over its control. */
function DialogRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="sc-ed-row">
      <span className="sc-ed-label">{label}</span>
      {children}
    </div>
  )
}

/**
 * The full dialog a phone opens for a new event (createCalendarEventDialog
 * on ui/dialog): a card 328px wide in the middle of the screen, r16, at e4
 * over the scrim; the title at 20/27 with no box, then Starts, Ends,
 * Guests, the free times, Notes and the calendar, the switches, and Create
 * event over Cancel at its foot. It is taller than the screen allows, so it
 * scrolls (`scroll`, a scene's path on its body).
 */
export function EventDialog({
  title,
  starts,
  ends,
  dialog,
  typed,
  scroll,
  press,
}: {
  title: string
  starts: string
  ends: string
  dialog: Part
  typed: { ph: Part; text: Part }
  scroll: string
  press: Part
}) {
  return (
    <div className="sc-ed-over" {...part(dialog)}>
      <div className="sc-ed-scrim" />
      <div className="sc-ed">
        <span className="sc-ed-x">
          <Ico icon={X} size={16} />
        </span>
        <div className="sc-ed-body" data-sc-path={scroll}>
          <div className="sc-ed-title">
            <span className="sc-ed-ph" {...part(typed.ph)}>
              Event title
            </span>
            <span className="sc-ed-text" {...part(typed.text)}>
              <TypedText id="ed-title" cadence="local" seed="sam-names-phone" pace={96}>
                {title}
              </TypedText>
            </span>
            <span className="sc-ed-caret" data-sc-caret="ed-title" />
          </div>
          <DialogRow label="Starts">
            <span className="sc-ed-field tnum">
              <Ico icon={Calendar} size={14} />
              {starts}
            </span>
          </DialogRow>
          <DialogRow label="Ends">
            <span className="sc-ed-field tnum">
              <Ico icon={Calendar} size={14} />
              {ends}
            </span>
          </DialogRow>
          <DialogRow label="Guests">
            <span className="sc-ed-input">Add people by name</span>
          </DialogRow>
          <div className="sc-ed-free">
            <span>When you&apos;re free this week, 9 to 5.</span>
            <span className="sc-ed-find">✦ Find a time</span>
          </div>
          <DialogRow label="Notes">
            <span className="sc-ed-notes">Agenda, a call link, anything people should know</span>
          </DialogRow>
          <DialogRow label="Calendar">
            <span className="sc-ed-cal">
              <i className="sc-qc-dot" data-hue="sky" />
              OneCamp · Personal
            </span>
          </DialogRow>
          <div className="sc-ed-switches">
            <div className="sc-ed-switch">
              <span>
                <b>Focus time</b>
                <small>Pause your notifications while this runs. Someone who really needs you can still use Notify anyway.</small>
              </span>
              <i />
            </div>
            <div className="sc-ed-switch">
              <span>
                <b>Away</b>
                <small>Time off: the workload counts these working days out of what you take on, so nobody plans work for you then.</small>
              </span>
              <i />
            </div>
          </div>
          <div className="sc-ed-foot">
            <span className="sc-ed-create">
              Create event
              <span className="sc-ed-press" {...part(press)} />
            </span>
            <span className="sc-ed-cancel">Cancel</span>
          </div>
        </div>
      </div>
    </div>
  )
}
