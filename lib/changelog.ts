import { slugify } from "./article";

/**
 * The changelog (/changelog), read from the public repository's releases.
 *
 * lib/releases.ts fetches them; this file only reads them, so the changelog,
 * the home page's release pill and the tests share one reading of the notes,
 * and none of it needs the network.
 *
 * HOW A RELEASE'S NOTES ARE READ. They are Markdown written by hand, and the
 * page takes its shape from them:
 *
 *   **A calmer workspace**                       the headline: the first bold line
 *
 *   One accent, and text you can read all day.   the story: the first paragraph
 *
 *   - Orange marks only what you can act on.     the highlights: the bullets
 *
 *   **Names and handles**                        a further section of highlights
 *   - ...
 *
 *   **Fixes**                                    folded under the entry, with the
 *   - ...                                        patch releases that follow it
 *
 *   **Before you update**                        a note for whoever runs the server
 *   - Nothing to change.
 *
 *   Read the story: https://onemana.dev/blog/... the blog post, when there is one
 *
 * "Update: re-run your install command" lines and migration counts are left
 * out: the page says once how updating works, and an update runs its own
 * migrations.
 *
 * WHICH RELEASES ARE ENTRIES. Each feature (minor) release of the server is an
 * entry. A patch release folds under its feature release as fixes, so a
 * fix-only release never takes over the headline, or leaves the pill without
 * one. The edition without AI ships alongside under tags of its own; an entry
 * names that tag beside the server's, for an admin matching what the admin
 * panel's update check reports.
 */

/** A release as GitHub's API gives it, reduced to what is read. */
export interface GithubRelease {
  tag_name?: string;
  published_at?: string;
  draft?: boolean;
  prerelease?: boolean;
  body?: string;
  html_url?: string;
}

/** The server's release line (the edition with AI), and the edition without AI's. */
export const SERVER_LINE = 2;
export const PLAIN_LINE = 1;

/** A section of highlights. */
export interface Highlights {
  /** Its heading. The first section has none when the entry's title already names it. */
  title?: string;
  /** Markdown, one per highlight: a bullet, or a paragraph written as one. */
  items: string[];
}

/** A note for whoever runs the server: "Before you update", "Known issue, fixed on 8 October". */
export interface Notice {
  title: string;
  /** Markdown. */
  text: string;
}

export interface ParsedNotes {
  /** The release's own headline: its first bold line, unless that is a label such as "Fixes" or "New". */
  headline?: string;
  /** The first paragraph, Markdown. */
  story?: string;
  sections: Highlights[];
  /** Every item of a "Fixes" or "Fixed" section, Markdown. */
  fixes: string[];
  notices: Notice[];
  /** The blog post: "Read the story: <url>". */
  storyUrl?: string;
}

/** Fixes shipped in one release: the feature release's own, or a later patch's. */
export interface FixGroup {
  publishedAt: string;
  /** A patch's own headline, when it has one ("Install with one email"). */
  title?: string;
  items: string[];
  tag: string;
  url?: string;
  /** The edition without AI's release that shipped with it. */
  plainTag?: string;
  plainUrl?: string;
}

export interface ChangelogEntry {
  /** "2026-10-10-a-calmer-workspace": the entry's anchor on /changelog and its own page. */
  slug: string;
  title: string;
  /** True when the title is the release's own headline, the only kind the home page's pill shows. */
  headlined: boolean;
  publishedAt: string;
  story?: string;
  sections: Highlights[];
  notices: Notice[];
  /** The release's own fixes first (when it has any), then its patches, oldest first. */
  fixes: FixGroup[];
  storyUrl?: string;
  /** For an admin: the server release's tag and its notes on GitHub. */
  tag: string;
  url?: string;
  plainTag?: string;
  plainUrl?: string;
}

// ---------------------------------------------------------------- the notes

type Block = { kind: "heading" | "bullet" | "para"; text: string };

/**
 * The notes as blocks: a heading (a line that is all bold, or a # heading), a
 * bullet with its continuation lines, or a paragraph. A blank line ends a
 * block; an indented line belongs to the block above it.
 */
