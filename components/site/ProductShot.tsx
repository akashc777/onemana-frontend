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
 *
 * Both carry the real alt. display:none also takes the hidden one out of the
 * accessibility tree, so a screen reader hears one description in either
 * theme. (The dark one used to be alt="" and aria-hidden, which left a dark-mode
 * reader with no image at all.)
 */
export type ShotName = "channel" | "chat" | "docs" | "tasks" | "calendar" | "agents";

export function ProductShot({
  name,
  alt,
  priority = false,
  className = "",
  sizes = "(min-width: 1120px) 1120px, 220vw",
  crop = false,
}: {
  name: ShotName;
  /** Leave the app's sidebar out on a wide screen, so the working area is shown nearer its real size. */
  crop?: boolean;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const common = { width: 2240, height: 1400, sizes, priority } as const;
  // On a phone the whole window would be too small to read, so the frame
  // shows the working area at a readable size: the image at 220% width,
  // shifted past the sidebar. From sm up it is the whole window.
  // With crop, the same move on a wide screen: the sidebar is the left 16.5%
  // of every capture, so the image is drawn at 120% and shifted by that much.
  const img = `block h-auto w-[220%] max-w-none -ml-[34%] ${crop ? "sm:-ml-[19.8%] sm:w-[120%]" : "sm:ml-0 sm:w-full"}`;
  return (
    <Stage className={className}>
      <div className="aspect-[4/3] overflow-hidden rounded-md border border-border bg-card sm:aspect-auto">
        <Image src={`/product/${name}-light.webp`} {...common} alt={alt} className={`${img} dark:hidden`} />
        <Image src={`/product/${name}-dark.webp`} {...common} alt={alt} className={`${img} hidden dark:block`} />
      </div>
    </Stage>
  );
}

/**
 * The ground a screenshot sits on: the muted surface, one hairline, no shadow.
 * On the page's own background the app's grey sidebar ran into the page and
 * the image had no edge; on a step of the same palette it reads as a picture
 * placed with care (design/audit/storefront.md, idea 2).
 */
export function Stage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border bg-muted p-2 sm:p-3 lg:p-4 ${className}`}>{children}</div>;
}

/** A numbered note on a figure: where it points, in percent of the image, and what it says. */
export interface ShotNote {
  /** Horizontal position of the marker, percent of the image width. */
  x: number;
  /** Vertical position of the marker, percent of the image height. */
  y: number;
  text: string;
}

/**
 * A figure's marker: a small square with a number, neutral, so it reads as an
 * annotation laid over the screenshot rather than as part of the app.
 */
function Marker({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <span
      aria-hidden
      style={{ left: `${x}%`, top: `${y}%` }}
      className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm bg-foreground font-mono text-caption font-medium text-background ring-4 ring-foreground/10"
    >
      {n}
    </span>
  );
}

/** The notes under a figure, numbered to match its markers. */
function Notes({ notes }: { notes: ShotNote[] }) {
  return (
    <ol className="m-0 mt-5 grid list-none gap-x-8 gap-y-4 p-0 sm:grid-cols-3">
      {notes.map((note, i) => (
        <li key={note.text} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 text-small text-muted-foreground">
          <span aria-hidden className="hidden pt-px font-mono text-caption font-medium text-foreground sm:block">
            {i + 1}
          </span>
          <span className="col-span-2 sm:col-span-1">{note.text}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * The two hero images, phone and wide, for one theme. Each is its own <img>
 * with its own alt: a <picture> could pick the file by width, but a <source>
 * cannot carry an alt, so a phone reader heard the desktop description
 * (sidebar and all) for a phone screenshot that has no sidebar.
 */
const HERO = {
  desktop: { file: "channel", width: 2240, height: 1400, sizes: "(min-width: 1120px) 1120px, 100vw", show: "hidden sm:block" },
  phone: { file: "channel-phone", width: 780, height: 1180, sizes: "384px", show: "block sm:hidden" },
} as const;

// React 18 knows the attribute only in lower case (next/image does the same).
const HIGH_PRIORITY = { fetchpriority: "high" } as Record<string, string>;

function HeroImage({ theme, kind, alt }: { theme: "light" | "dark"; kind: keyof typeof HERO; alt: string }) {
  const v = HERO[kind];
  const { props } = getImageProps({ src: `/product/${v.file}-${theme}.webp`, width: v.width, height: v.height, sizes: v.sizes, alt });
  return (
    // getImageProps gives the optimised srcSet and the alt; a plain <img> is how it is used.
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    <img {...props} {...HIGH_PRIORITY} loading="lazy" className={`${v.show} h-auto w-full rounded-md border border-border bg-card`} />
  );
}

/**
 * The hero: the #engineering channel, wide on a wide screen and the app's own
 * phone layout below 640 px, in the reader's theme. Exactly one file is
 * fetched per visit, and the one a reader meets is described for what it
 * shows:
 * - four <img>, one per theme and width, each with its own alt (the phone
 *   one says phone);
 * - CSS shows one of them: the theme wrapper is display:none for the theme
 *   not in use (a next-themes class, not prefers-color-scheme, so a media
 *   query cannot choose it) and a breakpoint class hides the other width;
 * - all four are lazy, and a lazy image that is display:none is never
 *   fetched, so only the shown one downloads. display:none also takes the
 *   other three out of the accessibility tree, so one description is heard;
 * - nothing is preloaded: a preload link cannot carry these conditions, and
 *   preloading all four was what fetched every variant on every visit.
 */
export function HeroShot({ alt, phoneAlt, notes = [] }: { alt: string; phoneAlt: string; notes?: ShotNote[] }) {
  return (
    <figure className="m-0">
      <Stage className="mx-auto max-w-sm sm:max-w-none">
        {/* Markers are placed on the wide screenshot only; on a phone the
            app's phone layout is shown and the notes stand as a list. */}
        <div className="relative">
          {(["light", "dark"] as const).map((theme) => (
            <div key={theme} className={theme === "light" ? "dark:hidden" : "hidden dark:block"}>
              <HeroImage theme={theme} kind="phone" alt={phoneAlt} />
              <HeroImage theme={theme} kind="desktop" alt={alt} />
            </div>
          ))}
          <div className="hidden sm:block">
            {notes.map((note, i) => (
              <Marker key={note.text} n={i + 1} x={note.x} y={note.y} />
            ))}
          </div>
        </div>
      </Stage>
      {notes.length > 0 && (
        <figcaption>
          <Notes notes={notes} />
        </figcaption>
      )}
    </figure>
  );
}
