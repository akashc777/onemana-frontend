import { ImageResponse } from "next/og";
import { PostOgCard, OG_POST_SIZE } from "@/lib/og-post-card";
import { loadOgFonts } from "@/lib/og-fonts";
import { getDoc } from "@/lib/docs";
import { hueFor } from "@/lib/campHue";
import { site } from "@/lib/site";

export const runtime = "edge";
export const size = OG_POST_SIZE;
export const contentType = "image/png";
export const alt = `${site.name} docs`;

export default async function Image({ params }: { params: { slug: string } }) {
  const doc = await getDoc(params.slug).catch(() => null);
  const fonts = await loadOgFonts();

  const title = doc?.title || "OneCamp Docs";
  const eyebrow = doc?.category?.trim() || "Docs";
  // The group's hue, as the docs index and sidebar give it (DocsGroupMark's
  // docsGroupHue is this hash). Card 2: the site card's language.
  const hue = hueFor(eyebrow);

  return new ImageResponse(
    <PostOgCard eyebrow={eyebrow} title={title} meta={`${site.name} documentation`} hue={hue} />,
    { ...OG_POST_SIZE, fonts },
  );
}