export function noteBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let open: Block | null = null;
  let fence = false;
  const close = () => {
    if (open && open.text.trim()) blocks.push({ kind: open.kind, text: open.text.trim() });
    open = null;
  };
  for (const raw of body.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (fence || /^\s*```/.test(line)) {
      if (/^\s*```/.test(line)) fence = !fence;
      if (open) open.text += `\n${line}`;
      else open = { kind: "para", text: line };
      continue;
    }
    if (!line.trim()) {
      close();
      continue;
    }
    const heading = /^#{1,6}\s+(.+?)\s*#*$/.exec(line) ?? /^\*\*([^*]+)\*\*\s*:?$/.exec(line);
    if (heading) {
      close();
      blocks.push({ kind: "heading", text: heading[1]! });
      continue;
    }
    const bullet = /^[-*+]\s+(.*)$/.exec(line);
    if (bullet) {
      close();
      open = { kind: "bullet", text: bullet[1]! };
      continue;
    }
    if (open) open.text += `\n${line}`;
    else open = { kind: "para", text: line.trim() };
  }
  close();
  return blocks;
}

/** A heading's words, without Markdown or the stop or colon it ends on. */
export function plainTitle(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    // "Security (v2.38.1)": the tag is said once, at the entry's foot.
    .replace(/\s*\(v\d+(?:\.\d+)+\)/g, "")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.:]+$/, "")
    .trim();
}

/**
 * Headings that label a part of the notes rather than name the release: a
 * release whose first bold line is "New" or "Projects" has no headline of its
 * own, and its title is found another way (entryTitle).
 */
const LABEL =
  /^(new|what'?s new|new and improved|highlights?\b.*|improvements?|improved|polish(ed)?|smoother( to use)?|lighter|faster|under the hood|other changes|changes|misc(ellaneous)?|self-hosting|security|ai edition|tasks|projects|clients|channels|chat|calendar|boards|docs|notifications|phones|mobile|time|sign-in|activity|getting started|calls|tables|imports?|guests|admin|search|settings|inbox|public demo|web app)(\s*\(.*\))?$/i;
const FIXES = /^(bug |import |small )?fix(es|ed)?\b/i;
const NOTICE = /^(before you (update|upgrade)|known issues?\b|upgrade notes?|breaking changes?|heads up|fixed on\b)/i;
/** How to update, said once by the page, and migration counts, which an update runs by itself. */
const BOILERPLATE =
  /^(update:|updating:|to update\b|install(,| or)? update\b|install, update and build|guide:|from source:|migrations? \d|no (new )?(database )?migrations)/i;
const STORY_LINK = /read the (?:full )?story\b[^\n]*?(https?:\/\/[^\s)>\]]+)/i;

function isHeadline(title: string): boolean {
  return title.length >= 3 && title.length <= 100 && !LABEL.test(title) && !FIXES.test(title) && !NOTICE.test(title);
}

/** A paragraph that opens with a bold lead: "**Polls in channels.** /poll posts ...". */
function boldLead(text: string): { lead: string; rest: string } | null {
  const m = /^\*\*(.+?)\*\*\s*([\s\S]*)$/.exec(text);
  return m ? { lead: plainTitle(m[1]!), rest: m[2]!.replace(/^[:.]\s*/, "").trim() } : null;
}

