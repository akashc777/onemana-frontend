import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";

const FOUNDER_AVATAR =
  "https://avatars.githubusercontent.com/u/32003795?s=256&v=4";

/** About page — founder story, aligned with homepage voice and design tokens. */
export function AboutView() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Built in Bangalore, run on our own server"
        subtitle="OneCamp is a self-hosted workspace from OneMana. One founder, one product, no borrowed playbook."
        divider
      />

      <article className="container-x mx-auto max-w-prose pb-20">
        <Reveal>
          <div className="prose max-w-none prose-headings:tracking-[-0.02em] prose-headings:text-foreground prose-p:leading-relaxed prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-brand">
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
              So instead of complaining about it on Twitter like a normal person, I built <strong>OneCamp</strong> — a
              self-hosted workspace that puts chat, tasks, docs, video, calendar, and local AI in one place. Because
              apparently, I enjoy pain.
            </p>
            <p>
              <strong>{site.company}</strong> is a one-person company (the &quot;OPC&quot; is in the name for a reason —
              One Person Company, it&apos;s literally right there). Headquartered in Bangalore, where the coffee is strong,
              the traffic is stronger, and the startups are strongest. We run the entire business on the product we ship.
            </p>

            <h2>What we believe</h2>
            <p>
              Small teams and solo warriors 🥷 deserve the same powerful tools big companies get — without the
              enterprise price tag, without the vendor lock-in, and without someone else owning your data. Pay once (or
              let us host it), but the product should never hold your data hostage. The frontend is open on GitHub. The
              backend runs on your server. That is the deal.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="card-premium card mt-12 bg-card/90 p-8 text-center sm:p-10">
            <div className="premium-frame-accent mx-auto mb-6 h-px w-16" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FOUNDER_AVATAR}
              alt="Akash Hadagali"
              width={112}
              height={112}
              className="mx-auto h-28 w-28 rounded-full border-2 border-brand/25 object-cover shadow-[0_8px_32px_rgb(255_77_0/0.12)]"
            />
            <h3 className="mt-5 text-lg font-semibold text-foreground">Akash Hadagali</h3>
            <p className="mt-1 text-sm font-medium text-brand">Founder, OneMana</p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Founder, CEO, CTO, Designer, Intern &amp; Coffee Machine Operator. Writes the code. Fixes the bugs.
              Deploys at 2 AM. Answers support emails. Also somehow finds time to eat.
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">The team: all 1 of us.</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href={site.githubUrl} external variant="ghost" size="sm">
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
        </Reveal>

        <Reveal delay={120} className="mt-10 text-center text-sm text-muted-foreground">
          <p>
            Questions?{" "}
            <a href="mailto:support@onemana.dev" className="font-medium text-brand hover:underline">
              support@onemana.dev
            </a>
          </p>
          <p className="mt-2">
            <Link href="/buy" className="font-medium text-foreground hover:text-brand">
              Get OneCamp
            </Link>
            {" · "}
            <Link href={site.demoUrl} className="font-medium text-foreground hover:text-brand">
              Try the live demo
            </Link>
          </p>
        </Reveal>
      </article>
    </>
  );
}