import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  GITHUB_REVALIDATE,
  GITHUB_TAG,
  OPEN_SOURCE_REPOS,
  collectOpenSource,
  factsFor,
  formatStars,
  getOpenSource,
  githubFetcher,
  readLatestRelease,
  readRepo,
  starsInWords,
  type GithubAnswer,
} from "./github"
import { site } from "./site"

/**
 * The open-source read (lib/github.ts): the four repositories and only those,
 * one read kept an hour under its own tag, and no number at all rather than a
 * wrong one when any part of the read fails, GitHub not answering included.
 * The fixtures are GitHub's own answers, cut to the fields read.
 */

const API = "https://api.github.com"

const repoBody = (full_name: string, stars: number, spdx: string | null = "MIT", extra: Record<string, unknown> = {}) => ({
  full_name,
  html_url: `https://github.com/${full_name}`,
  private: false,
  stargazers_count: stars,
  license: spdx ? { key: spdx.toLowerCase(), spdx_id: spdx } : null,
  pushed_at: "2026-10-04T06:25:59Z",
  ...extra,
})

const releaseBody = (tag: string, at: string, extra: Record<string, unknown> = {}) => ({
  tag_name: tag,
  published_at: at,
  html_url: `https://github.com/x/releases/tag/${tag}`,
  draft: false,
  prerelease: false,
  ...extra,
})

/** GitHub as it answered on 15 Oct 2026: the web app's 68 stars, two repositories without a release. */
function github(overrides: Record<string, GithubAnswer> = {}) {
  const answers: Record<string, GithubAnswer> = {
    [`${API}/repos/OneMana-Soft/OneCamp`]: { status: 200, body: repoBody("OneMana-Soft/OneCamp", 0, "AGPL-3.0") },
    [`${API}/repos/OneMana-Soft/OneCamp-fe`]: { status: 200, body: repoBody("OneMana-Soft/OneCamp-fe", 68) },
    [`${API}/repos/OneMana-Soft/OneCamp-desktop`]: { status: 200, body: repoBody("OneMana-Soft/OneCamp-desktop", 0) },
    [`${API}/repos/OneMana-Soft/onemana-omarchy`]: { status: 200, body: repoBody("OneMana-Soft/onemana-omarchy", 0) },
    [`${API}/repos/OneMana-Soft/OneCamp/releases?per_page=10`]: {
      status: 200,
      body: [releaseBody("v2.72.2", "2026-10-15T07:37:00Z"), releaseBody("v1.57.2", "2026-10-15T07:37:05Z")],
    },
    [`${API}/repos/OneMana-Soft/OneCamp-fe/releases?per_page=10`]: { status: 200, body: [] },
    [`${API}/repos/OneMana-Soft/OneCamp-desktop/releases?per_page=10`]: { status: 200, body: [releaseBody("v1.1.1", "2026-10-15T07:49:13Z")] },
    [`${API}/repos/OneMana-Soft/onemana-omarchy/releases?per_page=10`]: { status: 200, body: [] },
    // The organisation's other products, which must never be asked for or counted.
    [`${API}/repos/OneMana-Soft/conva-fe`]: { status: 200, body: repoBody("OneMana-Soft/conva-fe", 500) },
    ...overrides,
  }
  const asked: string[] = []
  const get = async (url: string) => {
    asked.push(url)
    return url in answers ? answers[url]! : { status: 404, body: null }
  }
  return { get, asked }
}