/** Pure: notes in, the parts an entry shows out. */
export function parseNotes(body: string | undefined): ParsedNotes {
  const out: ParsedNotes = { sections: [], fixes: [], notices: [] };
  const kept: string[] = [];
  for (const line of (body ?? "").split(/\r?\n/)) {
    const story = STORY_LINK.exec(line);
    if (story && !out.storyUrl) out.storyUrl = story[1]!.replace(/[.,;]+$/, "");
    else kept.push(line);
  }

  let section: Highlights & { kind: "feature" | "fixes" | "notice" } = { items: [], kind: "feature" };
  let started = false;
  // Only the first bold line can be the headline. When it is a label ("New",
  // "Highlights of the 2.3x releases"), the release has none: a later heading
  // ("Security") names a part of it, not the whole.
  let firstHeading = true;
  const flush = () => {
    if (!section.items.length) return;
    if (section.kind === "fixes") out.fixes.push(...section.items);
    else if (section.kind === "notice") out.notices.push({ title: section.title ?? "Note", text: section.items.join("\n\n") });
    else out.sections.push(section.title ? { title: section.title, items: section.items } : { items: section.items });
  };

  for (const block of noteBlocks(kept.join("\n"))) {
    if (block.kind === "heading") {
      flush();
      const title = plainTitle(block.text);
      const kind = FIXES.test(title) ? "fixes" : NOTICE.test(title) ? "notice" : "feature";
      const candidate = firstHeading;
      firstHeading = false;
      if (kind === "feature" && candidate && isHeadline(title)) {
        // The headline's own section has no heading: the entry's title is it.
        out.headline = title;
        section = { items: [], kind };
      } else section = { title, items: [], kind };
      continue;
    }
    const lead = block.kind === "para" ? boldLead(block.text) : null;
    if (block.kind === "para") {
      if (BOILERPLATE.test(plainTitle(block.text)) || (lead && BOILERPLATE.test(lead.lead))) continue;
      if (lead && NOTICE.test(lead.lead)) {
        out.notices.push({ title: lead.lead, text: lead.rest });
        continue;
      }
      const candidate = lead && firstHeading && !started;
      if (lead) firstHeading = false;
      if (lead && candidate && section.kind === "feature" && isHeadline(lead.lead)) {
        // Older notes: "**Your workspace on your desktop's bar.** Two read-only ..."
        out.headline = lead.lead;
        if (lead.rest) out.story = lead.rest;
        started = true;
        continue;
      }
      if (!lead && !out.story && section.kind === "feature" && !section.items.length && !out.sections.length) {
        out.story = block.text;
        started = true;
        continue;
      }
    }
    section.items.push(block.text);
    started = true;
  }
  flush();
  return out;
}

/**
 * The entry's title: the release's headline when it has one. Otherwise the
 * first sentence of its story ("The first open-source release of OneCamp with
 * AI teammates."), then the bold leads of its first two highlights ("Focus
 * time and link cards"), then the first section's heading.
 */
export function entryTitle(notes: ParsedNotes): { title: string; headlined: boolean; story?: string } {
  if (notes.headline) return { title: notes.headline, headlined: true, story: notes.story };
  const sentence = notes.story ? /^(.{8,100}?[.!?])(?:\s+([\s\S]*))?$/.exec(notes.story) : null;
  if (sentence) return { title: plainTitle(sentence[1]!), headlined: false, story: sentence[2]?.trim() || undefined };
  const first = notes.sections[0];
  const leads = (first?.items ?? []).map((i) => boldLead(i)?.lead).filter((l): l is string => !!l && l.length <= 60);
  if (leads.length) {
    const two = leads.length > 1 ? `${leads[0]} and ${lowerFirst(leads[1]!)}` : "";
    return { title: two && two.length <= 60 ? two : leads[0]!, headlined: false, story: notes.story };
  }
  if (first?.title) return { title: first.title, headlined: false, story: notes.story };
  return { title: notes.fixes.length ? "Fixes" : "Smaller changes", headlined: false, story: notes.story };
}

/** "Link cards" after "and" reads "link cards"; an acronym or a name keeps its capital. */
function lowerFirst(s: string): string {
  return /^[A-Z][a-z]/.test(s) ? s[0]!.toLowerCase() + s.slice(1) : s;
}

// ---------------------------------------------------------------- the entries

interface Tagged {
  release: GithubRelease;
  line: number;
  minor: number;
  patch: number;
  at: number;
}

const TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

function tagged(list: GithubRelease[]): Tagged[] {
  const out: Tagged[] = [];
  for (const r of list) {
    const m = TAG.exec(r.tag_name ?? "");
    const at = Date.parse(r.published_at ?? "");
    if (!m || r.draft || r.prerelease || Number.isNaN(at)) continue;
    out.push({ release: r, line: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), at });
  }
  return out;
}

/** The two editions' releases are published together; pair each server release with the one within this of it. */
export const PAIR_WINDOW_MS = 3 * 3600 * 1000;

/**
 * Each server release's partner in the edition without AI: the closest one
 * published within PAIR_WINDOW_MS, each used once. A release made for one
 * edition alone (an AI model change) has none.
 */
