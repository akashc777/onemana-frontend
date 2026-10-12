import { describe, expect, it } from "vitest"

import {
  buildChangelog,
  digestLine,
  entryDescription,
  entrySlug,
  entryTitle,
  firstSentence,
  parseNotes,
  pillEntry,
  sameDayEntry,
  storyHref,
  wholeSentences,
  withLead,
  type GithubRelease,
} from "./changelog"
import { summariseReleases } from "./releases"

/**
 * The changelog is read from the release notes (lib/changelog.ts), so these
 * pin how notes are read and how releases become entries: the headline, the
 * story and the highlights; patches folded under their feature release as
 * fixes; the pill's pick; and the edition without AI paired by date.
 */

const rel = (tag: string, at: string, body = "", extra: Partial<GithubRelease> = {}): GithubRelease => ({
  tag_name: tag,
  published_at: at,
  body,
  html_url: `https://github.com/OneMana-Soft/OneCamp/releases/tag/${tag}`,
  ...extra,
})

const CALMER = [
  "**A calmer workspace**",
  "",
  "One accent, and text you can read all day.",
  "",
  "- One accent. Orange marks only what you can act on.",
  "- Text you can read all day. The base size is 14px.",
  "- Chat reads like a conversation.",
  "- The sidebar lists each place once.",
  "- Projects you can scan: dates read \"7 Oct\".",
  "",
  "**Names and handles**",
  "- Everyone has an @handle.",
  "",
  "**Fixes**",
  "- Links in messages look like links again.",
  "- A thread keeps its place when a reply arrives.",
  "",
  "**Before you update**",
  "- Nothing to change. There are no database migrations in this release.",
  "",
  "Read the story: https://onemana.dev/blog/a-calmer-workspace",
  "",
  "Update: re-run your install command, then `make update`.",
].join("\n")

const TEAMMATES = "**New teammates arrive ready to work**\n\n- An invitation names the channels to join.\n\n**Fixes**\n- Sign-in says why it refused."

describe("reading a release's notes", () => {
  it("takes the first bold line as the headline, the first paragraph as the story and the bullets as highlights", () => {
    expect(parseNotes(CALMER)).toEqual({
      headline: "A calmer workspace",
      story: "One accent, and text you can read all day.",
      sections: [
        {
          items: [
            "One accent. Orange marks only what you can act on.",
            "Text you can read all day. The base size is 14px.",
            "Chat reads like a conversation.",
            "The sidebar lists each place once.",
            'Projects you can scan: dates read "7 Oct".',
          ],
        },
        { title: "Names and handles", items: ["Everyone has an @handle."] },
      ],
      fixes: ["Links in messages look like links again.", "A thread keeps its place when a reply arrives."],
      notices: [{ title: "Before you update", text: "Nothing to change. There are no database migrations in this release." }],
      storyUrl: "https://onemana.dev/blog/a-calmer-workspace",
    })
  })

  it("leaves out how to update and how many migrations run: the page says that once", () => {
    const notes = parseNotes("**Polls in channels**\n\n- Everyone answers in one place.\n\nMigrations 178 to 180 run on upgrade.\n\nNo new migrations.\n\nUpdate: re-run your install command, then `make update`.")
    expect(notes.sections).toEqual([{ items: ["Everyone answers in one place."] }])
    expect(notes.story).toBeUndefined()
  })

  it("reads older notes, whose first paragraph opens with a bold lead", () => {
    const notes = parseNotes(
      "**Your workspace on your desktop's bar.** Two read-only endpoints for desktop bars.\n- `GET /unread`: unread totals.\n\n**Dates the AI gets right.** Agents see the coming days written out.",
    )
    expect(notes.headline).toBe("Your workspace on your desktop's bar")
    expect(notes.story).toBe("Two read-only endpoints for desktop bars.")
    expect(notes.sections).toEqual([{ items: ["`GET /unread`: unread totals.", "**Dates the AI gets right.** Agents see the coming days written out."] }])
  })

  it("has no headline when its first bold line is a label, and no later heading stands in for one", () => {
    const labelled = parseNotes("**New**\n- **Focus time.** Notifications pause.\n- **Link cards.** A card under a link.\n\n**Security**\n- Internal requests need a real secret.")
    expect(labelled.headline).toBeUndefined()
    expect(entryTitle(labelled)).toMatchObject({ title: "Focus time and link cards", headlined: false })

    const first = parseNotes(
      "The first open-source release of OneCamp with AI teammates. The server is now AGPL-3.0.\n\n**Highlights of the earlier releases**\n- Inbox.\n\n**Security (v2.38.1)**\n- No built-in secret.",
    )
    expect(first.headline).toBeUndefined()
    expect(entryTitle(first)).toEqual({ title: "The first open-source release of OneCamp with AI teammates", headlined: false, story: "The server is now AGPL-3.0." })
    expect(first.sections.map((s) => s.title)).toEqual(["Highlights of the earlier releases", "Security"])
  })

  it("makes a known issue, or a fix shipped later, a notice wherever it is written", () => {
    const notes = parseNotes("**Clips**\n- Record a clip.\n\n**Known issue, fixed on 8 October:** live updates arrived only after a reload.")
    expect(notes.notices).toEqual([{ title: "Known issue, fixed on 8 October", text: "live updates arrived only after a reload." }])
    expect(notes.sections).toEqual([{ items: ["Record a clip."] }])
  })

  it("reads a # heading as a bold line, and keeps a bullet's second line with it", () => {
    const notes = parseNotes("## Send later\n\nWrite a message now and send it when it will land best.\n\n- Later today, tomorrow at 9:00\n  or any time you pick.")
    expect(notes).toMatchObject({ headline: "Send later", story: "Write a message now and send it when it will land best." })
    expect(notes.sections[0]!.items).toEqual(["Later today, tomorrow at 9:00\n  or any time you pick."])
  })
})