describe("the four repositories", () => {
  it("are an allowlist of OneCamp's own, in the site's order, never the organisation's other products", () => {
    expect(OPEN_SOURCE_REPOS).toEqual(["OneMana-Soft/OneCamp", "OneMana-Soft/OneCamp-fe", "OneMana-Soft/OneCamp-desktop", "OneMana-Soft/onemana-omarchy"])
    expect(OPEN_SOURCE_REPOS).toBe(site.githubRepos)
    for (const other of ["conva-fe", "tareon-fe"]) expect(OPEN_SOURCE_REPOS.join(" ")).not.toContain(other)
  })

  it("adds up the stars of the four and only the four, from two requests each", async () => {
    const { get, asked } = github()
    const facts = await collectOpenSource(get)
    expect(facts?.stars).toBe(68)
    expect(asked.sort()).toEqual(
      OPEN_SOURCE_REPOS.flatMap((r) => [`${API}/repos/${r}`, `${API}/repos/${r}/releases?per_page=10`]).sort(),
    )
    expect(asked.some((u) => u.includes("conva") || u.includes("/orgs/"))).toBe(false)
  })

  it("reads each one's address, licence, stars, newest release and last change", async () => {
    const facts = await collectOpenSource(github().get)
    expect(facts?.repos.map((r) => r.repo)).toEqual([...OPEN_SOURCE_REPOS])
    expect(factsFor(facts, "OneMana-Soft/OneCamp")).toEqual({
      repo: "OneMana-Soft/OneCamp",
      url: "https://github.com/OneMana-Soft/OneCamp",
      stars: 0,
      licence: "AGPL-3.0",
      release: { tag: "v2.72.2", publishedAt: "2026-10-15T07:37:00Z", url: "https://github.com/x/releases/tag/v2.72.2" },
      pushedAt: "2026-10-04T06:25:59Z",
    })
    expect(factsFor(facts, "onemana-soft/onecamp-fe")).toMatchObject({ stars: 68, licence: "MIT", release: null })
    expect(factsFor(null, "OneMana-Soft/OneCamp")).toBeUndefined()
  })
})

describe("no number rather than a wrong one", () => {
  const repo = `${API}/repos/OneMana-Soft/OneCamp-desktop`
  const releases = `${repo}/releases?per_page=10`

  it("when GitHub does not answer one request, the whole read is null", async () => {
    expect(await collectOpenSource(github({ [repo]: null }).get)).toBeNull()
    expect(await collectOpenSource(github({ [releases]: null }).get)).toBeNull()
  })

  it("when GitHub answers anything but a 200: rate limited, gone, broken", async () => {
    for (const status of [403, 404, 429, 500, 502]) {
      expect(await collectOpenSource(github({ [repo]: { status, body: null } }).get), `${status}`).toBeNull()
      expect(await collectOpenSource(github({ [releases]: { status, body: null } }).get), `releases ${status}`).toBeNull()
    }
  })

  it("when an answer is not the public repository asked for", async () => {
    for (const body of [
      null,
      "not json",
      [],
      repoBody("OneMana-Soft/conva-fe", 3),
      repoBody("OneMana-Soft/OneCamp-desktop", 3, "MIT", { private: true }),
      repoBody("OneMana-Soft/OneCamp-desktop", 3, "MIT", { private: undefined }),
      repoBody("OneMana-Soft/OneCamp-desktop", -1),
      repoBody("OneMana-Soft/OneCamp-desktop", 2.5),
      repoBody("OneMana-Soft/OneCamp-desktop", 3, "MIT", { stargazers_count: "3" }),
      repoBody("OneMana-Soft/OneCamp-desktop", 3, "MIT", { html_url: "https://evil.example/x" }),
    ]) {
      expect(await collectOpenSource(github({ [repo]: { status: 200, body } }).get), JSON.stringify(body)).toBeNull()
    }
  })

  it("when the releases are not a list of releases", async () => {
    for (const body of [null, {}, "x", [null], [{ tag_name: "v1.1.1" }], [releaseBody("v1.1.1", "not a date")]]) {
      expect(await collectOpenSource(github({ [releases]: { status: 200, body } }).get), JSON.stringify(body)).toBeNull()
    }
  })

  it("when there is nothing to read, or the read itself throws", async () => {
    expect(await collectOpenSource(github().get, [])).toBeNull()
    expect(
      await getOpenSource(async () => {
        throw new Error("boom")
      }),
    ).toBeNull()
  })
})

describe("what a repository is read as", () => {
  it("a licence GitHub cannot name is no licence, not NOASSERTION", () => {
    expect(readRepo("a/b", repoBody("a/b", 1, "NOASSERTION"))?.licence).toBeNull()
    expect(readRepo("a/b", repoBody("a/b", 1, null))?.licence).toBeNull()
    expect(readRepo("A/B", repoBody("a/b", 1))?.repo).toBe("A/B")
    expect(readRepo("a/b", repoBody("a/b", 1, "MIT", { pushed_at: "soon" }))?.pushedAt).toBeNull()
  })

  it("the newest release is the first published one: drafts and prereleases are stepped over, none is null", () => {
    const list = [
      releaseBody("v2.73.0", "2026-10-16T00:00:00Z", { draft: true }),
      releaseBody("v2.73.0-rc1", "2026-10-15T12:00:00Z", { prerelease: true }),
      releaseBody("v2.72.2", "2026-10-15T07:37:00Z"),
    ]
    expect(readLatestRelease(list)?.tag).toBe("v2.72.2")
    expect(readLatestRelease([])).toBeNull()
    expect(readLatestRelease([releaseBody("v1", "2026-10-15T00:00:00Z", { draft: true })])).toBeNull()
    expect(readLatestRelease({})).toBeUndefined()
  })
})