export function pairEditions(server: Tagged[], plain: Tagged[]): Map<Tagged, Tagged> {
  const candidates: { s: Tagged; p: Tagged; gap: number }[] = [];
  for (const s of server) for (const p of plain) {
    const gap = Math.abs(s.at - p.at);
    if (gap <= PAIR_WINDOW_MS) candidates.push({ s, p, gap });
  }
  candidates.sort((a, b) => a.gap - b.gap);
  const pairs = new Map<Tagged, Tagged>();
  const used = new Set<Tagged>();
  for (const c of candidates) {
    if (pairs.has(c.s) || used.has(c.p)) continue;
    pairs.set(c.s, c.p);
    used.add(c.p);
  }
  return pairs;
}

const iso = (t: Tagged) => new Date(t.at).toISOString();

/** Everything a patch says, flat: in the fold, a patch reads as one dated list. */
function patchItems(notes: ParsedNotes): string[] {
  return [
    ...(notes.story ? [notes.story] : []),
    ...notes.sections.flatMap((s) => s.items),
    ...notes.fixes,
    ...notes.notices.map((n) => `**${n.title}:** ${n.text}`),
  ];
}

/** "2026-10-10-a-calmer-workspace": the date keeps two releases with one name apart. */
export function entrySlug(publishedAt: string, title: string): string {
  const words = slugify(title).split("-").filter(Boolean);
  let slug = "";
  for (const w of words) {
    if (slug && slug.length + w.length + 1 > 48) break;
    slug = slug ? `${slug}-${w}` : w;
  }
  return `${publishedAt.slice(0, 10)}-${slug || "release"}`;
}

/** Pure: GitHub's release list in, the changelog's entries out, newest first. */
export function buildChangelog(list: GithubRelease[]): ChangelogEntry[] {
  const all = tagged(list);
  const server = all.filter((t) => t.line === SERVER_LINE);
  const plain = pairEditions(server, all.filter((t) => t.line === PLAIN_LINE));

  const byMinor = new Map<number, Tagged[]>();
  for (const t of server) byMinor.set(t.minor, [...(byMinor.get(t.minor) ?? []), t]);

  const entries: ChangelogEntry[] = [];
  for (const group of byMinor.values()) {
    group.sort((a, b) => a.patch - b.patch || a.at - b.at);
    // The feature release leads; when it predates the public repository (the
    // first public release was a patch), its earliest patch leads instead.
    const [lead, ...patches] = group as [Tagged, ...Tagged[]];
    const notes = parseNotes(lead.release.body);
    const { title, headlined, story } = entryTitle(notes);
    const pairOf = (t: Tagged) => plain.get(t);
    const fixGroup = (t: Tagged, items: string[], groupTitle?: string): FixGroup => ({
      publishedAt: iso(t),
      ...(groupTitle ? { title: groupTitle } : {}),
      items,
      tag: t.release.tag_name!,
      ...(t.release.html_url ? { url: t.release.html_url } : {}),
      ...(pairOf(t) ? { plainTag: pairOf(t)!.release.tag_name!, ...(pairOf(t)!.release.html_url ? { plainUrl: pairOf(t)!.release.html_url } : {}) } : {}),
    });
    const fixes: FixGroup[] = [];
    if (notes.fixes.length) fixes.push(fixGroup(lead, notes.fixes));
    for (const p of patches) {
      const pn = parseNotes(p.release.body);
      const items = patchItems(pn);
      if (items.length) fixes.push(fixGroup(p, items, pn.headline));
    }
    const leadPair = pairOf(lead);
    entries.push({
      slug: entrySlug(iso(lead), title),
      title,
      headlined,
      publishedAt: iso(lead),
      ...(story ? { story } : {}),
      sections: notes.sections,
      notices: notes.notices,
      fixes,
      ...(notes.storyUrl ? { storyUrl: notes.storyUrl } : {}),
      tag: lead.release.tag_name!,
      ...(lead.release.html_url ? { url: lead.release.html_url } : {}),
      ...(leadPair ? { plainTag: leadPair.release.tag_name!, ...(leadPair.release.html_url ? { plainUrl: leadPair.release.html_url } : {}) } : {}),
    });
  }

  // Two releases of one name on one day: the later one takes the suffix, so
  // the first one's address never changes when the second ships.
  entries.sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt));
  const seen = new Map<string, number>();
  for (const e of entries) {
    const n = (seen.get(e.slug) ?? 0) + 1;
    seen.set(e.slug, n);
    if (n > 1) e.slug = `${e.slug}-${n}`;
  }
  return entries.reverse();
}

