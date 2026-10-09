import Image, { getImageProps } from "next/image";

/**
 * A real screenshot of the product, in the reader's theme.
 *
 * Taken from the live demo (the shared visitor's workspace) at 1440 by 900,
 * once in each theme, and saved under public/product. The page shows the
 * product rather than drawing it: the schematic mockups this replaces were the
 * single biggest reason the site read as a template.
 *
 * Both images are in the markup and CSS shows the one that matches the theme.
 * The hidden one is display:none, so a lazy one is never fetched.
 */
export type ShotName = "channel" | "chat" | "docs" | "tasks" | "calendar" | "agents";

export function ProductShot({
  name,
  alt,
  priority = false,
  className = "",
  sizes = "(min-width: 1120px) 1120px, 220vw",
}: {
  name: ShotName;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const common = { width: 2240, height: 1400, sizes, priority } as const;
  // On a phone the whole window would be too small to read, so the frame
  // shows the working area at a readable size: the image at 220% width,
  // shifted past the sidebar. From sm up it is the whole window.
  const img = "block h-auto w-[220%] max-w-none -ml-[34%] sm:ml-0 sm:w-full";
  return (
    <div className={`aspect-[4/3] overflow-hidden rounded-lg border border-border bg-card sm:aspect-auto ${className}`}>
      <Image src={`/product/${name}-light.webp`} {...common} alt={alt} className={`${img} dark:hidden`} />
      <Image src={`/product/${name}-dark.webp`} {...common} alt="" aria-hidden className={`${img} hidden dark:block`} />
    </div>
  );
}

/**
 * The hero: the #engineering channel, wide on a wide screen and the app's own
 * phone layout below 640 px, in the reader's theme. Exactly one file is
 * fetched per visit:
 * - each theme is a <picture> whose <source> picks phone or desktop by
 *   width, so a phone never downloads the desktop shot or the reverse;
 * - the theme not in use is display:none and lazy, so it is never fetched
 *   (the theme is a class from next-themes, not prefers-color-scheme, so a
 *   media query cannot choose it);
 * - nothing is preloaded: a preload link cannot carry these conditions, and
 *   preloading all four was what fetched every variant on every visit.
 */
export function HeroShot({ alt, phoneAlt }: { alt: string; phoneAlt: string }) {
  return (
    <>
      {(["light", "dark"] as const).map((theme) => {
        const desktop = getImageProps({
          src: `/product/channel-${theme}.webp`,
          width: 2240,
          height: 1400,
          sizes: "(min-width: 1120px) 1120px, 100vw",
          alt: theme === "light" ? alt : "",
        }).props;
        const phone = getImageProps({
          src: `/product/channel-phone-${theme}.webp`,
          width: 780,
          height: 1180,
          sizes: "384px",
          alt: theme === "light" ? phoneAlt : "",
        }).props;
        return (
          <picture key={theme} className={theme === "light" ? "block dark:hidden" : "hidden dark:block"}>
            <source media="(max-width: 639px)" srcSet={phone.srcSet} sizes={phone.sizes} width={780} height={1180} />
            {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
            <img
              {...desktop}
              loading="lazy"
              fetchPriority="high"
              aria-hidden={theme === "dark" ? true : undefined}
              className="mx-auto block h-auto w-full max-w-sm rounded-2xl border border-border bg-card sm:max-w-none sm:rounded-lg"
            />
          </picture>
        );
      })}
    </>
  );
}
