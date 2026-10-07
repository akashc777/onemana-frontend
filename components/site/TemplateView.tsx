import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { FREE_SEATS } from "@/lib/freePlan";
import {
  byWeek,
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
  return (
    <>
      <PageHeader eyebrow="Project template" title={t.name} subtitle={t.description} align="left" className="!pb-0" />

      <section className="pb-16 pt-8">
        <div className="container-x">
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={demoTemplateUrl(t.id)} external variant="brandPremium" size="lg">
              Use it in the live demo
            </ButtonLink>
            <ButtonLink href="/free" variant="ghost" size="lg">Start free, up to {FREE_SEATS} people</ButtonLink>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <ol className="grid gap-10" aria-label="The plan, week by week">
              {weeks.map((w) => (
                <li key={w.week}>
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Week {w.week}</h2>
                  <ul className="mt-3 grid gap-3">
                    {w.tasks.map((task) => (
                      <TaskCard key={task.name} task={task} />
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            <aside className="grid content-start gap-6 lg:sticky lg:top-24">
              <section aria-labelledby="glance" className="rounded-xl border border-border p-5">
                <h2 id="glance" className="text-sm font-semibold text-foreground">At a glance</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
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
                  <p className="mt-3 text-sm text-muted-foreground">
                    Adds {t.statuses.length === 1 ? "a column" : "columns"} to the board:{" "}
                    <span className="text-foreground">{t.statuses.map((s) => s.name).join(", ")}</span>.
                  </p>
                )}
              </section>

              <section aria-labelledby="how" className="rounded-xl border border-border p-5">
                <h2 id="how" className="text-sm font-semibold text-foreground">Start from it in OneCamp</h2>
                <ol className="mt-3 grid list-decimal gap-2 pl-5 text-sm text-muted-foreground">
                  <li>Open <span className="text-foreground">New project</span> and pick <span className="text-foreground">{t.name}</span> under Start from.</li>
                  <li>Choose the day it starts. Every date counts from it, and nothing lands on a weekend.</li>
                  <li>Assign the tasks: select several with X, then A.</li>
                </ol>
                <p className="mt-3 text-sm text-muted-foreground">
                  Built into OneCamp v2.54 and later. To change it and keep your own,{" "}
                  <a href={`/templates/${t.id}/file`} download className="underline underline-offset-4">download the template file</a>{" "}
                  and add it with <span className="text-foreground">Add a template file</span>.
                </p>
              </section>

              <nav aria-labelledby="more" className="rounded-xl border border-border p-5">
                <h2 id="more" className="text-sm font-semibold text-foreground">More templates</h2>
                <ul className="mt-3 grid gap-1.5 text-sm">
                  {others.map((o) => (
                    <li key={o.id}>
                      <Link href={`/templates/${o.id}`} className="text-muted-foreground hover:text-foreground">{o.name}</Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/templates" className="text-muted-foreground hover:text-foreground">All templates</Link>
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
  const blocks = descriptionBlocks(task.description);
  const paragraphs = blocks.filter((b) => b.kind === "p");
  const items = blocks.filter((b) => b.kind === "li");
  const when =
    task.due_day === undefined
      ? null
      : task.start_day !== undefined && task.start_day < task.due_day
        ? `${dayLabel(task.start_day)} to ${dayLabel(task.due_day)}`
        : dayLabel(task.due_day);
  return (
    <li className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-semibold text-foreground">{task.name}</h3>
        <p className="text-xs tabular-nums text-muted-foreground">
          {when}
          {when && task.priority && " · "}
          {task.priority && `${PRIORITY[task.priority] ?? task.priority} priority`}
        </p>
      </div>
      {paragraphs.map((b) => (
        <p key={b.text} className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{b.text}</p>
      ))}
      {items.length > 0 && (
        <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
          {items.map((b) => <li key={b.text} className="flex gap-2"><span aria-hidden>·</span>{b.text}</li>)}
        </ul>
      )}
      {!!task.subtasks?.length && (
        <ul className="mt-3 grid gap-1 text-sm text-muted-foreground" aria-label={`Steps in ${task.name}`}>
          {task.subtasks.map((s) => (
            <li key={s.name} className="flex items-center gap-2">
              <span aria-hidden className="h-3.5 w-3.5 shrink-0 rounded border border-border" />
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
