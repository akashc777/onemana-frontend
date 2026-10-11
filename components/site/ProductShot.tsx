import { getImageProps } from "next/image";
import type { CampHue } from "@/lib/campHue";
import { hueOrAgent } from "@/components/ui/graphics/hues";
import { AgentSquare, CampCanvas, FloatChip } from "@/components/ui/v3";

/**
 * Real screenshots of the product, in the reader's theme, shown the way the
 * product is used: at 1:1 CSS pixels inside a window, cropped and never
 * scaled (site.md S18).
 *
 * Taken from the live demo (the shared visitor's workspace) at 1120 by 700
 * CSS pixels at DPR 2, once in each theme, and saved under public/product.
 * They are the wave-2 captures, retaken once the app's v3 shell is live;
 * until then they are cropped the same way.
 *
 * Both themes are in the markup and CSS shows the one that matches. The
 * hidden one is display:none, so a lazy one is never fetched; each carries
 * the real alt, and display:none keeps the hidden one from being read.
 */
export type ShotName = "channel" | "chat" | "docs" | "tasks" | "calendar" | "agents";

/**
 * Drop the srcset's candidates wider than the capture at DPR 2: a phone at
 * DPR 3 asked for the 1200w file of a 390px image (and 3840w of a wide one),
 * half again the bytes for detail the capture does not have, and the hero
 * image is the phone's LCP.
 */
function capSrcSet<T extends { srcSet?: string }>(props: T, width: number): T {
  const max = width * 2 + 100;
  const kept = (props.srcSet ?? "").split(", ").filter((c) => Number(c.match(/ (\d+)w$/)?.[1] ?? 0) <= max);
  return { ...props, srcSet: kept.length ? kept.join(", ") : props.srcSet };
}

/** A wide capture's size in CSS pixels (2240 x 1400 at DPR 2). */
export const SHOT = { width: 1120, height: 700 } as const;

/**
 * Where each tour shot's window starts reading, in CSS pixels of the
 * capture: past the app's sidebar on every surface but the channel, whose
 * sidebar is part of the story.
 */
const CROP: Record<ShotName, { x: number; y: number }> = {
  channel: { x: 12, y: 0 },
  chat: { x: 190, y: 0 },
  docs: { x: 190, y: 40 },
  tasks: { x: 190, y: 40 },
  calendar: { x: 190, y: 40 },
  agents: { x: 190, y: 40 },
};

/**
 * A screenshot in its window (S18): r14, e4, clipped, the capture drawn at
 * its own size from the crop's corner, so it reads as the app continuing
 * past the frame. No border on the image itself.
 */
export function ProductWindow({ name, alt, className = "", loading = "lazy" }: { name: ShotName; alt: string; className?: string; loading?: "lazy" | "eager" }) {
  const c = CROP[name];
  return (
    <div className={`${/\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative"} overflow-hidden rounded-[14px] bg-card shadow-e4 ${className}`}>
      {(["light", "dark"] as const).map((theme) => {
        const props = capSrcSet(getImageProps({ src: `/product/${name}-${theme}.webp`, width: SHOT.width, height: SHOT.height, sizes: `${SHOT.width}px`, alt }).props, SHOT.width);
        return (
          // getImageProps gives the srcSet for 1x and 2x; a plain <img> lets it sit at 1:1.
          // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
          <img
            key={theme}
            {...props}
            loading={loading}
            style={{ left: -c.x, top: -c.y, width: SHOT.width, height: SHOT.height }}
            className={`absolute max-w-none ${theme === "light" ? "dark:hidden" : "hidden dark:block"}`}
          />
        );
      })}
    </div>
  );
}

/**
 * A tour shot on its stage (S18): a 20px-radius hue tint lit from the top
 * right in the hue's strong cut, the window 48px in from the top and left and
 * running off the right and bottom edges. `children` float over it (the
 * tour's moment and spot tile).
 */
export function ProductShot({ name, alt, hue, className = "", children }: { name: ShotName; alt: string; hue: CampHue | "agent"; className?: string; children?: React.ReactNode }) {
  return (
    <Stage hue={hue} className={className}>
      {/* Keyed by the surface: a new tab's window cross-fades in over the old (fx-fade). */}
      <ProductWindow key={name} name={name} alt={alt} className="fx-fade absolute left-6 top-6 h-[640px] w-[1120px] sm:left-12 sm:top-12" />
      {children}
    </Stage>
  );
}

/** The tour's ground: the hue's tint with a 22% radial of its strong cut from the top right. Its tint changes over 240ms. */
export function Stage({ children, className = "", hue }: { children: React.ReactNode; className?: string; hue: CampHue | "agent" }) {
  return (
    <div
      className={`${hueOrAgent(hue)} relative isolate overflow-hidden rounded-3xl bg-hue-tint transition-colors duration-panel ease-in-out ${className}`}
      style={{ backgroundImage: "radial-gradient(70% 70% at 100% 0%, rgb(var(--hue) / 0.22), transparent 65%)" }}
    >
      {children}
    </div>
  );
}

