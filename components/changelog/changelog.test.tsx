import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { buildChangelog, type ChangelogEntry, type GithubRelease } from "@/lib/changelog"

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND")
  },
  permanentRedirect: (to: string) => {
    throw new Error(`NEXT_REDIRECT ${to}`)
  },
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
}))

let entries: ChangelogEntry[] | null = []
vi.mock("@/lib/releases", async (load) => ({
  ...(await load<typeof import("@/lib/releases")>()),
  getChangelog: async () => entries,
}))

import ChangelogPage from "@/app/changelog/page"
import ChangelogEntryPage from "@/app/changelog/[slug]/page"
import { EntryDigest, EntryFull } from "@/components/changelog/Entry"
import { UPDATE_STEPS } from "@/components/changelog/UpdateNote"

/**
 * The changelog as a reader gets it (RELEASES.md): /changelog's digests, an
 * entry's own page, and the pill's entry marked New. Readers meet dates and
 * headlines; a release's tags appear only in its foot line, for an admin.
 */

const rel = (tag: string, at: string, body: string): GithubRelease => ({
  tag_name: tag,
  published_at: at,
  body,
  html_url: `https://github.com/OneMana-Soft/OneCamp/releases/tag/${tag}`,
})

const CALMER = [
  "**A calmer workspace**",
  "",
  "One accent, and text you can read all day.",
  "",
  "- One accent. Orange marks only what you can act on.",
  "- Text you can read all day.",
  "- Chat reads like a conversation.",
  "- The sidebar lists each place once.",
  "- Docs read at about 75 characters a line ([guide](https://onemana.dev/docs/tables)).",
  "",
  "**Names and handles**",
  "- Everyone has an @handle.",
  "",
  "**Fixes**",
  "- Links in messages look like links again.",
  "",
  "**Before you update**",
  "- Nothing to change. There are no database migrations in this release.",
  "",
  "Read the story: https://onemana.dev/blog/a-calmer-workspace",
].join("\n")

const LIST: GithubRelease[] = [
  rel("v2.71.2", "2026-10-12T05:00:00Z", "- Search finds names with accents."),
  rel("v2.71.1", "2026-10-11T09:00:00Z", "**Fixed**\n- A reply no longer jumps."),
  rel("v1.56.0", "2026-10-10T06:41:30Z", CALMER),
  rel("v2.71.0", "2026-10-10T06:41:00Z", CALMER),
  // Ten earlier feature releases, so /changelog has digests and a line each for the rest.
  ...Array.from({ length: 10 }, (_, i) =>
    rel(`v2.${60 + i}.0`, `2026-10-0${Math.floor(i / 2) + 1}T0${i % 2}:00:00Z`, `**Feature number ${60 + i}**\n\n- It does one thing well.`),
  ),
]

