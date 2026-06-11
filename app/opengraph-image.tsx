import { ImageResponse } from "next/og";
import { OgCard, OG_ALT, OG_SIZE } from "@/lib/og-card";
import { loadOgFonts } from "@/lib/og-fonts";

export const runtime = "edge";
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const fonts = await loadOgFonts();
  return new ImageResponse(<OgCard />, { ...OG_SIZE, fonts });
}