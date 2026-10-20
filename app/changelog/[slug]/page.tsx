import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getChangelog } from "@/lib/releases";
import { entryDescription, pillEntry, sameDayEntry } from "@/lib/changelog";
import { site } from "@/lib/site";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { SECTION_END } from "@/components/ui/Section";
import { Icon } from "@/components/ui/icons";
import { EntryFull, EntryRows } from "@/components/changelog/Entry";
import { UpdateNote } from "@/components/changelog/UpdateNote";

// RELEASES_REVALIDATE (lib/releases.ts), written out: Next reads this
// setting without running the module, so it must be a literal.
export const revalidate = 3600;

/** Entry pages built ahead of time; an older one is drawn on its first visit and kept. */
const PREBUILT = 40;

export async function generateStaticParams() {
  const entries = await getChangelog();
  return (entries ?? []).slice(0, PREBUILT).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const entry = (await getChangelog())?.find((e) => e.slug === params.slug);
  if (!entry) return { title: "What's new" };
  const description = entryDescription(entry);
  const url = `${site.url}/changelog/${entry.slug}`;
  // The share card is app/changelog/[slug]/opengraph-image.tsx (and
  // twitter-image.tsx), which Next wires into og:image and twitter:image.
  return {
    title: entry.title,
    description,
    alternates: { canonical: url },
    openGraph: { title: entry.title, description, url, type: "article", publishedTime: entry.publishedAt, siteName: site.name },
    twitter: { card: "summary_large_image", title: entry.title, description },
  };
}

/**
 * One release's entry, in full (RELEASES.md): where the home page's pill and
 * a shared link land. Everything the release says, its fixes and patches by
 * date, its blog post when it has one, then the two releases before it.
 * Beside it, as on /changelog, what an update does.
 */
export default async function ChangelogEntryPage({ params }: { params: { slug: string } }) {
  const entries = await getChangelog();
  // Not a 404 when GitHub is silent: an error keeps the last good page, and a
  // 404 would be kept for an hour.
  if (!entries) throw new Error("The releases could not be read from GitHub.");
  const at = entries.findIndex((e) => e.slug === params.slug);
  if (at < 0) {
    // A headline edited after the release changes its address; the old one
    // still finds the entry when it was the only release that day.
    const moved = sameDayEntry(entries, params.slug);
    if (moved) permanentRedirect(`/changelog/${moved.slug}`);
    notFound();
  }
  const entry = entries[at]!;
  const before = entries.slice(at + 1, at + 4);

  return (
    <div className={`container-x pt-10 sm:pt-16 ${SECTION_END}`}>
      <Link href={`/changelog#${entry.slug}`} className="tap-target gap-1.5 text-small text-muted-foreground transition-colors hover:text-foreground">
        <Icon name="arrow-left" size={14} />
        What&apos;s new
      </Link>

      <div className="mt-8 grid gap-16 grid-cols-1 lg:grid-cols-12 lg:gap-x-8">
        <article className="min-w-0 lg:col-span-8">
          <EntryFull entry={entry} isNew={pillEntry(entries) === entry} />

          {before.length ? (
            <nav aria-labelledby="before" className="mt-14">
              <h2 id="before" className="text-body font-[590] text-foreground">
                Before this
              </h2>
              <div className="mt-4">
                <EntryRows entries={before} />
              </div>
            </nav>
          ) : null}
        </article>

        <aside aria-labelledby="updating" className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <UpdateNote />
            <div className="mt-10 border-t border-border pt-6">
              <h2 className="text-caption font-[590] text-foreground">Release notes by email</h2>
              <div className="mt-3">
                <SubscribeForm source="changelog-entry" cta="Email me updates" hint="The releases worth knowing about, a few times a year. Unsubscribe in one click." />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
