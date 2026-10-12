import Link from "next/link";
import { digestLine, firstSentence, plainText, storyHref, withLead, type ChangelogEntry, type FixGroup, type Highlights, type Notice } from "@/lib/changelog";
import { entryHref } from "@/lib/releases";
import { renderMarkdown } from "@/lib/markdown";
import { formatDay } from "@/lib/format";
import { Prose } from "@/components/reading/Prose";
import { Icon } from "@/components/ui/icons";
import { Arrow } from "@/components/ui/v3";

/**
 * A changelog entry, drawn from a release's own notes (lib/changelog.ts).
 *
 * On /changelog an entry is a digest: its date, its headline, its story, its
 * first few highlights and what an admin should know before updating, with
 * the rest one click away on the entry's own page. That page shows all of
 * it: every highlight by section, the notes for admins, and the fixes,
 * patches included, dated.
 *
 * Readers meet dates and headlines. The release's tags appear once, small, at
 * the foot ("v2.71.0 with AI"): the admin panel's update check names releases
 * by tag, and an admin reading here has to find theirs (RELEASES.md).
 */

/** How many highlights an entry shows on /changelog before "All changes". */
export const DIGEST_ITEMS = 4;
/** A note for admins on /changelog is a line or two; its page has it in full. */
const NOTICE_CHARS = 160;

/** A link to this site stays on it; anything else opens in a new tab (lib/markdown). */
export function localLinks(md: string): string {
  return md.replace(/\]\(https?:\/\/(?:www\.)?onemana\.dev(\/[^)\s]*)?\)/g, (_m, path: string | undefined) => `](${path || "/"})`);
}

/** Highlights as a sanitised list. */
export function listHtml(items: string[]): string {
  return renderMarkdown(localLinks(items.map((i) => `- ${i.replace(/\n/g, "\n  ")}`).join("\n")));
}

/** One paragraph of Markdown as sanitised inline HTML, without the paragraph around it. */
export function inlineHtml(md: string): string {
  return renderMarkdown(localLinks(md.replace(/\n+/g, " "))).trim().replace(/^<p>([\s\S]*)<\/p>$/, "$1");
}

/** Every section, each under its own heading (the first is the entry's title's, so it has none). */
export function sectionsHtml(sections: Highlights[], level: 2 | 3): string {
  const hashes = "#".repeat(level);
  return sections
    .map((s) => (s.title ? `${hashes} ${s.title.replace(/\n/g, " ")}\n\n` : "") + s.items.map((i) => `- ${withLead(i).replace(/\n/g, "\n  ")}`).join("\n"))
    .map((md) => renderMarkdown(localLinks(md)))
    .join("");
}

/** Every highlight and fix an entry carries. */
export function changeCounts(entry: ChangelogEntry): { changes: number; fixes: number } {
  return {
    changes: entry.sections.reduce((n, s) => n + s.items.length, 0),
    fixes: entry.fixes.reduce((n, f) => n + f.items.length, 0),
  };
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The moss "New" the home page's pill carries, on the entry it points to. */
function NewTag() {
  return <span className="hue-moss rounded-full bg-hue-tint px-2 text-[12px] font-[510] leading-5 text-hue-ink">New</span>;
}

/** "v2.71.0 with AI · v1.56.0 without AI", each tag a link to its notes on GitHub. */
export function Tags({ of }: { of: Pick<ChangelogEntry | FixGroup, "tag" | "url" | "plainTag" | "plainUrl"> }) {
  const tag = (t: string, url?: string) =>
    url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" className="font-mono underline decoration-line-3 underline-offset-[3px] transition-colors hover:text-foreground">
        {t}
      </a>
    ) : (
      <span className="font-mono">{t}</span>
    );
  return (
    <span data-release-tags="" className="text-caption text-muted-foreground">
      {tag(of.tag, of.url)} with AI
      {of.plainTag ? (
        <>
          {" · "}
          {tag(of.plainTag, of.plainUrl)} without AI
        </>
      ) : null}
    </span>
  );
}

/** A note for whoever runs the server. A known issue is drawn in sun; anything else is quiet. */
function NoticeLine({ notice, full }: { notice: Notice; full: boolean }) {
  const issue = /^known issue/i.test(notice.title);
  if (!full) {
    return (
      <p className="flex gap-2 text-small text-muted-foreground">
        <Icon name={issue ? "alert" : "info"} size={16} className={`mt-0.5 ${issue ? "hue-sun text-hue-ink" : ""}`} />
        <span>
          <b className="font-[590] text-foreground">{`${notice.title}:`}</b>
          {` ${firstSentence(plainText(notice.text), NOTICE_CHARS)}`}
        </span>
      </p>
    );
  }
  return (
    <div className={`${issue ? "hue-sun" : "hue-sky"} flex gap-3 rounded-[10px] border border-hue/25 bg-hue-tint px-4 py-3 text-small text-hue-ink`}>
      <Icon name={issue ? "alert" : "info"} size={16} className="mt-0.5" />
      <p className="m-0">
        <b className="font-[590]">{`${notice.title}:`}</b> <span dangerouslySetInnerHTML={{ __html: inlineHtml(notice.text) }} />
      </p>
    </div>
  );
}

/** The blog post a release links, on this site when it is here. */
function StoryLink({ url }: { url: string }) {
  const href = storyHref(url);
  return href.startsWith("/") ? (
    <Link href={href} className="go tap-target">
      Read the story <Arrow size={14} />
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className="go tap-target">
      Read the story <Arrow size={14} />
    </a>
  );
}

