import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { listPublishedPosts } from "@/lib/blog";

const STATIC_ROUTES = [
  "",
  "/buy",
  "/docs",
  "/blog",
  "/about",
  "/terms-of-service",
  "/refund-policy",
  "/account-ownership-policy",
  "/taxes-on-services",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await listPublishedPosts();
    blogEntries = posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    // Blog API unreachable at build time — ship the static sitemap.
  }

  return [...staticEntries, ...blogEntries];
}
