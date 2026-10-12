import { OG_POST_SIZE } from "@/lib/og-post-card";
import { changelogCard } from "@/lib/og-changelog";
import { site } from "@/lib/site";

export const runtime = "edge";
export const size = OG_POST_SIZE;
export const contentType = "image/png";
export const alt = `What's new in ${site.name}`;

// The entry's share card, drawn by lib/og-changelog.tsx.
export default function Image({ params }: { params: { slug: string } }) {
  return changelogCard(params.slug);
}
