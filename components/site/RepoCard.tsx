import type { ReactNode } from "react";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { Icon, NewTabMark } from "@/components/ui/icons";
import { formatDay } from "@/lib/format";
import { formatStars, type RepoFacts } from "@/lib/github";
import { ix } from "@/lib/interactive";
import { repoUrl, type RepoCopy } from "@/lib/openSource";

/** The card's facts: the stars, when there are some, and the newest release, or the last change when there is none. */
export function repoFactsLine(facts: RepoFacts | undefined): { stars: number | null; when: string | null } {
  if (!facts) return { stars: null, when: null };
  return {
    // No stars yet shows no number: "0" beside a star reads as a verdict, not a fact.
    stars: facts.stars > 0 ? facts.stars : null,
    when: facts.release ? `Released ${formatDay(facts.release.publishedAt)}` : facts.pushedAt ? `Updated ${formatDay(facts.pushedAt)}` : null,
  };
}

function Facts({ facts }: { facts: RepoFacts | undefined }) {
  const { stars, when } = repoFactsLine(facts);
  if (stars === null && when === null) return null;
  return (
    <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption tabular-nums text-muted-foreground">
      {stars !== null && (
        <span className="inline-flex items-center gap-1">
          <Icon name="star" size={14} />
          {formatStars(stars)}
          <span className="sr-only">{stars === 1 ? " star" : " stars"}</span>
        </span>
      )}
      {when !== null && <span>{when}</span>}
    </p>
  );
}

/** What the repository is, after a dot in its hue, and its licence at the end of the line. */
function Head({ copy, licence }: { copy: RepoCopy; licence: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h3 className="flex min-w-0 items-center gap-2 text-body text-foreground">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-ink-4" />
        {copy.role}
      </h3>
      <span className="ui-chip shrink-0">
        <span className="sr-only">Licence: </span>
        {licence}
      </span>
    </div>
  );
}

/** Words for a screen reader only, inside a link whose visible words leave them out. */
const Said = ({ children }: { children: ReactNode }) => <span className="sr-only">{children}</span>;

/**
 * One of OneCamp's open-source repositories (the owner's ask, 15 Oct 2026):
 * what it is, after a dot in its hue, its licence, one line, its stars and
 * its newest release. The one card for /open-source and the home page.
 *
 * `facts` is the live read (lib/github.ts). When GitHub has not answered, the
 * card shows everything that does not change, with the licence from the
 * repository's own LICENSE, and no number.
 *
 * Two looks:
 * - the full card holds still (it is not a link) and carries its address on
 *   GitHub and its two ways out, "Read the code" and "Star on GitHub";
 * - `compact`, on the home page, is itself the link to the code and lifts
 *   under the pointer (the card kind). On a phone its line steps aside and
 *   its facts and its link share a row, so four cards stay under a screen.
 */
export function RepoCard({ copy, facts, compact = false }: { copy: RepoCopy; facts?: RepoFacts; compact?: boolean }) {
  const url = facts?.url ?? repoUrl(copy.repo);
  const licence = facts?.licence ?? copy.licence;

  if (compact) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        {...ix("card", { hue: copy.hue })}
        className={`${HUE_CLASS[copy.hue]} flex h-full flex-col rounded-2xl bg-card p-4 shadow-e1 sm:p-5`}
      >
        <Head copy={copy} licence={licence} />
        <p className="m-0 mt-1.5 hidden text-small text-muted-foreground sm:block">{copy.line}</p>
        {/* Facts over the link, both at the card's foot, so a row of cards
            lines them up whatever each one's line runs to. */}
        <div className="mt-3 flex flex-1 flex-wrap items-end justify-between gap-x-3 gap-y-2 sm:mt-4 sm:flex-col sm:flex-nowrap sm:items-start sm:justify-end sm:gap-y-3">
          <Facts facts={facts} />
          <span className="ml-auto inline-flex items-center gap-1 text-small font-[510] text-brand-ink sm:ml-0">
            Read the code
            <Said> of {copy.called}</Said>
            <NewTabMark />
          </span>
        </div>
      </a>
    );
  }

  return (
    <article className={`${HUE_CLASS[copy.hue]} flex h-full flex-col rounded-2xl bg-card p-6 shadow-e1`}>
      <Head copy={copy} licence={licence} />
      <p className="m-0 mt-1 break-words font-mono text-caption text-muted-foreground">{copy.repo}</p>
      <p className="m-0 mt-3 text-small text-muted-foreground">{copy.line}</p>
      <div className="mt-4 flex-1">
        <Facts facts={facts} />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border pt-4">
        <a href={url} target="_blank" rel="noreferrer" className="go tap-target">
          Read the code
          <Said> of {copy.called}</Said>
          <NewTabMark />
        </a>
        <a href={url} target="_blank" rel="noreferrer" className="ui-btn ui-btn-sm ui-btn-secondary max-md:min-h-11">
          <Icon name="star" size={14} />
          {/* One run of words, so the button's gap falls only beside the icon. */}
          <span>
            Star<Said> {copy.called}</Said> on GitHub<Said> (opens in a new tab)</Said>
          </span>
        </a>
      </div>
    </article>
  );
}

/**
 * The four cards, in the site's order, each with what the read found for it:
 * two across from sm and, compact, four across from lg.
 */
export function RepoCards({ copies, facts, compact = false }: { copies: RepoCopy[]; facts: (repo: string) => RepoFacts | undefined; compact?: boolean }) {
  return (
    <ul className={`m-0 grid list-none gap-3 p-0 sm:grid-cols-2 sm:gap-4 ${compact ? "lg:grid-cols-4" : "lg:gap-5"}`}>
      {copies.map((c) => (
        <li key={c.repo} className="min-w-0">
          <RepoCard copy={c} facts={facts(c.repo)} compact={compact} />
        </li>
      ))}
    </ul>
  );
}