/** The 1px gif a hidden breakpoint's <picture> resolves to, so it never downloads a screenshot. */
const NOTHING = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

// React 18 knows the attribute only in lower case (next/image does the same).
const HIGH_PRIORITY = { fetchpriority: "high" } as Record<string, string>;

/**
 * One breakpoint's hero image, eager and at high priority because it is the
 * LCP candidate (G8). A <picture> chooses the theme by the reader's system
 * setting and resolves to a 1px gif at the other breakpoint, so exactly one
 * screenshot downloads; the <img> carries this breakpoint's own alt. A
 * reader who chose the other theme with the toggle gets a lazy copy in it
 * (.hero-alt), shown by CSS only then.
 */
function HeroPicture({ file, width, height, alt, hideAt, className }: { file: string; width: number; height: number; alt: string; hideAt: string; className: string }) {
  const pick = (theme: string) => capSrcSet(getImageProps({ src: `/product/${file}-${theme}.webp`, width, height, sizes: `${width}px`, alt, quality: 60 }).props, width);
  const light = pick("light");
  const dark = pick("dark");
  return (
    <>
      <picture className="hero-os">
        <source media={hideAt} srcSet={NOTHING} />
        <source media="(prefers-color-scheme: dark)" srcSet={dark.srcSet} />
        {/* eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element */}
        <img {...light} {...HIGH_PRIORITY} loading="eager" className={className} />
      </picture>
      {(["light", "dark"] as const).map((t) => (
        // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
        <img key={t} {...(t === "light" ? light : dark)} loading="lazy" className={`hero-alt hero-alt-${t} hidden ${className}`} />
      ))}
    </>
  );
}

/**
 * THE HERO (site.md H2): the camp canvas, 720px tall and r24, with the
 * #engineering channel at 1:1 in an e4 window and two floating chips that
 * name real things in it. The window rises 24px on load (transform only: it
 * is never faded, being the LCP candidate at 1440); the chips spring in at
 * 420 and 540ms and lean towards the pointer.
 *
 * On a phone the canvas holds the app's own phone layout at 1:1, 520px tall
 * and fading into the canvas at its foot, with one chip.
 */
export function HeroShot({ alt, phoneAlt }: { alt: string; phoneAlt: string }) {
  return (
    <figure className="m-0">
      <CampCanvas drift className="rounded-[20px] px-3.5 pb-3.5 pt-14 sm:h-[720px] sm:rounded-4xl sm:p-0">
        {/* The agent: what matters most in the shot, at the top left. */}
        <FloatChip
          className="drift in-chip at-420 absolute left-3.5 top-3 z-20 sm:left-6 sm:top-6"
          mark={<AgentSquare size={28} />}
          title="Release Captain"
          tag="Agent"
          line="Acts for Sam, never beyond what Sam can do"
          lineClassName="hidden sm:block"
        />
        <FloatChip
          className="drift in-chip at-540 absolute right-6 top-6 z-20 hidden lg:inline-flex"
          mark={
            <span className="hue-sky inline-flex size-7 items-center justify-center rounded-lg bg-hue-tint text-[15px] font-semibold text-hue-ink" aria-hidden="true">
              #
            </span>
          }
          title="engineering"
          line="4 people · 1 agent · 6 tasks"
        />

        {/* Wide: the window at 1:1, 60px in from the canvas's sides and 84 from its top. */}
        <div className="in-rise relative hidden h-[596px] overflow-hidden rounded-[14px] bg-card shadow-e4 sm:absolute sm:inset-x-8 sm:top-[84px] sm:block lg:inset-x-[60px]">
          <div className="absolute left-[-190px] top-0 h-[700px] w-[1120px] lg:left-[-12px]">
            <HeroPicture file="channel" width={1120} height={700} alt={alt} hideAt="(max-width: 639px)" className="block h-[700px] w-[1120px] max-w-none" />
          </div>
        </div>

        {/* Phone: the app's phone layout at 1:1, cut at 520px. */}
        <div className="in-rise relative mx-auto h-[520px] max-w-[390px] overflow-hidden rounded-[14px] bg-card shadow-e4 sm:hidden">
          <div className="fade-foot absolute left-1/2 top-0 h-[590px] w-[390px] -translate-x-1/2">
            <HeroPicture file="channel-phone" width={390} height={590} alt={phoneAlt} hideAt="(min-width: 640px)" className="block h-[590px] w-[390px] max-w-none" />
          </div>
        </div>
      </CampCanvas>
    </figure>
  );
}
