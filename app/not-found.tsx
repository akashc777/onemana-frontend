import Link from "next/link";
import { MissingPath } from "@/components/site/MissingPath";

/**
 * A missing page, written down the way OneCamp writes everything down: one
 * row, what was asked for and what happened, then the three places people are
 * usually looking for. Left-aligned like every other page; no joke.
 */
export default function NotFound() {
  return (
    <section className="container-x pb-28 pt-16 sm:pt-24">
      <h1 className="text-[2.25rem] leading-[2.625rem] tracking-[-0.024em] text-foreground sm:text-h1">There is no page here</h1>
      <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">
        The address may be mistyped, or the page may have moved.
      </p>

      <div className="mt-10 max-w-2xl border-y border-border py-4">
        <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-caption">
          <span className="text-danger-ink">page.not_found</span>
          <span className="text-muted-foreground">404</span>
        </p>
        <p className="m-0 mt-1.5 font-mono text-small text-foreground">
          GET <MissingPath />
        </p>
      </div>

      <nav aria-label="Where to go instead" className="mt-10">
        <ul className="flex flex-col gap-3 text-body sm:flex-row sm:gap-8">
          <li>
            <Link href="/" className="link">
              The home page
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="link">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/docs" className="link">
              The docs
            </Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}