/**
 * The home page's release pill: the newest feature release that names itself.
 * A patch never qualifies (it folds under its feature release), and neither
 * does a release whose title had to be found another way.
 */
export function pillEntry(entries: ChangelogEntry[]): ChangelogEntry | undefined {
  return entries.find((e) => e.headlined);
}

/** How many entries were published in the 30 days before `now`. */
export function entriesSince(entries: ChangelogEntry[], now: Date, days = 30): number {
  const since = now.getTime() - days * 24 * 3600 * 1000;
  return entries.filter((e) => Date.parse(e.publishedAt) >= since).length;
}

/** Markdown as one line of plain text, for a description or a share card. */
export function plainText(md: string): string {
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** The first sentence of a highlight, when it is short enough to read as its lead ("One accent."). */
const FIRST_SENTENCE = /^(.{3,64}?[.!?:])\s+(\S[\s\S]*)$/;

/**
 * A highlight as /changelog's digest shows it, in plain text: its lead (the
 * bold lead it was written with, or a short first sentence) and the rest,
 * shortened to `max` characters at a word. The entry's page has it in full.
 */
export function digestLine(md: string, max = 120): { lead?: string; rest: string } {
  const bold = /^\*\*(.+?)\*\*\s*([\s\S]*)$/.exec(md.trim());
  const sentence = bold ? null : FIRST_SENTENCE.exec(plainText(md));
  let lead = bold ? plainText(bold[1]!) : sentence?.[1];
  let rest = bold ? plainText(bold[2]!) : sentence ? sentence[2]! : plainText(md);
  // "**monday.com**: columns ..." keeps its colon with its lead.
  const stop = lead ? /^([:.,;])\s*/.exec(rest) : null;
  if (lead && stop) {
    lead += stop[1];
    rest = rest.slice(stop[0].length);
  }
  return lead ? { lead, rest: shorten(rest, max - lead.length - 1) } : { rest: shorten(rest, max) };
}

/** Plain text cut at a word to `max` characters, with an ellipsis when cut. */
export function shorten(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, Math.max(0, max - 1));
  return `${cut.slice(0, Math.max(0, cut.lastIndexOf(" "))).replace(/[,;:.(]+$/, "")}…`;
}

/**
 * A highlight with its short first sentence in bold, as hand-written notes
 * often have it ("**Focus time.** Mark an event ..."), so a long list scans
 * by its leads. Left as it is when it has a bold lead already, or when the
 * sentence holds Markdown of its own.
 */
export function withLead(md: string): string {
  if (md.startsWith("**")) return md;
  const m = /^([^*_`[\]<>\n]{3,64}?[.!?:])(\s+\S[\s\S]*)$/.exec(md);
  return m ? `**${m[1]}**${m[2]}` : md;
}

/** An entry's description for search results and share cards: its story, or else its first highlights, in 160 characters at most. */
export function entryDescription(entry: Pick<ChangelogEntry, "story" | "sections" | "publishedAt">): string {
  const text = plainText(entry.story ?? entry.sections[0]?.items.slice(0, 2).join(" ") ?? "");
  if (!text) {
    const day = new Date(entry.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    return `What shipped in OneCamp on ${day}.`;
  }
  if (text.length <= 160) return text;
  const cut = text.slice(0, 159);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.]+$/, "")}…`;
}

/**
 * The entry an address names when its headline has changed since: the only
 * entry published on the address's day, or none when that day had several.
 */
export function sameDayEntry(entries: ChangelogEntry[], slug: string): ChangelogEntry | undefined {
  const day = /^(\d{4}-\d{2}-\d{2})-/.exec(slug)?.[1];
  const same = day ? entries.filter((e) => e.publishedAt.startsWith(day)) : [];
  return same.length === 1 ? same[0] : undefined;
}

/** Where "Read the story" goes: a post on this site stays on it. */
export function storyHref(url: string): string {
  const m = /^https?:\/\/(?:www\.)?onemana\.dev(\/[^\s]*)$/i.exec(url);
  return m ? m[1]! : url;
}
