// Searching the docs, in the browser, over an index the server builds.
//
// The index (app/docs/search.json) is every guide's sections as text: about
// 140 KB of words for 44 guides, so it is fetched only when somebody reaches
// for the search field, never with the page. Matching is plain: every word
// typed must appear in the section (or its guide's title), and a word in a
// title or heading counts for more than one in the body. Pure, so the ranking
// is tested rather than eyeballed.

/** One guide in the index: slug, title, category, summary, and its sections as [id, heading, text]. */
export interface SearchDoc {
  s: string;
  t: string;
  c: string;
  d: string;
  x: [id: string, heading: string, text: string][];
}

export interface SearchIndex {
  docs: SearchDoc[];
}

export interface SearchHit {
  href: string;
  title: string;
  /** The section's heading, when the hit is a section rather than the guide's opening. */
  section: string;
  /** The words around the first match: before, match, after. */
  snippet: [string, string, string] | null;
  score: number;
}

const MAX_HITS = 8;
const PER_DOC = 3;
const SNIPPET = 64;

export function terms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}.@_-]+/u)
    .map((t) => t.replace(/^[.@_-]+|[.@_-]+$/g, ""))
    .filter((t) => t.length > 0)
    .slice(0, 8);
}

/** Does `word` start a word in `text` (so "cert" in "certificate" ranks above "cert" in "concert")? */
function startsWord(text: string, word: string): boolean {
  let i = text.indexOf(word);
  while (i >= 0) {
    if (i === 0 || !/[\p{L}\p{N}]/u.test(text[i - 1])) return true;
    i = text.indexOf(word, i + 1);
  }
  return false;
}

function snippet(text: string, word: string): [string, string, string] | null {
  const at = text.toLowerCase().indexOf(word);
  if (at < 0) return null;
  const start = Math.max(0, at - SNIPPET / 2);
  const end = Math.min(text.length, at + word.length + SNIPPET);
  // Start and end on whole words, and say when the text goes on.
  let before = text.slice(start, at);
  if (start > 0) before = `…${before.replace(/^\S*\s/, "")}`;
  let after = text.slice(at + word.length, end);
  if (end < text.length) after = `${after.replace(/\s\S*$/, "")}…`;
  return [before, text.slice(at, at + word.length), after];
}

export function searchDocs(index: SearchIndex, query: string): SearchHit[] {
  const words = terms(query);
  if (!words.length) return [];
  const hits: SearchHit[] = [];
  for (const doc of index.docs) {
    const title = doc.t.toLowerCase();
    const summary = doc.d.toLowerCase();
    const found: SearchHit[] = [];
    for (const [id, heading, text] of doc.x) {
      const head = heading.toLowerCase();
      const body = text.toLowerCase();
      const opening = id === "";
      let score = 0;
      let every = true;
      for (const w of words) {
        const inTitle = title.includes(w);
        const inHead = head.includes(w);
        const inBody = body.includes(w) || (opening && summary.includes(w));
        if (!inTitle && !inHead && !inBody) {
          every = false;
          break;
        }
        score += (inTitle ? 8 : 0) + (inHead ? 5 : 0) + (inBody ? 1 : 0);
        // A section named exactly what was asked for is the answer.
        if (head === w) score += 6;
        if (startsWord(title, w) || startsWord(head, w) || startsWord(body, w)) score += 2;
      }
      if (!every) continue;
      // The guide's own opening is where a title match should land.
      if (opening && words.every((w) => title.includes(w))) score += 6;
      const bodyWord = words.find((w) => body.includes(w));
      found.push({
        href: `/docs/${doc.s}${id ? `#${id}` : ""}`,
        title: doc.t,
        section: heading,
        snippet: bodyWord ? snippet(text, bodyWord) : null,
        score,
      });
    }
    found.sort((a, b) => b.score - a.score);
    hits.push(...found.slice(0, PER_DOC));
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, MAX_HITS);
}
