import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { listPublishedPosts } from "@/lib/blog";
import { listPublishedDocs } from "@/lib/docs";
import { audiences } from "@/lib/audiences";
import { alternatives } from "@/lib/alternatives";
import { templates } from "@/lib/templates";

const STATIC_ROUTES = [
  "",
  "/buy",
  "/compare",
  "/verify",
  "/docs",
  "/blog",
  "/about",
  "/terms-of-service",
  "/privacy-policy",
  "/refund-policy",
  "/account-ownership-policy",
  "/taxes-on-services",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  // The landing pages come from their own data, so a new one can't be left out.
  const landing = [
    ...audiences.map((a) => `/for/${a.slug}`),
    ...alternatives.map((a) => `/alternatives/${a.slug}`),
    "/templates",
    ...templates.map((t) => `/templates/${t.id}`),
  ];
  const staticEntries: MetadataRoute.Sitemap = [...STATIC_ROUTES, ...landing].map((path) => ({
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
    // Blog API unreachable at build time - ship the static sitemap.
  }

  let docEntries: MetadataRoute.Sitemap = [];
  try {
    const docs = await listPublishedDocs();
    docEntries = docs.map((d) => ({
      url: `${site.url}/docs/${d.slug}`,
      lastModified: d.updated_at ? new Date(d.updated_at) : now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    // Docs API unreachable at build time - ship without doc entries.
  }

  return [...staticEntries, ...blogEntries, ...docEntries];
}
