import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { StackedCards } from "@/components/ui/graphics/v3marks";
import { TemplateTile } from "@/components/site/TemplateTile";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { hueFor } from "@/lib/campHue";
import { ButtonLink } from "@/components/ui/Button";
import { gallerySpans } from "@/components/site/gallery";
import { landingMetadata } from "@/lib/landingMetadata";
import { taskCount, templates, weeksLong } from "@/lib/templates";
import { FREE_SEATS } from "@/lib/freePlan";
import { site } from "@/lib/site";

const meta = {
  seoTitle: "Free project templates: client project, launch, onboarding and more",
  seoDescription:
    "Project plans you can start from in OneCamp: every task with what done looks like, its priority and its date, counted from the day you start. Free, self-hosted, open source.",
};

export const metadata: Metadata = landingMetadata(meta, "/templates");

/** Each week's share of the plan's tasks, 0 to 1 against the busiest week. */
function weekShares(t: Parameters<typeof taskCount>[0]): number[] {
  const weeks = Math.max(1, weeksLong(t));
  const counts = Array.from({ length: Math.min(weeks, 8) }, () => 0);
  for (const task of t.tasks) for (const d of [task.due_day ?? 0, ...(task.subtasks ?? []).map((x) => x.due_day ?? 0)]) counts[Math.min(counts.length - 1, Math.floor(d / 7))]! += 1;
  const most = Math.max(1, ...counts);
  return counts.map((c) => c / most);
}

export default function TemplatesPage() {
  return (
    <>
      {/* The two ways in sit under the words they answer, 32 px down as on
          every other page; outside the header they were 72 px down. */}
      <PageHeader
        eyebrow="Project templates"
        title="Start a project with its plan already in it"
        subtitle={`Each template is a whole plan: the tasks in order, what done looks like for each, and dates that count from the day you start. They're built into OneCamp, free for up to ${FREE_SEATS} people on your own server.`}
        align="left"
        art={<StackedCards />}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={site.demoUrlTo("templates")} external variant="brand" size="lg">
            Try them in the live demo
          </ButtonLink>
          <ButtonLink href="/free" variant="ghost" size="lg">Start free, up to {FREE_SEATS} people</ButtonLink>
        </div>
      </PageHeader>
      <section className="pb-20 sm:pb-28">
        <div className="container-x">
          {/* Each template has its identity colour, as a project has in the
              app (hueFor on its id), and the card lifts a pixel under the
              pointer because the whole card is the link. The focus ring is
              the site's own. */}
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
            {templates.map((t, i) => (
              <li key={t.id} className={gallerySpans(templates.length)[i]}>
                <Link
                  href={`/templates/${t.id}`}
                  data-hue={hueFor(t.id)}
                  className={`${HUE_CLASS[hueFor(t.id)]} reveal lift group flex h-full flex-col rounded-2xl bg-card p-6 shadow-e1`}
                >
                  {/* The project tile (DESIGN_V3): the hue's gradient under the template's own white glyph. */}
                  <TemplateTile id={t.id} />
                  <h2 className="mt-4 font-sans text-body font-[590] text-foreground">
                    {t.name}
                  </h2>
                  <p className="mt-1.5 flex-1 text-small text-muted-foreground">{t.description}</p>
                  {/* A mini timeline: one bar a week, its length the share of the
                      plan's tasks due that week; the bars fill out on hover. */}
                  <div aria-hidden="true" className="mt-5 flex h-1.5 gap-1">
                    {weekShares(t).map((w, i) => (
                      <span key={i} className="h-full flex-1 origin-left scale-x-[0.85] rounded-[3px] bg-hue transition-transform duration-page ease-out group-hover:scale-x-100" style={{ opacity: 0.3 + 0.7 * w, transitionDelay: `${i * 30}ms` }} />
                    ))}
                  </div>
                  <p className="mt-3 text-caption tabular-nums text-faint">
                    {taskCount(t)} tasks · {weeksLong(t)} {weeksLong(t) === 1 ? "week" : "weeks"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-2xl text-small text-muted-foreground">
            Run a project your team repeats? Save it as a template in OneCamp and everyone starts from it next time.{" "}
            <Link href="/docs/project-templates" className="link">
              How templates work
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
