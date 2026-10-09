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
}

interface GithubRelease {
  tag_name?: string;
  published_at?: string;
  draft?: boolean;
  prerelease?: boolean;
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
  };
}

/** Cached for an hour on the server, like the star count, and null on any failure. */
export async function getReleaseFacts(): Promise<ReleaseFacts | null> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "onemana-site" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const repo = site.serverGithubUrl.replace("https://github.com/", "");
    const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return summariseReleases((await res.json()) as GithubRelease[], new Date());
  } catch {
    return null;
  }
}
