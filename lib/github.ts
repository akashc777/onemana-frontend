import { site } from "./site";

/**
 * Fetches the repo star count server-side, cached for an hour. Doing this on
 * the server (not in each visitor's browser) avoids GitHub's per-IP
 * unauthenticated rate limit (60/hr) and ad-blockers, so the count renders
 * reliably for everyone. Set GITHUB_TOKEN to raise the limit further.
 */
export async function getGithubStars(): Promise<number | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      // GitHub rejects requests without a User-Agent.
      "User-Agent": "onemana-site",
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const res = await fetch(`https://api.github.com/repos/${site.githubRepo}`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}