describe("the changelog's entries", () => {
  const list: GithubRelease[] = [
    rel("v2.71.2", "2026-10-12T05:00:00Z", "- Search finds names with accents."),
    rel("v1.56.1", "2026-10-11T09:01:00Z", "**Fixed**\n- A reply no longer jumps."),
    rel("v2.71.1", "2026-10-11T09:00:00Z", "**Fixed**\n- A reply no longer jumps."),
    rel("v1.56.0", "2026-10-10T06:41:30Z", CALMER),
    rel("v2.71.0", "2026-10-10T06:41:00Z", CALMER),
    rel("v2.70.0", "2026-10-09T21:30:00Z", TEAMMATES),
    rel("v2.41.0", "2026-10-04T03:06:00Z", "**A better local AI model by default.** New installs use a stronger model."),
    rel("v2.10.0", "2026-08-01T00:00:00Z", "**An old release**\n- Something from August."),
  ]
  const entries = buildChangelog(list)

  it("makes each feature release an entry, newest first, and folds its patches under it as dated fixes", () => {
    expect(entries.map((e) => e.title)).toEqual(["A calmer workspace", "New teammates arrive ready to work", "A better local AI model by default", "An old release"])
    const calmer = entries[0]!
    expect(calmer.publishedAt).toBe("2026-10-10T06:41:00.000Z")
    expect(calmer.fixes.map((f) => [f.tag, f.publishedAt.slice(0, 10), f.items])).toEqual([
      ["v2.71.0", "2026-10-10", ["Links in messages look like links again.", "A thread keeps its place when a reply arrives."]],
      ["v2.71.1", "2026-10-11", ["A reply no longer jumps."]],
      ["v2.71.2", "2026-10-12", ["Search finds names with accents."]],
    ])
  })

  it("never lets a patch take over the pill, or leave it without a headline", () => {
    expect(pillEntry(entries)?.title).toBe("A calmer workspace")
    expect(summariseReleases(list, new Date("2026-10-12T06:00:00Z"))?.pill).toEqual({
      headline: "A calmer workspace",
      href: "/changelog/2026-10-10-a-calmer-workspace",
    })
  })

  it("gives the pill the newest release that names itself, passing over one that does not", () => {
    const later = [rel("v2.72.0", "2026-10-12T08:00:00Z", "**Fixes**\n- The calendar keeps its week."), ...list]
    const withLater = buildChangelog(later)
    expect(withLater[0]).toMatchObject({ title: "Fixes", headlined: false })
    expect(pillEntry(withLater)?.title).toBe("A calmer workspace")
  })

  it("counts the feature releases of the last 30 days, with patches folded in", () => {
    expect(summariseReleases(list, new Date("2026-10-12T06:00:00Z"))?.last30).toBe(3)
    expect(summariseReleases([], new Date())).toBeNull()
  })

  it("pairs each release with the edition without AI's that shipped with it", () => {
    const calmer = entries[0]!
    expect(calmer).toMatchObject({ tag: "v2.71.0", plainTag: "v1.56.0", plainUrl: "https://github.com/OneMana-Soft/OneCamp/releases/tag/v1.56.0" })
    expect(calmer.fixes[1]).toMatchObject({ tag: "v2.71.1", plainTag: "v1.56.1" })
    expect(calmer.fixes[2]!.plainTag).toBeUndefined()
    // An AI-only release has no partner, and does not take another's.
    expect(entries[2]).toMatchObject({ tag: "v2.41.0" })
    expect(entries[2]!.plainTag).toBeUndefined()
  })

  it("leads with the earliest patch when the feature release came before the public repository", () => {
    const first = buildChangelog([
      rel("v2.38.2", "2026-10-01T15:59:00Z", "Build and install OneCamp from source with one script."),
      rel("v2.38.1", "2026-10-01T15:49:00Z", "The first open-source release of OneCamp with AI teammates. The server is now AGPL-3.0."),
    ])
    expect(first).toHaveLength(1)
    expect(first[0]).toMatchObject({ title: "The first open-source release of OneCamp with AI teammates", tag: "v2.38.1", story: "The server is now AGPL-3.0." })
    expect(first[0]!.fixes.map((f) => [f.tag, f.items])).toEqual([["v2.38.2", ["Build and install OneCamp from source with one script."]]])
  })

  it("leaves out drafts, pre-releases and tags that are not releases", () => {
    const odd = buildChangelog([
      rel("v2.73.0", "2026-10-12T00:00:00Z", "**Draft**\n- x", { draft: true }),
      rel("v2.74.0", "2026-10-12T00:00:00Z", "**Preview**\n- x", { prerelease: true }),
      rel("v2.75.0-rc1", "2026-10-12T00:00:00Z", "**Candidate**\n- x"),
      rel("nightly", "2026-10-12T00:00:00Z", "**Nightly**\n- x"),
      rel("v2.76.0", "", "**Unpublished**\n- x"),
    ])
    expect(odd).toEqual([])
  })

  it("gives every entry a dated address of its own", () => {
    expect(entries[0]!.slug).toBe("2026-10-10-a-calmer-workspace")
    expect(entrySlug("2026-10-08T10:09:00Z", "Reports: how work is going across your projects, and who is behind")).toBe(
      "2026-10-08-reports-how-work-is-going-across-your-projects",
    )
    // The later of two same-named releases takes the suffix, so the first keeps its address.
    const twins = buildChangelog([
      rel("v2.81.0", "2026-10-20T08:00:00Z", "**Faster boards**\n- x"),
      rel("v2.80.0", "2026-10-20T07:00:00Z", "**Faster boards**\n- y"),
    ])
    expect(twins.map((e) => [e.tag, e.slug])).toEqual([
      ["v2.81.0", "2026-10-20-faster-boards-2"],
      ["v2.80.0", "2026-10-20-faster-boards"],
    ])
  })

  it("finds the entry an old address meant when only one release shipped that day", () => {
    expect(sameDayEntry(entries, "2026-10-10-a-quieter-workspace")?.title).toBe("A calmer workspace")
    const busy = buildChangelog([rel("v2.81.0", "2026-10-20T08:00:00Z", "**One**\n- x"), rel("v2.80.0", "2026-10-20T07:00:00Z", "**Two**\n- y")])
    expect(sameDayEntry(busy, "2026-10-20-three")).toBeUndefined()
    expect(sameDayEntry(entries, "not-a-date")).toBeUndefined()
  })
})

