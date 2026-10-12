import Image from "next/image";
import type { CampHue } from "@/lib/campHue";
import { HUE_CLASS } from "@/components/ui/graphics/hues";

/**
 * A post's cover (site.md BL2): r16 at e2 with no tinted frame, since the
 * cover carries its own colour; full bleed on a phone.
 *
 * Covers come in seven shapes (1440 by 900, 1280 by 720, square, and four
 * more), and the page used to reserve 1200 by 630 for all of them, so the
 * text under every cover jumped when it arrived. The frame is 16:10, the shape
 * of most covers since September (screenshots of the app), and the cover
 * fills it, so the box is the same before and after it loads.
 *
 * In the dark theme every cover is dimmed slightly and framed by a hairline
 * (`.post-cover` in app/globals.css): many covers are pale screenshots, and a
 * white one was the brightest thing on the page. The picture is never edited.
 *
 * It is the page's largest image and usually what LCP measures, so it is
 * fetched first (priority). It is shown as published, never resized by the
 * image optimiser (next.config.mjs has images.unoptimized: Vercel's free plan
 * counts every resize).
 */
export function PostCover({ src, hue }: { src: string; hue: CampHue }) {
  return (
    <div className={`${HUE_CLASS[hue]} -mx-4 sm:mx-0`}>
      <div className="post-cover relative aspect-[16/10] overflow-hidden bg-muted shadow-e2 sm:rounded-2xl">
        <Image
          src={src}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover"
        />
      </div>
    </div>
  );
}
