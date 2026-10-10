import Link from "next/link";
import { MissingPath } from "@/components/site/MissingPath";
import { DocGlyph, KeyGlyph } from "@/components/site/Glyphs";
import { OneCampLogo } from "@/components/site/BrandMarks";
import { SpotError } from "@/components/ui/graphics/spots";
import { Tile } from "@/components/ui/graphics/Tile";
import { SECTION_END } from "@/components/ui/Section";

/** The three places people are usually looking for, each with its own colour. */
const WAYS = [
  { href: "/", title: "The home page", line: "What OneCamp is, and the live demo", mark: "home" as const },
  { href: "/pricing", title: "Pricing", line: "Free, a licence once, or Cloud", mark: "pricing" as const },
  { href: "/docs", title: "The docs", line: "Install it, run it, move to it", mark: "docs" as const },
];

/**
 * A missing page, written down the way OneCamp writes everything down: one
 * row, what was asked for and what happened. Then the three places people are
 * usually looking for, as cards to press. Left-aligned like every other page;
 * no joke in the words.
 *
 * The playful part is the picture: the logo's ring with a piece out
 * (SpotError, the illustration the app shows when something is missing), and
 * a tile in each way's hue.
 */
export default function NotFound() {
  return (
    <section className={`container-x pt-16 sm:pt-24 ${SECTION_END}`}>
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
        <div>
          <SpotError size={88} className="mb-6 md:hidden" />
          <h1 className="text-title text-foreground sm:text-h1">There is no page here</h1>
          <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">The address may be mistyped, or the page may have moved.</p>

          <div className="mt-10 max-w-2xl border-y border-border py-4">
            <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-caption">
              <span className="text-danger-ink">page.not_found</span>
              <span className="text-muted-foreground">404</span>
            </p>
            <p className="m-0 mt-1.5 font-mono text-small text-foreground">
              GET <MissingPath />
            </p>
          </div>
        </div>
        <SpotError size={192} className="hidden md:block" />
      </div>

      <nav aria-label="Where to go instead" className="mt-12">
        <ul role="list" className="m-0 grid list-none gap-4 p-0 sm:grid-cols-3">
          {WAYS.map((w) => (
            <li key={w.href}>
              <Link href={w.href} className="hover-lift flex h-full items-start gap-3 rounded-lg border border-border bg-card p-5">
                {w.mark === "home" ? (
                  <OneCampLogo className="size-8 shrink-0" />
                ) : (
                  <Tile hue={w.mark === "pricing" ? "sun" : "dusk"} size="md">
                    {w.mark === "pricing" ? <KeyGlyph /> : <DocGlyph />}
                  </Tile>
                )}
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">{w.title}</span>
                  <span className="mt-0.5 block text-small text-muted-foreground">{w.line}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
