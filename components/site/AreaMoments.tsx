// landing-diet: product-mock -- the text below is simulated PRODUCT UI (a
// poll, a huddle, a doc, a goal, a booking page and a table, with the live
// demo's people), not marketing copy; app/landingWordBudget.test.ts skips it.
import type { CSSProperties, ReactNode } from "react";
import type { Area } from "@/lib/areas";
import { Face } from "@/components/ui/v3";
import { Icon } from "@/components/ui/icons";

/**
 * ONE MOMENT PER AREA (design v3.1, "Also in the box"): a small piece of the
 * product as it works today, peeking up from the foot of its area's stage on
 * the raised surface at e2, so the breadth is shown, not listed. Each is a
 * feature that has shipped and has its guide (the panel's links say which):
 * a poll, a huddle beside the chat, a doc's toggle and comment, a goal that
 * fills from its tasks, a booking page and a formula column. The people are
 * the live demo's (components/site/showcase/data.ts).
 *
 * Playful, calm: each answers the pointer, or a key on the panel's links,
 * with one small change of state (a vote counted, a speaker heard, a toggle
 * opened, a task ticked, a time picked, a formula's column lit), in the
 * layer's 120 to 240 ms, transform and opacity only. Nothing moves on its
 * own. Under reduced motion only the opacity changes, at once (motion-safe:
 * holds every transform back).
 *
 * A moment is a picture: role="img" with one sentence of what it shows, so a
 * screen reader hears the sentence, not the fragments.
 */

/** The panel's hover or a focused link inside it, written out so Tailwind keeps every class. */
const SHOW = "opacity-0 transition-opacity duration-pop ease-out group-hover/area:opacity-100 group-focus-within/area:opacity-100";
const HIDE = "transition-opacity duration-pop ease-out group-hover/area:opacity-0 group-focus-within/area:opacity-0";

/** The raised piece of product, cropped by the stage's foot. */
function Peek({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="absolute inset-x-4 bottom-0 top-[60px] overflow-hidden rounded-t-xl bg-card px-3.5 pt-3 text-[13px] leading-[18px] tracking-[-0.003em] text-foreground shadow-e2 sm:inset-x-5"
    >
      {children}
    </div>
  );
}

