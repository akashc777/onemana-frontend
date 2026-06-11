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

async function getJSON<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${site.backendUrl}${path}`, { next: { revalidate } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { msg?: string })?.msg || `Request failed (${res.status})`);
  return (data as { data: T }).data;
}

/** Published docs in sidebar order (content omitted by the API). */
export async function listPublishedDocs(): Promise<DocPage[]> {
  return (await getJSON<DocPage[] | null>("/onecamp/docs")) ?? [];
}

/** A single published doc by slug. Returns null on 404. */
export async function getDoc(slug: string): Promise<DocPage | null> {
  try {
    return await getJSON<DocPage>(`/onecamp/docs/${encodeURIComponent(slug)}`, 120);
  } catch {
    return null;
  }
}

/** Groups docs into ordered sidebar sections, preserving first-seen order. */
export function groupDocs(docs: DocPage[]): DocNavGroup[] {
  const order: string[] = [];
  const map = new Map<string, DocNavItem[]>();
  for (const d of docs) {
    const cat = d.category.trim() || "General";
    if (!map.has(cat)) {
      map.set(cat, []);
      order.push(cat);
    }
    map.get(cat)!.push({ slug: d.slug, title: d.title });
  }
  return order.map((category) => ({ category, items: map.get(category)! }));
}