/** The words a reader sees, with the release tags' foot lines taken out. */
function readerText(html: string): string {
  return html
    .replace(/<span data-release-tags=""[\s\S]*?<\/span><\/span>|<span data-release-tags=""[\s\S]*?(?=<\/span>)/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
}

describe("an entry on /changelog", () => {
  const [calmer] = buildChangelog(LIST)
  const html = renderToString(<EntryDigest entry={calmer!} isNew />)

  it("is its date, its headline linking to its own page, its story and its first highlights", () => {
    expect(html).toMatch(/<article id="2026-10-10-a-calmer-workspace"/)
    expect(html).toMatch(/<time dateTime="2026-10-10T06:41:00.000Z"[^>]*>10 Oct 2026<\/time>/)
    expect(html).toMatch(/<h2[^>]*><a [^>]*href="\/changelog\/2026-10-10-a-calmer-workspace"[^>]*>A calmer workspace<\/a><\/h2>/)
    expect(html).toContain("One accent, and text you can read all day.")
    expect(html).toContain("The sidebar lists each place once.")
    expect(html).not.toContain("Docs read at about 75 characters")
    expect(html).toContain(">New<")
  })

  it("leads to the rest, counts the fixes its patches brought, and says what to know before updating", () => {
    expect(html).toMatch(/href="\/changelog\/2026-10-10-a-calmer-workspace"[^>]*>All 6 changes and 3 fixes/)
    expect(html).toMatch(/Before you update:<\/b> Nothing to change\./)
  })

  it("keeps the story and its own links on this site", () => {
    expect(html).toMatch(/<a [^>]*href="\/blog\/a-calmer-workspace"[^>]*>Read the story/)
    expect(html).not.toMatch(/href="https:\/\/onemana\.dev/)
  })

  it("names its tags only in its foot line, for an admin", () => {
    expect(html).toMatch(/<span data-release-tags=""[^>]*><a [^>]*href="https:\/\/github.com\/OneMana-Soft\/OneCamp\/releases\/tag\/v2.71.0"[^>]*>v2.71.0<\/a> with AI/)
    expect(html).toContain(">v1.56.0</a> without AI")
    expect(readerText(html)).not.toMatch(/\bv\d+\.\d+/)
  })
})

describe("an entry's own page", () => {
  const [calmer] = buildChangelog(LIST)
  const html = renderToString(<EntryFull entry={calmer!} />)

  it("shows every highlight under its section, with this site's links kept here", () => {
    expect(html).toMatch(/<h1[^>]*>A calmer workspace<\/h1>/)
    expect(html).toContain("Docs read at about 75 characters a line")
    expect(html).toContain('<a href="/docs/tables">guide</a>')
    expect(html).toMatch(/<h2>Names and handles<\/h2>/)
  })

  it("lists its fixes by the day they shipped, its patches' included", () => {
    const fixes = html.slice(html.indexOf('id="fixes"'))
    const days = [...fixes.matchAll(/<time dateTime="([^"]+)"[^>]*>([^<]+)<\/time>/g)].map((m) => m[2])
    expect(days).toEqual(["10 Oct 2026", "11 Oct 2026", "12 Oct 2026"])
    expect(fixes).toContain("A reply no longer jumps.")
    expect(fixes).toContain("Search finds names with accents.")
    expect(readerText(html)).not.toMatch(/\bv\d+\.\d+/)
  })
})

describe("/changelog", () => {
  it("draws the newest releases as digests, the rest a line each, and what an update does beside them", async () => {
    entries = buildChangelog(LIST)
    const html = renderToString(await ChangelogPage())
    expect(html).toMatch(/<h1[^>]*>What&#x27;s new<\/h1>/)
    expect(html.match(/<article id=/g)).toHaveLength(8)
    expect(html).toMatch(/<h2 id="earlier"[^>]*>Earlier<\/h2>/)
    expect(html.match(/<li class="border-b border-border"><a /g)).toHaveLength(3)
    // The New tag is the pill's: on the newest release that names itself, and nowhere else.
    expect(html.match(/>New</g)).toHaveLength(1)
    expect(html.indexOf(">New<")).toBeLessThan(html.indexOf("A calmer workspace</a>"))
    // What an update does, in the command's own words, and where to read more.
    expect(html).toContain("make update")
    for (const step of UPDATE_STEPS) expect(html).toContain(step)
    expect(html).toMatch(/href="\/docs\/installation#updating"/)
    expect(readerText(html)).not.toMatch(/\bv\d+\.\d+/)
  })

  it("throws rather than cache an empty changelog when GitHub does not answer", async () => {
    entries = null
    await expect(ChangelogPage()).rejects.toThrow(/GitHub/)
  })
})

describe("an entry's page, reached by its address", () => {
  it("draws the entry, links back to its place on /changelog, and lists the releases before it", async () => {
    entries = buildChangelog(LIST)
    const html = renderToString(await ChangelogEntryPage({ params: { slug: "2026-10-10-a-calmer-workspace" } }))
    expect(html).toMatch(/href="\/changelog#2026-10-10-a-calmer-workspace"/)
    expect(html).toMatch(/<h2 id="before"[^>]*>Before this<\/h2>/)
    expect(html).toContain("Feature number 69")
  })

  it("sends an address whose headline changed to the day's only entry, and is a 404 otherwise", async () => {
    entries = buildChangelog(LIST)
    await expect(ChangelogEntryPage({ params: { slug: "2026-10-10-a-quieter-workspace" } })).rejects.toThrow("NEXT_REDIRECT /changelog/2026-10-10-a-calmer-workspace")
    await expect(ChangelogEntryPage({ params: { slug: "2026-10-01-nothing" } })).rejects.toThrow("NEXT_NOT_FOUND")
  })
})
