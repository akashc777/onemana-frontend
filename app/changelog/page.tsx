import type { Metadata } from "next";
import { getChangelog } from "@/lib/releases";
import { pillEntry } from "@/lib/changelog";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/site/PageHeader";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { SECTION_END } from "@/components/ui/Section";
import { EntryDigest, EntryRows } from "@/components/changelog/Entry";
import { UpdateNote } from "@/components/changelog/UpdateNote";
import { ChangelogMark } from "@/components/ui/graphics/ChangelogMark";

const TITLE = "What's new in OneCamp";
const DESCRIPTION = "Every OneCamp release, newest first: what shipped, what was fixed, and what to know before you update.";

export const metadata: Metadata = {
  // "What's new · OneCamp", by the layout's title template.
  title: "What's new",
  description: DESCRIPTION,
  alternates: { canonical: "/changelog" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${site.url}/changelog`, type: "website", images: defaultOgImages },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: defaultTwitterImages },
};

// An hour, as long as a read of the releases is kept (RELEASES_REVALIDATE in
// lib/releases.ts, written out because Next reads this setting without
// running the module); the release webhook can refresh it sooner.
export const revalidate = 3600;

/** Entries shown as digests; older ones are a line each. */
const DIGESTS = 8;
/** Lines under "Earlier" before the page hands over to GitHub. */
const EARLIER_ROWS = 60;

/**
 * The changelog (RELEASES.md): every feature release of the server, newest
 * first, generated from the public repository's releases. Patches fold under
 * their feature release as fixes. Beside it, what an update does, because a
 * page this busy raises that question for anyone who runs their own server.
 *
 * When GitHub does not answer, the page throws rather than render an empty
 * changelog: an error while regenerating keeps the last good page, and an
 * empty one would be cached for an hour. A build that cannot reach GitHub
 * still builds, with a line saying where the releases are.
 */
export default async function ChangelogPage() {
  const entries = await getChangelog();
  if (!entries && process.env.NEXT_PHASE !== "phase-production-build") throw new Error("The releases could not be read from GitHub.");
  const list = entries ?? [];
  const newest = pillEntry(list);
  const digests = list.slice(0, DIGESTS);
  const earlier = list.slice(DIGESTS, DIGESTS + EARLIER_ROWS);

  return (
    <>
      <PageHeader
        title="What's new"
        subtitle="Everything OneCamp has shipped, newest first. Update when it suits you: it takes one command, and it backs up first."
        art={<ChangelogMark />}
        artOnPhone={false}
      />

      <div className={`container-x ${SECTION_END}`}>
        <div className="grid gap-16 grid-cols-1 lg:grid-cols-12 lg:gap-x-8">
          <div className="min-w-0 lg:col-span-8">
            {digests.length ? (
              digests.map((e) => <EntryDigest key={e.slug} entry={e} isNew={e === newest} />)
            ) : (
              <p className="border-t border-border py-10 text-body text-muted-foreground">
                The releases could not be read just now. Every one is on{" "}
                <a href={`${site.serverGithubUrl}/releases`} target="_blank" rel="noopener noreferrer" className="link">
                  GitHub
                </a>
                .
              </p>
            )}

            {earlier.length ? (
              <section aria-labelledby="earlier" className="mt-12">
                <h2 id="earlier" className="text-body font-[590] text-foreground">
                  Earlier
                </h2>
                <div className="mt-4">
                  <EntryRows entries={earlier} />
                </div>
              </section>
            ) : null}

            {list.length ? (
              <p className="mt-8 text-small text-muted-foreground">
                Every release, with its full notes for each edition, is also{" "}
                <a href={`${site.serverGithubUrl}/releases`} target="_blank" rel="noopener noreferrer" className="link">
                  on GitHub
                </a>
                .
              </p>
            ) : null}
          </div>

          <aside aria-labelledby="updating" className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <UpdateNote />
              <div className="mt-10 border-t border-border pt-6">
                <h2 className="text-caption font-[590] text-foreground">Release notes by email</h2>
                <div className="mt-3">
                  <SubscribeForm source="changelog" cta="Email me updates" hint="The releases worth knowing about, a few times a year. Unsubscribe in one click." />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
