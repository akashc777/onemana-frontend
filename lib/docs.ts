// Typed client for the self-hosted docs CMS (onemana-backend).

import { site } from "./site";

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
}
export interface DocNavGroup {
  category: string;
  items: DocNavItem[];
}

async function getJSON<T>(path: string, opts: { revalidate?: number; noStore?: boolean } = {}): Promise<T> {
  const init: RequestInit & { next?: { revalidate: number } } = opts.noStore
    ? { cache: "no-store" }
    : { next: { revalidate: opts.revalidate ?? 300 } };
  const res = await fetch(`${site.backendUrl}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { msg?: string })?.msg || `Request failed (${res.status})`);
  return (data as { data: T }).data;
}

/** Published docs in sidebar order (content omitted by the API). Always
 *  fetched fresh so newly published docs appear immediately. */
export async function listPublishedDocs(): Promise<DocPage[]> {
  return (await getJSON<DocPage[] | null>("/onecamp/docs", { noStore: true })) ?? [];
}

/** A single published doc by slug. Returns null on 404. */
export async function getDoc(slug: string): Promise<DocPage | null> {
  try {
    return await getJSON<DocPage>(`/onecamp/docs/${encodeURIComponent(slug)}`, { revalidate: 120 });
  } catch {
    return null;
  }
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
    map.get(key)!.push({ slug: d.slug, title: d.title });
  }
  return order.map((key) => ({ category: labels.get(key)!, items: map.get(key)! }));
}