/**
 * An entry on /changelog: date, headline, story, its first highlights, its
 * notes for admins in a line each, then the way to everything else.
 */
export function EntryDigest({ entry, isNew = false }: { entry: ChangelogEntry; isNew?: boolean }) {
  const shown = (entry.sections[0]?.items ?? []).slice(0, DIGEST_ITEMS);
  const { changes, fixes } = changeCounts(entry);
  const more = changes > shown.length;
  const counted = [more ? plural(changes, "change", "changes") : "", fixes ? plural(fixes, "fix", "fixes") : ""].filter(Boolean).join(" and ");
  const href = entryHref(entry);
  return (
    <article id={entry.slug} aria-labelledby={`${entry.slug}-title`} className="scroll-mt-24 border-t border-border py-10 first:border-t-0 first:pt-0 sm:py-12">
      <p className="m-0 flex items-center gap-2.5 text-caption text-muted-foreground">
        <time dateTime={entry.publishedAt} className="tabular-nums">
          {formatDay(entry.publishedAt)}
        </time>
        {isNew ? <NewTag /> : null}
      </p>
      <h2 id={`${entry.slug}-title`} className="mt-3 text-balance text-h3 text-foreground">
        <Link href={href} className="transition-colors hover:text-brand-ink">
          {entry.title}
        </Link>
      </h2>
      {entry.story ? <p className="mt-3 max-w-[640px] text-body-lg text-muted-foreground" dangerouslySetInnerHTML={{ __html: inlineHtml(entry.story) }} /> : null}
      {shown.length ? (
        // Each highlight by its lead, the rest shortened: the entry's page has it in full.
        <ul className="mt-5 grid max-w-[640px] list-disc gap-2 pl-5 text-body text-muted-foreground marker:text-muted-foreground">
          {shown.map((md, i) => {
            const line = digestLine(md);
            return (
              <li key={i} className="pl-1">
                {line.lead ? <span className="font-[510] text-foreground">{`${line.lead} `}</span> : null}
                {line.rest}
              </li>
            );
          })}
        </ul>
      ) : null}
      {entry.notices.length ? (
        <div className="mt-5 grid gap-2">
          {entry.notices.map((n, i) => (
            <NoticeLine key={i} notice={n} full={false} />
          ))}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        {entry.storyUrl ? <StoryLink url={entry.storyUrl} /> : null}
        {counted ? (
          <Link href={href} className="go tap-target">
            {more ? `All ${counted}` : `See the ${counted}`} <Arrow size={14} />
          </Link>
        ) : null}
        <span className="sm:ml-auto">
          <Tags of={entry} />
        </span>
      </div>
    </article>
  );
}

/** An entry's own page: everything the release says, in full. */
export function EntryFull({ entry, isNew = false }: { entry: ChangelogEntry; isNew?: boolean }) {
  return (
    <>
      <header>
        <p className="m-0 flex items-center gap-2.5 text-small text-muted-foreground">
          <time dateTime={entry.publishedAt} className="tabular-nums">
            {formatDay(entry.publishedAt)}
          </time>
          {isNew ? <NewTag /> : null}
        </p>
        <h1 className="mt-4 text-balance text-title-read text-foreground">{entry.title}</h1>
        {entry.story ? <p className="mt-5 text-lead text-muted-foreground" dangerouslySetInnerHTML={{ __html: inlineHtml(entry.story) }} /> : null}
      </header>

      {entry.sections.length ? <Prose html={sectionsHtml(entry.sections, 2)} kind="docs" className="mt-8" /> : null}

      {entry.notices.length ? (
        <div className="mt-8 grid gap-3">
          {entry.notices.map((n, i) => (
            <NoticeLine key={i} notice={n} full />
          ))}
        </div>
      ) : null}

      {entry.fixes.length ? (
        <section aria-labelledby="fixes" className="mt-12">
          <h2 id="fixes" className="text-h3 text-foreground">
            Fixes
          </h2>
          <div className="mt-2">
            {entry.fixes.map((f) => (
              <div key={f.tag} className="border-b border-border py-5 last:border-b-0">
                <p className="m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-small">
                  <time dateTime={f.publishedAt} className="font-[590] tabular-nums text-foreground">
                    {formatDay(f.publishedAt)}
                  </time>
                  {f.title ? <span className="text-foreground">{f.title}</span> : null}
                  {/* A patch names its own tags; the release's own fixes share the entry's, at its foot. */}
                  {f.tag !== entry.tag ? (
                    <span className="sm:ml-auto">
                      <Tags of={f} />
                    </span>
                  ) : null}
                </p>
                <Prose html={listHtml(f.items)} kind="docs" className="mt-3" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6">
        {entry.storyUrl ? <StoryLink url={entry.storyUrl} /> : null}
        <span className="sm:ml-auto">
          <Tags of={entry} />
        </span>
      </div>
    </>
  );
}

/** Older entries, a line each, newest first: the title and the day. */
export function EntryRows({ entries }: { entries: ChangelogEntry[] }) {
  return (
    <ul className="m-0 list-none border-t border-border p-0">
      {entries.map((e) => (
        <li key={e.slug} className="border-b border-border">
          <Link href={entryHref(e)} className="group flex min-h-11 flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <span className="min-w-0 text-body text-foreground transition-colors group-hover:text-brand-ink">{e.title}</span>
            <time dateTime={e.publishedAt} className="shrink-0 text-caption tabular-nums text-muted-foreground">
              {formatDay(e.publishedAt)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