/** Two numbers in one place, the second taking over under the pointer. */
function Swap({ from, to, className = "" }: { from: string; to: string; className?: string }) {
  return (
    <span className={`inline-grid tabular-nums ${className}`}>
      <span className={`[grid-area:1/1] ${HIDE}`}>{from}</span>
      <span className={`[grid-area:1/1] ${SHOW}`}>{to}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ chat */

function PollBar({ label, from, to, n, m, voted = false }: { label: string; from: number; to: number; n: string; m: string; voted?: boolean }) {
  return (
    <div className="relative mt-1.5 flex h-7 items-center overflow-hidden rounded-md bg-muted px-2.5">
      <span
        aria-hidden="true"
        style={{ "--fill": from, "--fill-on": to } as CSSProperties}
        className="pointer-events-none absolute inset-y-0 left-0 w-full origin-left scale-x-[var(--fill)] bg-hue/20 transition-transform duration-pop ease-out motion-safe:group-hover/area:scale-x-[var(--fill-on)] motion-safe:group-focus-within/area:scale-x-[var(--fill-on)]"
      />
      <span className="relative flex flex-1 items-center gap-1.5 font-[510]">
        {label}
        {voted && <Icon name="check" size={14} className={`text-hue-ink ${SHOW}`} />}
      </span>
      <Swap from={n} to={m} className="relative text-[12px] text-muted-foreground" />
    </div>
  );
}

function PollMoment() {
  return (
    <Peek label="A poll in a channel: Ship the launch page Friday? Six votes for Friday and two for after the load test, with your vote about to be counted.">
      <p className="flex items-center gap-2">
        <Face initials="JW" hue="berry" size={20} />
        <span className="font-[590]">Jonas Weber</span>
        <span className="text-[12px] text-muted-foreground">10:24</span>
      </p>
      <p className="mt-1.5 font-[590]">Ship the launch page Friday?</p>
      <PollBar label="Yes, Friday" from={0.75} to={0.78} n="6" m="7" voted />
      <PollBar label="After the load test" from={0.25} to={0.22} n="2" m="2" />
    </Peek>
  );
}

/* ----------------------------------------------------------------- calls */

function CallButton({ icon, danger = false }: { icon: "mic" | "video" | "browser" | "close"; danger?: boolean }) {
  return (
    <span className={`grid size-7 place-items-center rounded-full ${danger ? "bg-danger text-white" : "bg-muted text-muted-foreground shadow-[inset_0_0_0_1px_var(--line-c)]"}`}>
      <Icon name={icon} size={14} />
    </span>
  );
}

function CallMoment() {
  return (
    <Peek label="A huddle opened beside the conversation in #design: Sam Rivera shares a screen while Maya Chen talks.">
      <p className="flex items-center justify-between text-[12px]">
        <span className="flex items-center gap-1.5 font-[590] text-foreground">
          <span className="text-muted-foreground">#</span>design
          <span className="rounded-[5px] bg-hue-tint px-1.5 text-[11px] font-[510] leading-[18px] text-hue-ink">Huddle</span>
        </span>
        <span className="tabular-nums text-muted-foreground">12:04</span>
      </p>
      <div className="night mt-2 grid grid-cols-[1.55fr_1fr] gap-1.5 rounded-lg p-1.5">
        <div className="relative h-[50px] overflow-hidden rounded-md bg-card px-2 pt-2">
          {/* Sam's shared window: a page of lines, the way a share reads at this size. */}
          <span aria-hidden="true" className="block h-1.5 w-2/3 rounded-full bg-foreground/25" />
          <span aria-hidden="true" className="mt-1.5 block h-1.5 w-11/12 rounded-full bg-foreground/15" />
          <span aria-hidden="true" className="mt-1.5 block h-1.5 w-4/5 rounded-full bg-foreground/15" />
          <span className="absolute bottom-1 left-1.5 rounded-[4px] bg-background/80 px-1 text-[10px] leading-[14px] text-muted-foreground">Sam&apos;s screen</span>
        </div>
        <div className="relative grid h-[50px] place-items-center rounded-md bg-card">
          <span className="relative">
            <Face initials="MC" hue="moss" size={28} />
            {/* Heard: the speaker's ring, in the state colour for "on". */}
            <span aria-hidden="true" className={`pointer-events-none absolute -inset-1 rounded-full ring-2 ring-success ${SHOW}`} />
          </span>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <CallButton icon="mic" />
        <CallButton icon="video" />
        <CallButton icon="browser" />
        <span className="ml-auto">
          <CallButton icon="close" danger />
        </span>
      </div>
    </Peek>
  );
}

/* ------------------------------------------------------------------ docs */

function DocMoment() {
  return (
    <Peek label="A doc, Launch sync notes: a toggle that opens on the rollback steps, and Maya Chen's comment on the words at launch.">
      <p className="text-[15px] font-[590] leading-5 tracking-[-0.012em]">Launch sync notes</p>
      <p className="mt-2 flex items-center gap-1">
        <Icon name="chevron-right" size={14} className="text-muted-foreground transition-transform duration-pop ease-out motion-safe:group-hover/area:rotate-90 motion-safe:group-focus-within/area:rotate-90" />
        <span className="font-[510]">Rollback steps</span>
      </p>
      <p className={`ml-[18px] text-[12px] leading-4 text-muted-foreground ${SHOW}`}>1. Put the release tag back on staging</p>
      <p className="mt-1.5 pr-8">
        Business tier is on the pricing page <span className="rounded-[3px] bg-hue/20 px-0.5 shadow-[inset_0_-1.5px_0_rgb(var(--hue))]">at launch</span>.
      </p>
      {/* The comment's mark in the margin, on the words it holds on to. */}
      <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-pop py-0.5 pl-0.5 pr-1.5 text-[11px] font-[510] text-muted-foreground shadow-e1">
        <Face initials="MC" hue="moss" size={18} />1
      </span>
    </Peek>
  );
}

/* -------------------------------------------------------------- projects */

function Check({ done, ticks = false }: { done?: boolean; ticks?: boolean }) {
  return (
    <span className={`relative grid size-3.5 shrink-0 place-items-center rounded-[4px] ${done ? "bg-hue text-white" : "shadow-[inset_0_0_0_1.5px_var(--line-3-c)]"}`}>
      {done && <Icon name="check" size={12} />}
      {ticks && (
        <span className={`absolute inset-0 grid place-items-center rounded-[4px] bg-hue text-white motion-safe:scale-75 motion-safe:transition-transform motion-safe:duration-spring motion-safe:ease-spring motion-safe:group-hover/area:scale-100 motion-safe:group-focus-within/area:scale-100 ${SHOW}`}>
          <Icon name="check" size={12} />
        </span>
      )}
    </span>
  );
}

function TaskRow({ name, initials, hue, time, done, ticks }: { name: string; initials: string; hue: "lake" | "moss"; time: string; done?: boolean; ticks?: boolean }) {
  return (
    <p className="mt-1.5 flex items-center gap-2">
      <Check done={done} ticks={ticks} />
      <span className={`flex-1 truncate ${done ? "text-muted-foreground line-through decoration-line-3" : ""}`}>{name}</span>
      <Face initials={initials} hue={hue} size={18} />
      <span className="w-[52px] text-right text-[12px] tabular-nums text-muted-foreground">{time}</span>
    </p>
  );
}

function GoalMoment() {
  return (
    <Peek label="A goal, Q4 launch ships, 72 percent done and filled in from its project's tasks, with the time spent on each task.">
      <p className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-[590]">
          <span className="rounded-[5px] bg-hue-tint px-1.5 text-[11px] font-[510] leading-[18px] text-hue-ink">Goal</span>
          Q4 launch ships
        </span>
        <Swap from="72%" to="86%" className="text-[12px] font-[590]" />
      </p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <span
          aria-hidden="true"
          className="block h-full w-full origin-left scale-x-[0.72] rounded-full bg-hue transition-transform duration-panel ease-out motion-safe:group-hover/area:scale-x-[0.86] motion-safe:group-focus-within/area:scale-x-[0.86]"
        />
      </div>
      <TaskRow name="Rollback steps" initials="MC" hue="moss" time="35m" done />
      <TaskRow name="Load test" initials="MC" hue="moss" time="1h 20m" done />
      <TaskRow name="Announcement" initials="SR" hue="lake" time="45m" ticks />
    </Peek>
  );
}

/* -------------------------------------------------------------- calendar */

function Slot({ time, picks = false }: { time: string; picks?: boolean }) {
  return (
    <span className="relative grid h-7 place-items-center rounded-md text-[12px] font-[510] tabular-nums text-foreground ring-1 ring-inset ring-line-2">
      {time}
      {picks && (
        <span className={`absolute inset-0 flex items-center justify-center gap-1 rounded-md bg-hue-tint text-hue-ink ring-[1.5px] ring-inset ring-hue ${SHOW}`}>
          <Icon name="check" size={12} />
          {time}
        </span>
      )}
    </span>
  );
}

function BookingMoment() {
  return (
    <Peek label="A booking page: 30 minutes with Sam Rivera on Tuesday 21 October, eight free times shown in the visitor's time zone, one of them being picked.">
      <p className="flex items-center gap-2">
        <Face initials="SR" hue="lake" size={20} />
        <span className="font-[590]">30 minutes with Sam Rivera</span>
      </p>
      <p className="mt-1 text-[12px] leading-4 text-muted-foreground">Tue 21 Oct, in your time zone</p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <Slot time="10:00" />
        <Slot time="10:30" picks />
        <Slot time="11:00" />
        <Slot time="11:30" />
        <Slot time="14:00" />
        <Slot time="14:30" />
        <Slot time="15:30" />
        <Slot time="16:00" />
      </div>
    </Peek>
  );
}

/* ---------------------------------------------------------------- tables */

const BUDGET = [
  ["Ads", "4,000", "2,750", "1,250"],
  ["Venue", "6,500", "6,500", "0"],
  ["Swag", "1,900", "1,240", "660"],
] as const;

function TableMoment() {
  return (
    <Peek label="A table, Launch budget, whose Left column is a formula, Budget minus Spent, worked out on every row.">
      <p className="flex items-center justify-between gap-2">
        <span className="font-[590]">Launch budget</span>
        <span className="truncate rounded-[5px] bg-muted px-1.5 font-mono text-[11px] leading-[18px] text-muted-foreground shadow-[inset_0_0_0_1px_var(--line-c)]">
          {"{Budget} - {Spent}"}
        </span>
      </p>
      <div className="relative mt-2 grid grid-cols-[1.2fr_1fr_1fr_1fr] text-[12px] leading-[22px] tabular-nums">
        {/* The formula's column, lit under the pointer. */}
        <span aria-hidden="true" className={`pointer-events-none absolute inset-y-0 right-0 w-1/4 rounded-[4px] bg-hue/15 ${SHOW}`} />
        {["Item", "Budget", "Spent", "Left"].map((h, i) => (
          <span key={h} className={`relative border-b border-border font-[510] text-muted-foreground ${i ? "pr-1.5 text-right" : ""}`}>
            {i === 3 ? (
              <span className="inline-flex items-center gap-1">
                <span className="font-mono text-[10px] italic text-hue-ink">fx</span>
                {h}
              </span>
            ) : (
              h
            )}
          </span>
        ))}
        {BUDGET.map((row) =>
          row.map((cell, i) => (
            <span key={`${row[0]}-${i}`} className={`relative border-b border-border ${i ? "pr-1.5 text-right" : ""} ${i === 3 ? "font-[510] text-foreground" : ""}`}>
              {cell}
            </span>
          )),
        )}
      </div>
    </Peek>
  );
}

/** The areas the box shows, each with its moment. Agents have the page's night section to themselves. */
export type BoxArea = Exclude<Area, "agents">;

export const MOMENT: Record<BoxArea, () => JSX.Element> = {
  chat: PollMoment,
  calls: CallMoment,
  docs: DocMoment,
  projects: GoalMoment,
  calendar: BookingMoment,
  tables: TableMoment,
};
