import { site } from "./site";

/**
 * Stars across every public OneCamp repository (site.githubRepos), or null if
 * none could be read. A repository that fails is skipped rather than failing the
 * total, so one rate-limited call does not blank the badge.
 */
export async function sumStars(fetchRepo: (repo: string) => Promise<{ stargazers_count?: number } | null>): Promise<number | null> {
  const counts = await Promise.all(site.githubRepos.map((r) => fetchRepo(r).catch(() => null)));
  const known = counts.map((d) => d?.stargazers_count).filter((n): n is number => typeof n === "number");
  return known.length ? known.reduce((a, b) => a + b, 0) : null;
}

/**
 * The star total, fetched server-side and cached for an hour. Doing this on the
 * server (not in each visitor's browser) avoids GitHub's per-IP unauthenticated
 * rate limit (60/hr) and ad-blockers, so the count renders reliably for
 * everyone. Set GITHUB_TOKEN to raise the limit further.
 */
export async function getGithubStars(): Promise<number | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "onemana-site",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    return await sumStars(async (repo) => {
      const res = await fetch(`https://api.github.com/repos/${repo}`, { headers, next: { revalidate: 3600 } });
      return res.ok ? ((await res.json()) as { stargazers_count?: number }) : null;
    });
  } catch {
    return null;
  }
}
