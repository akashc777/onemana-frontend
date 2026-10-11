import { ImageResponse } from "next/og";
import { PostOgCard, OG_POST_SIZE } from "@/lib/og-post-card";
import { loadOgFonts } from "@/lib/og-fonts";
import { getPost } from "@/lib/blog";
import { blogTopic } from "@/lib/blogTopics";
import { site } from "@/lib/site";

export const runtime = "edge";
export const size = OG_POST_SIZE;
export const contentType = "image/png";
export const alt = `${site.name} blog`;

// Twitter card uses the same title-driven design as the OG image.
export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug).catch(() => null);
  const fonts = await loadOgFonts();

  const title = post?.title || "Notes from building OneCamp";
  // The post's topic, in its hue, as the post page's chip shows it (card 2:
  // the site card's language; the URL changes with this file, so caches refetch).
  const topic = blogTopic(post?.tags, post?.title);
  const eyebrow = post ? topic.label : "Blog";
  const year = (post?.published_at || post?.created_at || "").slice(0, 4);
  const meta = [post?.author?.trim(), year].filter(Boolean).join("  \u00b7  ") || "The OneCamp blog";

  return new ImageResponse(<PostOgCard eyebrow={eyebrow} title={title} meta={meta} hue={topic.hue} author={post?.author?.trim() || undefined} />, { ...OG_POST_SIZE, fonts });
}
