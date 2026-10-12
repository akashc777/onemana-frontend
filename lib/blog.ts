// Typed client for the self-hosted blog (onemana-backend).

import { site } from "./site";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  content: string;
  author: string;
  tags: string[];
  status: "draft" | "published";
  seo_title: string;
  seo_desc: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Resolve a media url (relative paths are served by the backend). */
export function mediaUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${site.backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
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

/** Published posts (content omitted by the API), newest first.
 *
 *  Fresh by default, for the blog index, which renders on each request so a
 *  post appears the moment it is published. `cached` reads it as a page that
 *  regenerates on a timer must (a post's "more from the blog"): a no-store
 *  read there makes Next throw DYNAMIC_SERVER_USAGE (lib/docsRendering.test.ts). */
export async function listPublishedPosts(opts: { cached?: boolean } = {}): Promise<BlogPost[]> {
  return (await getJSON<BlogPost[] | null>("/onecamp/blog", opts.cached ? { revalidate: 120 } : { noStore: true })) ?? [];
}

/** A single published post by slug. Returns null on 404. */
export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    return await getJSON<BlogPost>(`/onecamp/blog/${encodeURIComponent(slug)}`, { revalidate: 120 });
  } catch {
    return null;
  }
}
