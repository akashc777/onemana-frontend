import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { IdentityMark } from "@/components/ui/graphics/IdentityMark";
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

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Project templates"
        title="Start a project with its plan already in it"
        subtitle={`Each template is a whole plan: the tasks in order, what done looks like for each, and dates that count from the day you start. They're built into OneCamp, free for up to ${FREE_SEATS} people on your own server.`}
        align="left"
        className="!pb-0"
      />
      <section className="pb-16 pt-8">
        <div className="container-x">
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={site.demoUrlTo("templates")} external variant="brand" size="lg">
              Try them in the live demo
            </ButtonLink>
            <ButtonLink href="/free" variant="ghost" size="lg">Start free, up to {FREE_SEATS} people</ButtonLink>
          </div>
          {/* Each template has its identity colour, as a project has in the
              app (hueFor on its id), and the card lifts a pixel under the
              pointer because the whole card is the link. The focus ring is
              the site's own. */}
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
            {templates.map((t, i) => (
              <li key={t.id} className={gallerySpans(templates.length)[i]}>
                <Link
                  href={`/templates/${t.id}`}
                  className="group flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-px hover:border-border-strong hover:shadow-popover"
                >
                  <h2 className="flex items-center gap-2.5 font-sans text-body font-semibold tracking-normal text-foreground">
                    <IdentityMark id={t.id} variant="square" />
                    {t.name}
                  </h2>
                  <p className="mt-2 flex-1 text-small text-muted-foreground">{t.description}</p>
                  <p className="mt-4 text-caption font-medium tabular-nums text-muted-foreground">
                    {taskCount(t)} tasks, {weeksLong(t)} {weeksLong(t) === 1 ? "week" : "weeks"}
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
