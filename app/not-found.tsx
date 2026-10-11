import Link from "next/link";
import { MissingPath } from "@/components/site/MissingPath";
import { Icon } from "@/components/ui/icons";
import { LogoRing } from "@/components/ui/v3";
import { SpotError } from "@/components/ui/graphics/spots";
import { Tile } from "@/components/ui/graphics/Tile";
import { SECTION_END } from "@/components/ui/Section";

/** The three places people are usually looking for, each with its own colour. */
const WAYS = [
  { href: "/", title: "The home page", line: "What OneCamp is, and the live demo", mark: "home", hue: "brand" },
  { href: "/pricing", title: "Pricing", line: "Free, a licence once, or Cloud", mark: "key", hue: "sun" },
  { href: "/docs", title: "The docs", line: "Install it, run it, move to it", mark: "doc", hue: "dusk" },
  { href: "/docs#search", title: "Search the docs", line: "Every guide, by what it answers", mark: "search", hue: "lake" },
] as const;

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
          <SpotError size={120} className="mb-6 md:hidden" />
          <h1 className="text-page text-foreground">There is no page here</h1>
          <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">The address may be mistyped, or the page may have moved.</p>

          {/* Even this is on the record (site.md N1): a night card set as a record row. */}
          <div className="night mt-10 max-w-2xl rounded-xl border-l-[3px] border-camp-berry px-5 py-4 shadow-e3">
            <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-caption">
              <span>
                <span className="text-muted-foreground">#404</span> <span className="text-camp-berry-ink">page.not_found</span>
              </span>
              <span className="text-muted-foreground">404</span>
            </p>
            <p className="m-0 mt-1.5 font-mono text-small text-foreground">
              GET <MissingPath />
            </p>
          </div>
        </div>
        <SpotError size={240} className="fx-spring hidden md:block" />
      </div>

      <nav aria-label="Where to go instead" className="mt-12">
        <ul role="list" className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {WAYS.map((w) => (
            <li key={w.href}>
              <Link href={w.href} className="lift flex h-full items-start gap-3 rounded-xl bg-card p-5 shadow-e1">
                {/* One tile language for all four: the home page's tile holds
                    the logo's gradient ring on the brand's soft ground, where
                    it used to be a bare flat ring among three tiles. */}
                <Tile hue={w.hue} size="md">
                  {w.mark === "home" ? <LogoRing size={18} /> : <Icon name={w.mark} />}
                </Tile>
                <span className="min-w-0">
                  <span className="block text-body font-[590] text-foreground">{w.title}</span>
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
