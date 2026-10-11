import { AppFrame } from "./AppFrame"
import { CalendarWeek, DEMO_WEEK, openingHour } from "./CalendarWeek"
import { Plate } from "./Gallery"
import { Sidebar } from "./Sidebar"
import { CalendarPhone, CalendarTour } from "./scenes/calendar"

/**
 * The calendar's plates for /playful-dev (Gallery.tsx): the week as the live
 * demo was captured (12 to 18 Oct 2026, opened on 11 Oct before 7 AM, so no
 * today and no now line in view), to hold against live-v3/calendar-*.png;
 * then the Calendar tab's two scenes as they end, on this week.
 */
const LIVE_MONDAY = new Date(Date.UTC(2026, 9, 12))
const LIVE_NOW = 6 * 60 + 44

export function Plates() {
  return (
    <>
      <Plate name="calendar" width={1120} height={700}>
        <AppFrame sidebar={<Sidebar place="calendar" more="Calendar" />}>
          <CalendarWeek
            monday={LIVE_MONDAY}
            today={-1}
            nowMin={LIVE_NOW}
            timed={DEMO_WEEK.timed}
            allDay={DEMO_WEEK.allDay}
            fromHour={openingHour(false, LIVE_NOW, DEMO_WEEK.timed)}
          />
        </AppFrame>
      </Plate>
      <Plate name="calendar-tour" width={652} height={520}>
        <CalendarTour final />
      </Plate>
      <Plate name="calendar-phone" width={360} height={600}>
        <CalendarPhone final />
      </Plate>
    </>
  )
}
