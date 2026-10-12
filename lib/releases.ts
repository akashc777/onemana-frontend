import { site } from "./site";
import { buildChangelog, entriesSince, pillEntry, type ChangelogEntry, type GithubRelease } from "./changelog";

export type { GithubRelease } from "./changelog";

/**
 * The server's releases, read from the public repository rather than typed, so
 * the home page cannot claim a release that is not there. lib/changelog.ts
 * reads them into the changelog's entries (/changelog); this file fetches them
 * and sums them up for the home page.
 */
export interface ReleaseFacts {
  /** Feature releases (the changelog's entries) published in the 30 days before now; patches fold into them. */
  last30: number;
  /** The release pill: the newest feature release that names itself, and its page on this site. */
  pill?: { headline: string; href: string };
}

/** Where an entry is read: its own page, which carries its share card. */
export function entryHref(entry: Pick<ChangelogEntry, "slug">): string {
  return `/changelog/${entry.slug}`;
}

/** Pure, so the summary is tested without the network. */
export function summariseChangelog(entries: ChangelogEntry[], now: Date): ReleaseFacts | null {
  if (!entries.length) return null;
  const pill = pillEntry(entries);
  return {
    last30: entriesSince(entries, now),
    ...(pill ? { pill: { headline: pill.title, href: entryHref(pill) } } : {}),
  };
}

/** The same, from GitHub's list. */
export function summariseReleases(list: GithubRelease[], now: Date): ReleaseFacts | null {
  return summariseChangelog(buildChangelog(list), now);
}

/** The URL a GitHub `Link` header gives as rel="next", or null. */
export function nextLink(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(",")) {
    const m = part.match(/<([^>]+)>\s*;\s*rel="next"/);
    if (m) return m[1];
  }
  return null;
}

/**
 * Pages read at most. The repository tags both editions, so a page of 100 is
 * about 50 server releases; ten pages reach back months at today's pace, and
 * the changelog sends anyone after older notes to GitHub.
 */
export const MAX_RELEASE_PAGES = 10;

/**
 * Every release, following rel="next" until the list ends or after
 * MAX_RELEASE_PAGES. Null when the first page fails; a later page failing
 * keeps what was read, since the newest releases come first.
 */
export async function collectReleases(
  firstUrl: string,
  fetchPage: (url: string) => Promise<{ list: GithubRelease[]; next: string | null } | null>,
): Promise<GithubRelease[] | null> {
  const all: GithubRelease[] = [];
  let url: string | null = firstUrl;
  for (let page = 0; url && page < MAX_RELEASE_PAGES; page++) {
    const got = await fetchPage(url);
    if (!got) return page === 0 ? null : all;
    all.push(...got.list);
    if (got.list.length === 0) break;
    url = got.next;
  }
  return all;
}

/** The cache tag on every read of the releases, which the release webhook revalidates (app/api/revalidate/releases). */
export const RELEASES_TAG = "github-releases";

/** How long a read of the releases is kept: an hour, unless the webhook says sooner. */
export const RELEASES_REVALIDATE = 3600;

/** Every release, newest first as GitHub lists them; null on any failure. */
export async function getReleases(): Promise<GithubRelease[] | null> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "onemana-site" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const repo = site.serverGithubUrl.replace("https://github.com/", "");
    return await collectReleases(`https://api.github.com/repos/${repo}/releases?per_page=100`, async (url) => {
      const res = await fetch(url, { headers, next: { revalidate: RELEASES_REVALIDATE, tags: [RELEASES_TAG] } });
      if (!res.ok) return null;
      return { list: (await res.json()) as GithubRelease[], next: nextLink(res.headers.get("link")) };
    });
  } catch {
    return null;
  }
}

/** The changelog's entries, newest first; null when GitHub did not answer. */
export async function getChangelog(): Promise<ChangelogEntry[] | null> {
  const list = await getReleases();
  return list ? buildChangelog(list) : null;
}

/** The home page's release facts; null on any failure, so the page says less rather than something wrong. */
export async function getReleaseFacts(): Promise<ReleaseFacts | null> {
  const entries = await getChangelog();
  return entries ? summariseChangelog(entries, new Date()) : null;
}
