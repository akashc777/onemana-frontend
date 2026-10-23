// Typed client for the self-hosted docs CMS (onemana-backend).

import { backendJSON, backendJSONOrNull } from "./backend";

export interface DocPage {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  order_index: number;
  status: "draft" | "published";
  seo_title: string;
  seo_desc: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocNavItem {
  slug: string;
  title: string;
  /** The guide's own one-line description (its SEO description), if written. */
  summary?: string;
}
export interface DocNavGroup {
  category: string;
  items: DocNavItem[];
}


/** Published docs in sidebar order (content omitted by the API).
 *
 *  `fresh` reads past every cache, for a page rendered on each request (the
 *  docs index). Everywhere else it is cached for as long as the page itself:
 *  a no-store read inside a page that regenerates on a timer makes Next throw
 *  DYNAMIC_SERVER_USAGE, and every doc page answered 500 for that reason. */
export async function listPublishedDocs(opts: { fresh?: boolean } = {}): Promise<DocPage[]> {
  return (await backendJSON<DocPage[] | null>("/onecamp/docs", opts.fresh ? { noStore: true } : { revalidate: 120 })) ?? [];
}

/** Every published guide with its body, in one request (the docs search
 *  index). A guide an older backend sent without its body is read by itself,
 *  so the index is whole whichever backend answers. */
export async function publishedDocsWithContent(): Promise<DocPage[]> {
  const docs = (await backendJSON<DocPage[] | null>("/onecamp/docs?include=content", { revalidate: 300 })) ?? [];
  return Promise.all(docs.map(async (d) => (d.content ? d : ((await getDoc(d.slug).catch(() => null)) ?? d))));
}

/** A single published doc by slug. Returns null on 404, and throws when the
 *  backend fails, so the page keeps its last copy (lib/backend.test.ts). */
export async function getDoc(slug: string): Promise<DocPage | null> {
  return backendJSONOrNull<DocPage>(`/onecamp/docs/${encodeURIComponent(slug)}`, { revalidate: 120 });
}

/** Groups docs into ordered sidebar sections, preserving first-seen order.
 *  Categories are merged case-insensitively (trimmed) so "deployment" and
 *  "Deployment" land in one section; the first-seen label is kept. */
export function groupDocs(docs: DocPage[]): DocNavGroup[] {
  const order: string[] = [];
  const labels = new Map<string, string>();
  const map = new Map<string, DocNavItem[]>();
  for (const d of docs) {
    const label = d.category.trim() || "General";
    const key = label.toLowerCase();
    if (!map.has(key)) {
      map.set(key, []);
      labels.set(key, label);
      order.push(key);
    }
    map.get(key)!.push({ slug: d.slug, title: d.title, summary: d.seo_desc?.trim() || undefined });
  }
  return order.map((key) => ({ category: labels.get(key)!, items: map.get(key)! }));
}

/** The guides either side of one, in the order the sidebar lists them. */
export function docNeighbours(groups: DocNavGroup[], slug: string): { prev?: DocNavItem; next?: DocNavItem } {
  const order = groups.flatMap((g) => g.items);
  const at = order.findIndex((d) => d.slug === slug);
  if (at < 0) return {};
  return { prev: order[at - 1], next: order[at + 1] };
}
