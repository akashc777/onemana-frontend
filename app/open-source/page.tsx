import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { RepoCards } from "@/components/site/RepoCard";
import { ButtonLink } from "@/components/ui/Button";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { OpenSourceMark } from "@/components/ui/graphics/OpenSourceMark";
import { Icon, NewTabMark } from "@/components/ui/icons";
import { Margin, MarginHeading, SECTION_END, Section, SectionHeading } from "@/components/ui/Section";
import type { CampHue } from "@/lib/campHue";
import { FREE_SEATS } from "@/lib/freePlan";
import { factsFor, getOpenSource } from "@/lib/github";
import { landingMetadata } from "@/lib/landingMetadata";
import { OPEN_SOURCE_LINKS as L, REPO_COPY } from "@/lib/openSource";
import { site } from "@/lib/site";

const meta = {
  seoTitle: "Open source, end to end",
  seoDescription:
    "OneCamp's server is open source under AGPL-3.0, and its web, desktop and Omarchy apps under MIT. Read the code, run it on your own server, and see how to contribute.",
};

export const metadata: Metadata = landingMetadata(meta, "/open-source");

/** A link in a spec's detail: on this site, or out to GitHub in a new tab, saying so. */
function SpecLink({ href, children }: { href: string; children: string }) {
  return href.startsWith("/") ? (
    <Link href={href} className="go tap-target">
      {children}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noreferrer" className="go tap-target">
      {children}
      <NewTabMark />
    </a>
  );
}

interface Spec {
  term: string;
  /** The repositories it speaks for, as their cards' dots. */
  hues?: CampHue[];
  detail: ReactNode;
  links?: { label: string; href: string }[];
}

/** The page's definition list: the term in ink, after its dots, the detail under it, its links last. */
function SpecList({ items, columns = 2 }: { items: Spec[]; columns?: 1 | 2 }) {
  return (
    <dl className={`m-0 grid gap-x-10 gap-y-8 border-t border-border pt-8 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {items.map((s) => (
        <div key={s.term} className="min-w-0">
          <dt className="flex items-center gap-2 text-body font-[590] text-foreground">
            {s.hues?.map((h) => <span key={h} aria-hidden="true" className={`${HUE_CLASS[h]} size-2 shrink-0 rounded-full bg-hue`} />)}
            {s.term}
          </dt>
          <dd className="m-0 mt-1.5 text-small leading-[22px] text-muted-foreground">
            {s.detail}
            {s.links && (
              <span className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                {s.links.map((l) => (
                  <SpecLink key={l.href} href={l.href}>
                    {l.label}
                  </SpecLink>
                ))}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * What is open, and how to run it (the owner's ask, 15 Oct 2026): every
 * repository with its stars and its newest release, read from GitHub
 * (lib/github.ts); the two ways to run it; why the server is AGPL-3.0 and the
 * apps MIT, in plain words; and how to help, security problems included,
 * pointing to the repositories' own CONTRIBUTING.md and SECURITY.md rather
 * than describing a process of its own.
 *
 * The cards show no number when GitHub is silent; nothing else on the page
 * depends on the read.
 */
export default async function OpenSourcePage() {
  const facts = await getOpenSource();
  return (
    <>
      <PageHeader
        title={"OneCamp is open\u00a0source"}
        subtitle="Every part of it is on GitHub: the server, the web app, the desktop app and the Omarchy kit. Read every line, run it on your own server, and change what you need."
        art={<OpenSourceMark />}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={site.serverGithubUrl} external variant="brand" size="lg">
            <Icon name="github" size={16} />
            Star OneCamp on GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </ButtonLink>
          <ButtonLink href="/free" variant="ghost" size="lg">
            Install free, up to {FREE_SEATS} people
          </ButtonLink>
        </div>
      </PageHeader>

      {/* What's open: one card a repository, with what GitHub says of it now. */}
      <section aria-label="The repositories" className={SECTION_END}>
        <div className="container-x">
          <RepoCards copies={REPO_COPY} facts={(repo) => factsFor(facts, repo)} />
        </div>
      </section>

      <Section id="run">
        <Margin aside={<MarginHeading title="Run it yourself" subtitle="The same code, two ways to run it." />}>
          <SpecList
            columns={1}
            items={[
              {
                term: "From source",
                detail: "Clone the server and build it with the script its README names. It runs for any number of people under AGPL-3.0, and you rebuild it to update.",
                links: [{ label: "The steps, in the README", href: L.readme }],
              },
              {
                term: "The official release",
                detail: `One command on a server with 4 GB of RAM installs the ready-made release, and one command updates it. It is free for up to ${FREE_SEATS} people; a licence removes the limit and adds company sign-in.`,
                links: [
                  { label: "Install free", href: "/free" },
                  { label: "Install guide", href: "/docs/installation" },
                ],
              },
            ]}
          />
        </Margin>
      </Section>

      <Section id="licences">
        <SectionHeading
          layout="split"
          title="Why two licences"
          subtitle="AGPL-3.0 keeps the server open for everyone who uses it. MIT keeps the apps easy to build on."
          className="mb-10"
        />
        <SpecList
          items={[
            {
              term: "The server: AGPL-3.0",
              hues: ["sky"],
              detail:
                "Use it, read it and change it, for any purpose and at any size, for free. If you change it and let people outside your organisation use your version over a network, offer them the source of your changes under the same licence. So nobody can take OneCamp private and sell it back as a closed hosted service. If your company cannot accept those terms, the commercial licence removes them.",
              links: [
                { label: "The AGPL-3.0 licence", href: L.serverLicence },
                { label: "The commercial licence", href: L.commercialLicence },
              ],
            },
            {
              term: "The apps: MIT",
              hues: ["moss", "sun", "dusk"],
              detail:
                "The web app, the desktop app and the Omarchy kit only talk to a server you run. MIT lets you reuse them anywhere, open or closed, as long as the copyright notice stays with them: build your own client, change how it looks, or ship it inside something else.",
              links: [{ label: "The MIT licence", href: L.webLicence }],
            },
          ]}
        />
      </Section>

      <Section id="contribute">
        <Margin aside={<MarginHeading title="Help build it" subtitle="A very small team builds OneCamp, in the open." />}>
          <SpecList
            items={[
              {
                term: "Found a bug",
                detail: "Open an issue with what you did, what you expected and what happened.",
                links: [{ label: "Open an issue", href: L.issues }],
              },
              {
                term: "Have an idea",
                detail: "Start a discussion first, so the shape is agreed before anyone writes code.",
                links: [{ label: "Discussions", href: L.discussions }],
              },
              {
                term: "Sending code",
                detail: "Read the contributing guide first. Pull requests to the server come with a contributor licence agreement, because the server is also offered under a commercial licence.",
                links: [{ label: "CONTRIBUTING.md", href: L.contributing }],
              },
              {
                term: "Found a security problem",
                detail: "Never in a public issue. Report it privately, on GitHub or by email, as the security policy describes.",
                links: [
                  { label: "Report it privately", href: L.privateReport },
                  { label: "SECURITY.md", href: L.security },
                ],
              },
            ]}
          />
        </Margin>
      </Section>
    </>
  );
}
