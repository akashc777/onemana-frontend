import { ImageResponse } from "next/og";
import { PostOgCard, OG_POST_SIZE } from "@/lib/og-post-card";
import { loadOgFonts } from "@/lib/og-fonts";
import { getPost } from "@/lib/blog";
import { site } from "@/lib/site";

export const runtime = "edge";
export const size = OG_POST_SIZE;
export const contentType = "image/png";
export const alt = `${site.name} blog`;

// Per-post share card, generated from the post title. Never throws: a missing
// post or backend error falls back to a branded card so crawlers always get an
// image.
export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug).catch(() => null);
  const fonts = await loadOgFonts();

  const title = post?.title || "OneCamp Blog";
  const eyebrow = post?.tags?.[0]?.trim() || "Blog";
  const year = (post?.published_at || post?.created_at || "").slice(0, 4);
  const meta = [post?.author?.trim(), year].filter(Boolean).join("  \u00b7  ") || site.tagline;

  return new ImageResponse(<PostOgCard eyebrow={eyebrow} title={title} meta={meta} />, { ...OG_POST_SIZE, fonts });
}
