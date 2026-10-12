import { ImageResponse } from "next/og";
import { PostOgCard, OG_POST_SIZE } from "@/lib/og-post-card";
import { loadOgFonts } from "@/lib/og-fonts";
import { getChangelog } from "@/lib/releases";
import { site } from "@/lib/site";

/**
 * A changelog entry's share card (app/changelog/[slug]/opengraph-image.tsx
 * and twitter-image.tsx): the post card's design with "What's new" in moss,
 * the home page pill's "New", over the release's headline and its date.
 * Never throws: an entry that cannot be read gets the changelog's own card,
 * so a crawler always has an image.
 */
export async function changelogCard(slug: string): Promise<ImageResponse> {
  const [entries, fonts] = await Promise.all([getChangelog().catch(() => null), loadOgFonts()]);
  const entry = entries?.find((e) => e.slug === slug);
  const day = entry ? new Date(entry.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
  return new ImageResponse(
    <PostOgCard eyebrow="What's new" title={entry?.title ?? `What's new in ${site.name}`} meta={day || "Every release, newest first"} hue="moss" />,
    { ...OG_POST_SIZE, fonts },
  );
}
