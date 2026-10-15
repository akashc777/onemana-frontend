import { site } from "./site";

/**
 * OneCamp's open-source repositories, read from GitHub (the nav's star count,
 * /open-source and the home page's open-source cards).
 *
 * ONE READ, CACHED. Each repository is two requests, its facts and its
 * releases, kept for an hour under their own cache tag. Next keeps only a 200
 * in its data cache, so a repository's releases are read as a list (a 200,
 * empty when there are none) rather than from /releases/latest, whose 404 for
 * a repository without releases would be fetched again on every render.
 *
 * AN ALLOWLIST, NEVER THE ORGANISATION. The four are named in lib/site.ts.
 * The organisation holds other products, so its total would count stars that
 * are not OneCamp's.
 *
 * NO NUMBER RATHER THAN A WRONG ONE. Any failure (no answer, a status other
 * than 200, a body that is not what GitHub sends, a repository that is not
 * public) makes the whole read null, and the pages show the repositories
 * without a count. Three of four totals would be a wrong total.
 */

/** The four repositories, in the order the site shows them. */
export const OPEN_SOURCE_REPOS: readonly string[] = site.githubRepos;

/** The cache tag on every read here; app/api/revalidate/releases refreshes it with the server's releases. */
export const GITHUB_TAG = "github-repos";

/** How long a read is kept: an hour. */
export const GITHUB_REVALIDATE = 3600;

/** How long one request may take before GitHub counts as not answering. */
export const GITHUB_TIMEOUT_MS = 5000;

/** Releases read per repository: enough to step past drafts and prereleases. */
export const RELEASES_PER_READ = 10;

export interface RepoRelease {
  /** The tag, as GitHub names it. Data only: the site's copy never shows a version (noVersionLabels.test.ts). */
  tag: string;
  publishedAt: string;
  url: string;
}

export interface RepoFacts {
  /** "OneMana-Soft/OneCamp", as the allowlist names it. */
  repo: string;
  url: string;
  stars: number;
  /** The licence GitHub detects, as its SPDX id ("AGPL-3.0", "MIT"); null when it names none. */
  licence: string | null;
  /** The newest published release; null when the repository has none. */
  release: RepoRelease | null;
  /** The last push to any branch. */
  pushedAt: string | null;
}

export interface OpenSourceFacts {
  repos: RepoFacts[];
  /** The stars of the four, and only the four. */
  stars: number;
}

/** What one request came back with, or null when GitHub did not answer. */
export type GithubAnswer = { status: number; body: unknown } | null;
export type GithubGet = (url: string) => Promise<GithubAnswer>;

const API = "https://api.github.com";

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isDate = (v: unknown): v is string => typeof v === "string" && !Number.isNaN(Date.parse(v));

/** A repository's facts from GitHub's answer, or null when the answer is not the public repository asked for. */
export function readRepo(repo: string, body: unknown): Omit<RepoFacts, "release"> | null {
  if (!isRecord(body)) return null;
  const { full_name, html_url, stargazers_count, license, pushed_at } = body;
  if (typeof full_name !== "string" || full_name.toLowerCase() !== repo.toLowerCase()) return null;
  // A repository that is not public is not open source, whatever a token can read.
  if (body.private !== false) return null;
  if (typeof stargazers_count !== "number" || !Number.isInteger(stargazers_count) || stargazers_count < 0) return null;
  if (typeof html_url !== "string" || !html_url.startsWith("https://github.com/")) return null;
  const spdx = isRecord(license) && typeof license.spdx_id === "string" ? license.spdx_id : null;
  return {
    repo,
    url: html_url,
    stars: stargazers_count,
    licence: spdx && spdx !== "NOASSERTION" ? spdx : null,
    pushedAt: isDate(pushed_at) ? pushed_at : null,
  };
}

/**
 * The newest published release in GitHub's list (newest first), skipping
 * drafts, which a token with push access also lists, and prereleases. Null
 * when there is none; undefined when the answer is not a list of releases.
 */
export function readLatestRelease(body: unknown): RepoRelease | null | undefined {
  if (!Array.isArray(body)) return undefined;
  for (const r of body) {
    if (!isRecord(r)) return undefined;
    if (r.draft === true || r.prerelease === true) continue;
    if (typeof r.tag_name !== "string" || !isDate(r.published_at) || typeof r.html_url !== "string") return undefined;
    return { tag: r.tag_name, publishedAt: r.published_at, url: r.html_url };
  }
  return null;
}

/** Every repository's facts and their total, or null when any one of them could not be read. */
export async function collectOpenSource(get: GithubGet, repos: readonly string[] = OPEN_SOURCE_REPOS): Promise<OpenSourceFacts | null> {
  const read = await Promise.all(
    repos.map(async (repo): Promise<RepoFacts | null> => {
      const [info, releases] = await Promise.all([get(`${API}/repos/${repo}`), get(`${API}/repos/${repo}/releases?per_page=${RELEASES_PER_READ}`)]);
      if (info?.status !== 200 || releases?.status !== 200) return null;
      const facts = readRepo(repo, info.body);
      const release = readLatestRelease(releases.body);
      if (!facts || release === undefined) return null;
      return { ...facts, release };
    }),
  );
  if (!read.length || read.some((r) => r === null)) return null;
  const all = read as RepoFacts[];
  return { repos: all, stars: all.reduce((sum, r) => sum + r.stars, 0) };
}

/** The options of Next's fetch, which keep a 200 for an hour under GITHUB_TAG. */
type CachedInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

/**
 * Requests to GitHub through `fetchImpl` (the global fetch, which Next
 * caches), each given `timeoutMs` to answer: one that takes longer, or fails
 * on the way, is "no answer" (null), as is a body that is not JSON.
 */
export function githubFetcher(
  fetchImpl: (url: string, init: CachedInit) => Promise<Response> = fetch,
  timeoutMs: number = GITHUB_TIMEOUT_MS,
): GithubGet {
  return async (url) => {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "onemana-site" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    try {
      const res = await fetchImpl(url, {
        headers,
        signal: AbortSignal.timeout(timeoutMs),
        next: { revalidate: GITHUB_REVALIDATE, tags: [GITHUB_TAG] },
      });
      return { status: res.status, body: res.status === 200 ? await res.json() : null };
    } catch {
      return null;
    }
  };
}

/** The four repositories as GitHub has them now (within the hour); null on any failure. */
export async function getOpenSource(get: GithubGet = githubFetcher()): Promise<OpenSourceFacts | null> {
  try {
    return await collectOpenSource(get);
  } catch {
    return null;
  }
}

/** The facts for one repository, when the read succeeded. */
export function factsFor(facts: OpenSourceFacts | null, repo: string): RepoFacts | undefined {
  return facts?.repos.find((r) => r.repo.toLowerCase() === repo.toLowerCase());
}

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-GB");

/** A star count as a button shows it: 68, 999, 1.2k, 12k. */
export function formatStars(n: number): string {
  return n < 1000 ? String(n) : compact.format(n).toLowerCase();
}

/** A star count said in full, for a label a screen reader reads: "1 star", "1,234 stars". */
export function starsInWords(n: number): string {
  return `${whole.format(n)} ${n === 1 ? "star" : "stars"}`;
}
