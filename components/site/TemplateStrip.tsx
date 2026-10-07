import Link from "next/link";
import { site } from "@/lib/site";
import { taskCount, templates, weeksLong } from "@/lib/templates";

/**
 * The built-in project templates on the homepage, by name and size. Each opens
 * its own page (the whole plan, week by week); the last cell opens New project
 * in the live demo, where the AI drafts a plan from a sentence. Names and
 * counts only: the plans themselves are read on their pages, so the homepage's
 * prose budget (app/landingWordBudget.test.ts) stays where it is.
 */
export function TemplateStrip() {
  return (
    <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {templates.map((t) => {
        const weeks = weeksLong(t);
        return (
          <li key={t.id}>
            <Link
              href={`/templates/${t.id}`}
              className="group flex h-full flex-col rounded-xl border border-border p-4 transition-colors hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <span className="text-sm font-semibold text-foreground group-hover:text-brand">{t.name}</span>
              <span className="mt-1 text-xs tabular-nums text-muted-foreground">
                {taskCount(t)} tasks · {weeks} {weeks === 1 ? "week" : "weeks"}
              </span>
            </Link>
          </li>
        );
      })}
      <li>
        <a
          href={site.demoUrlTo("templates")}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-full flex-col rounded-xl border border-dashed border-border p-4 transition-colors hover:border-brand/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <span className="text-sm font-semibold text-foreground group-hover:text-brand">Or describe your own</span>
          <span className="mt-1 text-xs text-muted-foreground">One sentence, and the AI drafts the plan</span>
        </a>
      </li>
    </ul>
  );
}
