import Image from "next/image";

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

/** The same channel on a phone: the app's own mobile layout, not a crop. */
export function PhoneShot({ alt, priority = false, className = "" }: { alt: string; priority?: boolean; className?: string }) {
  const common = { width: 780, height: 1180, sizes: "(min-width: 640px) 360px, 92vw", priority } as const;
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-card ${className}`}>
      <Image src="/product/channel-phone-light.webp" {...common} alt={alt} className="block h-auto w-full dark:hidden" />
      <Image src="/product/channel-phone-dark.webp" {...common} alt="" aria-hidden className="hidden h-auto w-full dark:block" />
    </div>
  );
}
