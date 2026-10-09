import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";

const FOUNDER_AVATAR =
  "https://avatars.githubusercontent.com/u/32003795?s=256&v=4";

/** About page - founder story, aligned with homepage voice and design tokens. */
export function AboutView() {
  return (
    <>
      <PageHeader
        title="Built in Bangalore, run on our own server"
        subtitle="OneCamp is a self-hosted workspace from OneMana. One founder, one product, no borrowed playbook."
        divider
      />

      <div className="container-x pb-20 pt-10">
      <article className="max-w-[46rem]">
        <div>
          <div className="prose max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
            <h2>The story</h2>
            <p>
              One person. One mission. One slightly over-ambitious product roadmap.
            </p>
            <p>
              It started the way most of this did: too many tabs before the first coffee. Slack for chat. Notion for
              docs. Something else for tasks. Zoom when we needed to talk. A calendar that never quite matched the rest.
              It was getting ridiculous.
            </p>
            <p>
              So instead of complaining about it on Twitter like a normal person, I built <strong>OneCamp</strong>, a
              self-hosted workspace that puts chat, tasks, docs, video, calendar, and local AI in one place. Because
              apparently, I enjoy pain.
            </p>
            <p>
              <strong>{site.company}</strong> is a one-person company (the &quot;OPC&quot; is in the name for a reason: One
              Person Company, it&apos;s literally right there). Headquartered in Bangalore, where the coffee is strong,
              the traffic is stronger, and the startups are strongest. We run the entire business on the product we ship.
            </p>

            <h2>What we believe</h2>
            <p>
              Small teams and solo warriors deserve the same powerful tools big companies get, without the
              enterprise price tag, without the vendor lock-in, and without someone else owning your data. Pay once (or
              let us host it), but the product should never hold your data hostage. All of it is open source on GitHub
              under AGPL-3.0, the server and the web app, both editions. It runs on your server, or on one we run for
              you. That is the deal.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-border pt-8 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FOUNDER_AVATAR} alt="Akash Hadagali" width={72} height={72} className="h-[72px] w-[72px] shrink-0 rounded-full object-cover" />
          <div>
            <h2 className="text-h3 text-foreground">Akash Hadagali</h2>
            <p className="text-small text-muted-foreground">Founder, OneMana. The team: all 1 of us.</p>
            <p className="mt-3 max-w-prose text-small text-muted-foreground">
              Founder, CEO, CTO, Designer, Intern &amp; Coffee Machine Operator. Writes the code. Fixes the bugs.
              Deploys at 2 AM. Answers support emails. Also somehow finds time to eat.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href={site.githubOrgUrl} external variant="ghost" size="sm">
                GitHub
              </ButtonLink>
              <ButtonLink href={site.twitter} external variant="ghost" size="sm">
                Twitter
              </ButtonLink>
              <ButtonLink href="/blog" variant="ghost" size="sm">
                Blog
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-small text-muted-foreground">
          <p id="contact" className="scroll-mt-24">
            Questions?{" "}
            <a href="mailto:support@onemana.dev" className="link">
              support@onemana.dev
            </a>
          </p>
          <p className="mt-2">
            <a href={site.demoStartUrl} target="_blank" rel="noreferrer" className="link">
              Try the live demo
            </a>
            {" · "}
            <Link href="/free" className="link">
              Install free
            </Link>
          </p>
        </div>
      </article>
      </div>
    </>
  );
}