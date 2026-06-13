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
              It started the way most of this did: too many tabs before the first coffee. Slack for chat. Notion for
              docs. Something else for tasks. Zoom when we needed to talk. A calendar that never quite matched the rest.
            </p>
            <p>
              I did not want another subscription stack. I wanted one workspace on hardware we control. So I built{" "}
              <strong>OneCamp</strong> for <strong>OneMana</strong>, the company behind it, and we have run the business on
              it every day since.
            </p>
            <p>
              <strong>{site.company}</strong> is a one-person company (OPC is in the name for a reason). Based in{" "}
              <strong>Bangalore</strong>. Small team tools without enterprise pricing, without vendor lock-in, and without
              your data sitting on someone else&apos;s machine.
            </p>

            <h2>What we believe</h2>
            <p>
              Teams should own their workspace the same way they own their code and their customer relationships. Pay once
              or host with us, but the product should not hold your data hostage. The frontend is open on GitHub. The
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
              Writes the code, answers support mail, and still ships features from the same app this page is selling.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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