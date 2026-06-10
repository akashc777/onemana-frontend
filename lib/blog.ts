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

async function getJSON<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${site.backendUrl}${path}`, { next: { revalidate } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { msg?: string })?.msg || `Request failed (${res.status})`);
  return (data as { data: T }).data;
}

/** Published posts for the public blog index (content omitted by the API). */
export async function listPublishedPosts(): Promise<BlogPost[]> {
  return (await getJSON<BlogPost[] | null>("/onecamp/blog")) ?? [];
}

/** A single published post by slug. Returns null on 404. */
export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    return await getJSON<BlogPost>(`/onecamp/blog/${encodeURIComponent(slug)}`, 120);
  } catch {
    return null;
  }
}
