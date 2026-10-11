import Image from "next/image";
import type { CampHue } from "@/lib/campHue";
import { coverOptimizable } from "@/lib/blog";
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
 * It is the page's largest image and usually what LCP measures, so it is
 * fetched first (priority) and resized for the screen by next/image.
 */
export function PostCover({ src, hue }: { src: string; hue: CampHue }) {
  return (
    <div className={`${HUE_CLASS[hue]} -mx-4 sm:mx-0`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-muted shadow-e2 sm:rounded-2xl">
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 640px, calc(100vw - 56px)"
          className="object-cover"
          unoptimized={!coverOptimizable(src)}
        />
      </div>
    </div>
  );
}
