import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { SECTION_END } from "@/components/ui/Section";
import { FREE_SEATS } from "@/lib/freePlan";
import { site } from "@/lib/site";

const FOUNDER_AVATAR =
  "https://avatars.githubusercontent.com/u/32003795?s=256&v=4";

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
    body: (
      <ul>
        <li>
          I answer support myself, at{" "}
          <a href="mailto:support@onemana.dev" className="link">
            support@onemana.dev
          </a>
          .
        </li>
        <li>
          The code is public on{" "}
          <a href={site.githubOrgUrl} target="_blank" rel="noreferrer" className="link">
            GitHub
          </a>
          , so your install does not depend on me. A paid build has no licence server and no phone-home: it keeps
          running if OneMana stops.
        </li>
        <li>OneMana runs its own work on OneCamp, every day.</li>
        <li>You pay {site.company}, the registered company, through Razorpay, and get a GST invoice.</li>
      </ul>
    ),
  },
];

export function AboutView() {
  return (
    <>
      <PageHeader
        title="One person builds OneCamp, in Bengaluru"
        subtitle="OneMana Solutions is a one-person company. This is what that means if you are deciding whether to run your team on what it makes."
        divider
      />

      <div className={`container-x pt-12 ${SECTION_END}`}>
        {SECTIONS.map((s) => (
          <section key={s.title} className="grid gap-4 border-b border-border py-10 first:pt-0 lg:grid-cols-12 lg:gap-x-8">
            <h2 className="text-h3 text-foreground lg:col-span-4">{s.title}</h2>
            <div className="max-w-prose space-y-4 text-body text-muted-foreground lg:col-span-8 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-5">
              {s.body}
            </div>
          </section>
        ))}

        <section id="contact" className="grid gap-4 py-10 lg:grid-cols-12 lg:gap-x-8">
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
        <div className="grid border-t border-border pt-10 lg:grid-cols-12 lg:gap-x-8">
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
