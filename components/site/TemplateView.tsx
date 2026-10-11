import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { IdentityMark } from "@/components/ui/graphics/IdentityMark";
import { TemplateTile } from "@/components/site/TemplateTile";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { hueFor } from "@/lib/campHue";
import { FREE_SEATS } from "@/lib/freePlan";
import {
  byWeek,
  groupLists,
  dayLabel,
  demoTemplateUrl,
  descriptionBlocks,
  taskCount,
  templates,
  weeksLong,
  type ProjectTemplate,
  type TemplateTask,
} from "@/lib/templates";

const PRIORITY: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };

/**
 * One template's page: the plan as a project made from it reads, week by
 * week, then how to start from it. Everything shown comes from the app's own
 * template (lib/templates), so the page can't promise a task the app won't make.
 */
export function TemplateView({ t }: { t: ProjectTemplate }) {
  const weeks = byWeek(t);
  const others = templates.filter((o) => o.id !== t.id);
  const length = weeksLong(t);
  const hue = hueFor(t.id);
  return (
    <>
      {/* The two ways in sit under the words they answer, 32 px down and
          full width on a phone, as on every other page. */}
      <PageHeader
        eyebrow="Project template"
        size="read"
        title={
          <span className="flex items-center gap-4">
            {/* The project tile (site.md T2): the hue's avatar gradient under the template's white glyph. */}
            <TemplateTile id={t.id} size="lg" />
            {t.name}
          </span>
        }
        subtitle={t.description}
        align="left"
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={demoTemplateUrl(t.id)} external variant="brand" size="lg">
            Use it in the live demo
          </ButtonLink>
          <ButtonLink href="/free" variant="ghost" size="lg">Start free, up to {FREE_SEATS} people</ButtonLink>
        </div>
      </PageHeader>

      <section className="pb-20 sm:pb-28">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            {/* A week timeline (site.md T2): a spine down the left, a node in
                the template's hue at each week, the week's tasks as cards. */}
            <ol className={`${HUE_CLASS[hue]} relative grid gap-10 pl-8 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-0.5 before:rounded-full before:bg-line-2 before:content-['']`} aria-label="The plan, week by week">
              {weeks.map((w, i) => (
                <li key={i} className="reveal relative">
                  <span aria-hidden="true" className="pointer-events-none absolute -left-8 top-1 size-3 rounded-full bg-hue ring-4 ring-background" />
                  <h2 className="font-sans text-small font-[590] text-foreground">Week {w.week}</h2>
                  <ul className="mt-3 grid gap-3">
                    {w.tasks.map((task) => (
                      <TaskCard key={task.name} task={task} />
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            <aside className="grid content-start gap-6 lg:sticky lg:top-24">
              {/* One card holds what to know and how to start (T2). */}
              <div className="rounded-2xl bg-card p-5 shadow-e1">
              <section aria-labelledby="glance">
                <h2 id="glance" className="text-small font-semibold text-foreground">At a glance</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-small">
                  <div>
                    <dt className="text-muted-foreground">Tasks</dt>
                    <dd className="font-semibold tabular-nums text-foreground">{taskCount(t)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Runs for</dt>
                    <dd className="font-semibold tabular-nums text-foreground">{length} {length === 1 ? "week" : "weeks"}</dd>
                  </div>
                </dl>
                {!!t.statuses?.length && (
                  <p className="mt-3 text-small text-muted-foreground">
                    Adds {t.statuses.length === 1 ? "a column" : "columns"} to the board:{" "}
                    <span className="text-foreground">{t.statuses.map((s) => s.name).join(", ")}</span>.
                  </p>
                )}
              </section>

              <section aria-labelledby="how" className="mt-5 border-t border-border pt-5">
                <h2 id="how" className="text-small font-semibold text-foreground">Start from it in OneCamp</h2>
                <ol className="mt-3 grid list-decimal gap-2 pl-5 text-small text-muted-foreground">
                  <li>Open <span className="text-foreground">New project</span> and pick <span className="text-foreground">{t.name}</span> under Start from.</li>
                  <li>Choose the day it starts. Every date counts from it, and nothing lands on a weekend.</li>
                  <li>Assign the tasks: select several with X, then A.</li>
                </ol>
                <p className="mt-3 text-small text-muted-foreground">
                  Built into OneCamp. To change it and keep your own,{" "}
                  <a href={`/templates/${t.id}/file`} download className="underline underline-offset-4">download the template file</a>{" "}
                  and add it with <span className="text-foreground">Add a template file</span>.
                </p>
              </section>
              </div>

              <nav aria-labelledby="more" className="px-1">
                <h2 id="more" className="text-small font-semibold text-foreground">More templates</h2>
                {/* A stacked list: each row is 44 px on a phone, as the
                    footer's are, so neighbouring targets never overlap. */}
                <ul className="mt-3 grid text-small sm:gap-1.5">
                  {others.map((o) => (
                    <li key={o.id}>
                      <Link href={`/templates/${o.id}`} className="inline-flex min-h-11 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground sm:min-h-0">
                        <IdentityMark id={o.id} variant="square" />
                        {o.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/templates" className="inline-flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0">All templates</Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

function TaskCard({ task }: { task: TemplateTask }) {
  const blocks = groupLists(descriptionBlocks(task.description));
  const when =
    task.due_day === undefined
      ? null
      : task.start_day !== undefined && task.start_day < task.due_day
        ? `${dayLabel(task.start_day)} to ${dayLabel(task.due_day)}`
        : dayLabel(task.due_day);
  return (
    <li className="rounded-xl bg-card p-4 shadow-e1">
      <div className="flex flex-col gap-y-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4">
        <h3 className="text-small font-[510] text-foreground">{task.name}</h3>
        <p className="text-caption tabular-nums text-muted-foreground">
          {when}
          {when && task.priority && " · "}
          {task.priority && `${PRIORITY[task.priority] ?? task.priority} priority`}
        </p>
      </div>
      {blocks.map((b, i) =>
        typeof b === "string" ? (
          <p key={i} className="mt-1.5 whitespace-pre-line text-small text-muted-foreground">{b}</p>
        ) : (
          <ul key={i} className="mt-2 grid gap-1 text-small text-muted-foreground">
            {b.map((item, j) => <li key={j} className="flex gap-2"><span aria-hidden>·</span>{item}</li>)}
          </ul>
        ),
      )}
      {!!task.subtasks?.length && (
        <ul className="mt-3 grid gap-1 text-small text-muted-foreground" aria-label={`Steps in ${task.name}`}>
          {task.subtasks.map((s) => (
            <li key={s.name} className="flex items-center gap-2.5">
              {/* The app's checkbox (§3.10), unticked: a step still to do. */}
              <span aria-hidden className="ui-check" />
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
