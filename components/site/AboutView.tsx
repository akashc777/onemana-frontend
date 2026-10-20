import { TaxText } from "@/components/site/RegionalMoney";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { AgentSquare, LogoRing } from "@/components/ui/v3";
import { Tile } from "@/components/ui/graphics/Tile";
import { Icon } from "@/components/ui/icons";
import type { CampHue } from "@/lib/campHue";
import { SECTION_END } from "@/components/ui/Section";
import { FREE_SEATS } from "@/lib/freePlan";
import { site } from "@/lib/site";

/** 320px: the photo is drawn at 160 CSS px, so a 2x screen needs 320 (it was 256, soft on a laptop). */
const FOUNDER_AVATAR =
  "https://avatars.githubusercontent.com/u/32003795?s=320&v=4";

/**
 * About: who builds OneCamp, and what that means for somebody deciding
 * whether to run their team on it.
 *
 * It used to be written for a laugh ("solo warriors", "because apparently, I
 * enjoy pain", "Coffee Machine Operator"). A buyer reading an about page is
 * doing due diligence on a one-person company; the honest answer to "what if
 * he stops" is the useful one, so the page gives it in plain words. Each
 * statement is one the site makes elsewhere (lib/content beforeYouPay).
 */
/** One fact about buying from one person: its tile, then the sentence. */
function Fact({ hue, icon, children }: { hue: CampHue | "brand"; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3.5">
      <Tile hue={hue} size="sm" className="mt-0.5">
        {icon}
      </Tile>
      <span>{children}</span>
    </li>
  );
}

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Why it exists",
    body: (
      <>
        <p>
          OneCamp started as a fix for my own tabs: chat in one tool, docs in another, tasks in a third, calls in a
          fourth, and a calendar that agreed with none of them.
        </p>
        <p>
          It became one app that runs on your own server, with AI agents that can only do what the person asking
          can, and a record of everything they try.
        </p>
      </>
    ),
  },
  {
    title: "What one person means for you",
    // Rows with tiles (site.md AB1), each fact in its own colour: they were
    // four grey bullets, the plainest block on the page.
    body: (
      <ul className="m-0 list-none space-y-4 p-0">
        <Fact hue="sky" icon={<Icon name="mail" />}>
          I answer support myself, at{" "}
          <a href="mailto:support@onemana.dev" className="link">
            support@onemana.dev
          </a>
          .
        </Fact>
        <Fact hue="moss" icon={<Icon name="branch" />}>
          The code is public on{" "}
          <a href={site.githubOrgUrl} target="_blank" rel="noreferrer" className="link">
            GitHub
          </a>
          , so your install does not depend on me. A paid build has no licence server and no phone-home: it keeps
          running if OneMana stops.
        </Fact>
        <Fact hue="brand" icon={<LogoRing size={16} />}>
          OneMana runs its own work on OneCamp, every day.
        </Fact>
        <Fact hue="dusk" icon={<Icon name="receipt" />}>
          You pay {site.company}, the registered company, through Razorpay, and get <TaxText kind="invoice" />.
        </Fact>
      </ul>
    ),
  },
];

/**
 * The about page's art (site.md AB1): the founder's photo in a ring of the
 * page, the gradient logo ring orbiting it with three people as hue dots and
 * the agent's square: one person, a team's tools, an agent that answers to
 * them.
 */
function FounderOrbit() {
  return (
    <div className="relative size-[120px] lg:size-[220px]">
      <div className="spin-60 absolute inset-0">
        <LogoRing size={220} stroke={1.2} className="absolute inset-0 size-full opacity-70" />
        <span className="hue-sky absolute left-[12%] top-[8%] size-3 rounded-full bg-hue" />
        <span className="hue-moss absolute bottom-[6%] left-[30%] size-2.5 rounded-full bg-hue" />
        <span className="hue-berry absolute right-[4%] top-[42%] size-3 rounded-full bg-hue" />
        <span className="absolute right-[14%] top-[6%]">
          <AgentSquare size={20} />
        </span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={FOUNDER_AVATAR} alt="" width={160} height={160} className="absolute left-1/2 top-1/2 size-[88px] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover shadow-e3 ring-[3px] ring-background lg:size-[160px]" />
    </div>
  );
}

export function AboutView() {
  return (
    <>
      <PageHeader
        title="One person builds OneCamp, in Bengaluru"
        subtitle="OneMana Solutions is a one-person company. This is what that means if you are deciding whether to run your team on what it makes."
        art={<FounderOrbit />}
        divider
      />

      {/* 40 px under the header's rule, as under each row's. */}
      <div className={`container-x pt-10 ${SECTION_END}`}>
        {SECTIONS.map((s) => (
          <section key={s.title} className="grid gap-4 border-b border-border py-10 first:pt-0 grid-cols-1 lg:grid-cols-12 lg:gap-x-8">
            <h2 className="text-h3 text-foreground lg:col-span-4">{s.title}</h2>
            <div className="max-w-prose space-y-4 text-body text-muted-foreground lg:col-span-8">
              {s.body}
            </div>
          </section>
        ))}

        <section id="contact" className="grid gap-4 py-10 grid-cols-1 lg:grid-cols-12 lg:gap-x-8">
          <h2 className="text-h3 text-foreground lg:col-span-4">Who writes the code</h2>
          <div className="flex max-w-prose gap-5 lg:col-span-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FOUNDER_AVATAR}
              alt="Akash Hadagali"
              width={64}
              height={64}
              loading="lazy"
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-foreground">Akash Hadagali</p>
              <p className="mt-1 text-body text-muted-foreground">
                Founder of OneMana. Writes the code, ships the releases and reads the support email.
              </p>
              <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-small">
                <a href={site.githubOrgUrl} target="_blank" rel="noreferrer" className="link tap-target">
                  GitHub
                </a>
                <a href={site.twitter} target="_blank" rel="noreferrer" className="link tap-target">
                  X (Twitter)
                </a>
                <Link href="/blog" className="link tap-target">
                  The blog
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* The next step. A reader doing due diligence on a one-person company
            reached the end of the page with nowhere to go but back. */}
        <div className="grid border-t border-border pt-10 grid-cols-1 lg:grid-cols-12 lg:gap-x-8">
          <p className="max-w-prose text-body text-foreground lg:col-span-8 lg:col-start-5">
            Try it before you decide: the{" "}
            <a href={site.demoStartUrl} target="_blank" rel="noreferrer" className="link">
              live demo
            </a>{" "}
            needs no account, and the{" "}
            <Link href="/free" className="link">
              free install
            </Link>{" "}
            runs on your own server for up to {FREE_SEATS} people.
          </p>
        </div>
      </div>
    </>
  );
}
