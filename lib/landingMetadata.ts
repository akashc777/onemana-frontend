import type { Metadata } from "next";
import type { Audience } from "@/lib/audiences";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { site } from "@/lib/site";

/** Metadata for a page rendered from an Audience, at `path` (e.g. "/for/agencies"). */
export function landingMetadata(a: Audience, path: string): Metadata {
  return {
    title: a.seoTitle,
    description: a.seoDescription,
    alternates: { canonical: path },
    openGraph: { title: a.seoTitle, description: a.seoDescription, url: `${site.url}${path}`, type: "website", images: defaultOgImages },
    twitter: { card: "summary_large_image", title: a.seoTitle, description: a.seoDescription, images: defaultTwitterImages },
  };
}
