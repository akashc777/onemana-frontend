import { site } from "./site";

/**
 * The newest server release and how many shipped in the last 30 days, from the
 * public repository's own release list. Read rather than typed, so the facts
 * strip on the home page cannot claim a version that is not there. Only the
 * server's v2 line counts: the same repository also tags the web app (v1).
 */
export interface ReleaseFacts {
  /** "v2.70" (the patch number dropped: it reads as noise in a sentence). */
  version: string;
  /** "9 Oct" */
  date: string;
  /** Server releases published in the 30 days before `now`. */
  last30: number;
  /** The release's own headline, its notes' first bold line ("A calmer workspace"), when it has one. */
  headline?: string;
  /** Where the release's notes are read. */
  url?: string;
}

export interface GithubRelease {
  tag_name?: string;
  published_at?: string;
  draft?: boolean;
  prerelease?: boolean;
  body?: string;
  html_url?: string;
}

/** The first **bold** line of a release's notes, which is how every release names itself. */
export function releaseHeadline(body: string | undefined): string | undefined {
  const m = body?.match(/^\s*\*\*([^*\n]{3,80})\*\*\s*$/m);
  return m ? m[1]!.trim() : undefined;
}

const SERVER_TAG = /^v2\.(\d+)\.(\d+)$/;

/** Pure, so the summary is tested without the network. */
export function summariseReleases(list: GithubRelease[], now: Date): ReleaseFacts | null {
  const server = list
    .filter((r) => !r.draft && !r.prerelease && r.published_at && SERVER_TAG.test(r.tag_name ?? ""))
    .sort((a, b) => Date.parse(b.published_at as string) - Date.parse(a.published_at as string));
  const latest = server[0];
  if (!latest) return null;
  const [, minor] = (latest.tag_name as string).match(SERVER_TAG) as RegExpMatchArray;
  const published = new Date(latest.published_at as string);
  const since = now.getTime() - 30 * 24 * 3600 * 1000;
  return {
    version: `v2.${minor}`,
    date: published.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
    last30: server.filter((r) => Date.parse(r.published_at as string) >= since).length,
    ...(releaseHeadline(latest.body) ? { headline: releaseHeadline(latest.body) } : {}),
    ...(latest.html_url ? { url: latest.html_url } : {}),
  };
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

export const MAX_RELEASE_PAGES = 5;

/**
 * Every release back to 30 days before `now`, following rel="next" so the
 * count cannot quietly shrink when a month holds more releases than one page
 * (the repository also tags the web app, so pages fill twice as fast). Stops
 * at the first page that reaches past the window, or after MAX_RELEASE_PAGES.
 */
export async function collectReleases(
  firstUrl: string,
  fetchPage: (url: string) => Promise<{ list: GithubRelease[]; next: string | null } | null>,
  now: Date,
): Promise<GithubRelease[] | null> {
  const since = now.getTime() - 30 * 24 * 3600 * 1000;
  const all: GithubRelease[] = [];
  let url: string | null = firstUrl;
  for (let page = 0; url && page < MAX_RELEASE_PAGES; page++) {
    const got = await fetchPage(url);
    if (!got) return page === 0 ? null : all;
    all.push(...got.list);
    const reachesPast = got.list.some((r) => r.published_at && Date.parse(r.published_at) < since);
    if (reachesPast || got.list.length === 0) break;
    url = got.next;
  }
  return all;
}

/** Cached for an hour on the server, like the star count, and null on any failure. */
export async function getReleaseFacts(): Promise<ReleaseFacts | null> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "onemana-site" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const repo = site.serverGithubUrl.replace("https://github.com/", "");
    const now = new Date();
    const list = await collectReleases(
      `https://api.github.com/repos/${repo}/releases?per_page=100`,
      async (url) => {
        const res = await fetch(url, { headers, next: { revalidate: 3600 } });
        if (!res.ok) return null;
        return { list: (await res.json()) as GithubRelease[], next: nextLink(res.headers.get("link")) };
      },
      now,
    );
    return list ? summariseReleases(list, now) : null;
  } catch {
    return null;
  }
}