describe("what an entry says about itself", () => {
  it("describes itself by its story, or else its first highlights, in plain text and at most 160 characters", () => {
    const [calmer] = buildChangelog([rel("v2.71.0", "2026-10-10T06:41:00Z", CALMER)])
    expect(entryDescription(calmer!)).toBe("One accent, and text you can read all day.")
    const long = entryDescription({
      publishedAt: "2026-10-10T00:00:00Z",
      sections: [{ items: ["**Formula fields.** " + "A column worked out from the others, with `IF` and [links](https://x.test). ".repeat(4)] }],
    })
    expect(long.length).toBeLessThanOrEqual(160)
    expect(long).toMatch(/^Formula fields\. A column worked out from the others, with IF and links\./)
    expect(long.endsWith("…")).toBe(true)
    expect(entryDescription({ publishedAt: "2026-10-10T00:00:00Z", sections: [] })).toBe("What shipped in OneCamp on 10 October 2026.")
  })

  it("shows a highlight on /changelog by its lead and its first sentence, cut mid-way only when that sentence is too long", () => {
    expect(digestLine("**Focus time.** Mark an event as focus time and notifications pause.")).toEqual({ lead: "Focus time.", rest: "Mark an event as focus time and notifications pause." })
    // A long highlight shows its first sentence whole, never a clause cut mid-way.
    expect(digestLine("One accent. Orange marks only what you can act on: the main button, a focused field, the current selection and links. Everything else is graphite, and a theme changes the rest.")).toEqual({
      lead: "One accent.",
      rest: "Orange marks only what you can act on: the main button, a focused field, the current selection and links.",
    })
    expect(digestLine("**monday.com**: columns that aren't the item's status become custom fields.")).toEqual({ lead: "monday.com:", rest: "columns that aren't the item's status become custom fields." })
    // No short first sentence: no lead, and the first sentence whole.
    const long = digestLine("The sidebar lists each place once, and the lists share one left edge, in every panel there is. " + "More words. ".repeat(10))
    expect(long.lead).toBeUndefined()
    expect(long.rest).toBe("The sidebar lists each place once, and the lists share one left edge, in every panel there is.")
    // Only a sentence too long to show whole is cut at a word, with an ellipsis.
    const endless = digestLine("This one runs " + "and on ".repeat(40) + "until it stops. Then more.")
    expect(endless.rest.length).toBeLessThanOrEqual(120)
    expect(endless.rest.endsWith("…")).toBe(true)
    // A sentence that ends the highlight is whole too, a line past its room.
    expect(digestLine("Private docs stay private in search. Search and AI search find a doc only for the people who may read it now, comments included.")).toEqual({
      lead: "Private docs stay private in search.",
      rest: "Search and AI search find a doc only for the people who may read it now, comments included.",
    })
    // Longer than that, it stops at the last clause that fits, never inside one.
    expect(
      digestLine(
        "Docs keep one copy of what you type. A doc no longer gains a copy of itself when someone reconnects, docs with tables, embeds, polls, charts or captioned images save again, and a save that fails no longer stops live editing for everyone else.",
      ).rest,
    ).toBe("A doc no longer gains a copy of itself when someone reconnects, docs with tables, embeds, polls, charts or captioned images save again…")
    // "v2.1" and ".m4a" are not where a sentence ends.
    expect(firstSentence("Clips play as audio (.weba, .m4a or .ogg, by browser) and as video when you record the screen with your voice over it, from any message box. More.", 120)).toBe(
      "Clips play as audio (.weba, .m4a or .ogg, by browser) and as video when you record the screen with your voice over it, from any message box.",
    )
  })

  it("sums a post up in whole sentences, never a clause cut mid-way", () => {
    const colour = "A colour for every person, project and channel. Themes that recolour the whole frame. Illustrations where a screen is empty. Then the speed work: a sent message shows in 16 ms instead of 489, and typing in a long doc does a seventh of the work."
    expect(wholeSentences(colour, 170)).toBe("A colour for every person, project and channel. Themes that recolour the whole frame. Illustrations where a screen is empty.")
    // A first sentence a little over the room is still shown whole.
    const team = "A new teammate in OneCamp now lands in #general with the message box ready, however they get in: an invitation, Google, GitHub, single sign-on or the directory, and in one step. Invitations say where they stand."
    expect(wholeSentences(team, 170)).toBe("A new teammate in OneCamp now lands in #general with the message box ready, however they get in: an invitation, Google, GitHub, single sign-on or the directory, and in one step.")
    // Short text is left as it is, and only an endless sentence is cut, at a word.
    expect(wholeSentences("What shipped.", 170)).toBe("What shipped.")
    const endless = wholeSentences("This one runs " + "and on ".repeat(60) + "until it stops.", 170)
    expect(endless.endsWith("…")).toBe(true)
    expect(endless.length).toBeLessThanOrEqual(170)
  })

  it("bolds a highlight's short first sentence on the entry's page, unless it has a lead or Markdown already", () => {
    expect(withLead("One accent. Orange marks only what you can act on.")).toBe("**One accent.** Orange marks only what you can act on.")
    expect(withLead("**Focus time.** Pause.")).toBe("**Focus time.** Pause.")
    expect(withLead("`make verify` checks the API. It must answer.")).toBe("`make verify` checks the API. It must answer.")
    expect(withLead("A single sentence with no second one.")).toBe("A single sentence with no second one.")
  })

  it("keeps a story on this site when it is here", () => {
    expect(storyHref("https://onemana.dev/blog/a-calmer-workspace")).toBe("/blog/a-calmer-workspace")
    expect(storyHref("https://www.onemana.dev/blog/x?y=1")).toBe("/blog/x?y=1")
    expect(storyHref("https://akashc777.github.io/post")).toBe("https://akashc777.github.io/post")
  })
})