describe("the requests", () => {
  // A token in the environment (a deploy's, or a developer's shell) is set
  // aside, so each test says for itself whether there is one.
  let ambient: string | undefined
  beforeEach(() => {
    ambient = process.env.GITHUB_TOKEN
    delete process.env.GITHUB_TOKEN
  })
  afterEach(() => {
    if (ambient === undefined) delete process.env.GITHUB_TOKEN
    else process.env.GITHUB_TOKEN = ambient
  })

  const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } })

  it("are kept an hour under their own tag, as GitHub's JSON, with the token only when one is set", async () => {
    const seen: { url: string; init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } }[] = []
    const get = githubFetcher(async (url, init) => (seen.push({ url, init }), ok({ a: 1 })))
    expect(await get(`${API}/repos/OneMana-Soft/OneCamp`)).toEqual({ status: 200, body: { a: 1 } })
    expect(seen[0]!.init.next).toEqual({ revalidate: GITHUB_REVALIDATE, tags: [GITHUB_TAG] })
    expect(GITHUB_REVALIDATE).toBe(3600)
    expect(GITHUB_TAG).toBe("github-repos")
    const headers = seen[0]!.init.headers as Record<string, string>
    expect(headers.Accept).toBe("application/vnd.github+json")
    expect(headers["User-Agent"]).toBe("onemana-site")
    expect(headers.Authorization).toBeUndefined()
    expect(seen[0]!.init.signal).toBeInstanceOf(AbortSignal)

    process.env.GITHUB_TOKEN = "t0ken"
    await get(`${API}/repos/OneMana-Soft/OneCamp`)
    expect((seen[1]!.init.headers as Record<string, string>).Authorization).toBe("Bearer t0ken")
  })

  it("give up when GitHub does not answer in time, and count that as no answer", async () => {
    const hang = (_url: string, init: RequestInit) =>
      new Promise<Response>((_resolve, reject) => init.signal?.addEventListener("abort", () => reject(init.signal?.reason)))
    const started = Date.now()
    expect(await githubFetcher(hang, 30)(`${API}/repos/OneMana-Soft/OneCamp`)).toBeNull()
    expect(Date.now() - started).toBeLessThan(2000)
    expect(await getOpenSource(githubFetcher(hang, 30))).toBeNull()
  })

  it("count a network failure or a body that is not JSON as no answer, and keep a non-200's status", async () => {
    expect(await githubFetcher(async () => Promise.reject(new TypeError("fetch failed")))("u")).toBeNull()
    expect(await githubFetcher(async () => new Response("<html>", { status: 200 }))("u")).toBeNull()
    expect(await githubFetcher(async () => new Response("rate limited", { status: 403 }))("u")).toEqual({ status: 403, body: null })
  })

  it("read end to end through the fetcher into the four repositories' facts", async () => {
    const { get } = github()
    const viaFetch = githubFetcher(async (url) => {
      const a = await get(url)
      return a ? new Response(JSON.stringify(a.body), { status: a.status }) : Promise.reject(new Error("no answer"))
    })
    expect((await getOpenSource(viaFetch))?.stars).toBe(68)
  })
})

describe("a star count, shown and said", () => {
  it("shows a whole number below a thousand and a short one above", () => {
    expect([0, 1, 68, 999, 1000, 1234, 12_345, 999_999, 1_250_000].map(formatStars)).toEqual(["0", "1", "68", "999", "1k", "1.2k", "12.3k", "1m", "1.3m"])
  })

  it("says it in full, with the noun in the right number", () => {
    expect(starsInWords(1)).toBe("1 star")
    expect(starsInWords(0)).toBe("0 stars")
    expect(starsInWords(68)).toBe("68 stars")
    expect(starsInWords(1234)).toBe("1,234 stars")
  })
})
