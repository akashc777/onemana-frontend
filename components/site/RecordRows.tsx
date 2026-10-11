import type { ReactNode } from "react";
import { recordTime, shortHash, type RecordRow } from "@/lib/recordExcerpt";

// landing-diet: product-mock -- the rows below are the product's own record
// (public/sample-record.json), quoted, not marketing copy. The caption a page
// passes in is counted where that page writes it.

/**
 * Rows from a OneCamp record, set as the record is: sequence number, action,
 * the clock, the row's own sentence and the two hashes.
 *
 * This is the site's signature (design/audit/storefront.md, idea 1). The
 * product's argument is a record that cannot be quietly edited, so where a
 * page makes that argument it shows rows of the record instead of drawing an
 * illustration of one. The hash two neighbouring rows share is marked in both
 * places and a rule joins their sequence numbers: the chain is something the
 * reader can see, not a word they are asked to believe.
 *
 * The marks are drawn only where the chain holds (a row's prev is the hash of
 * the row above it), and they are meant to be seen: muted-foreground at 70%
 * clears the 3:1 a graphic needs (3.04:1 light, 4.1:1 dark, measured in
 * app/paletteContrast.test.ts). border-strong, at 1.4:1, was a hairline nobody
 * could find. A screen reader hears the same thing in words: which hash is
 * which, and that the marked one matches its neighbour.
 *
 * Mono is for the record's data only (sequence, action, time, hashes); the
 * sentence a person reads is in the text face.
 */
export function RecordRows({ rows, caption, className = "", tone = "page" }: { rows: RecordRow[]; caption?: ReactNode; className?: string; tone?: "page" | "night" }) {
  if (tone === "night") return <NightRows rows={rows} caption={caption} className={className} />;
  return (
    <figure className={`m-0 ${className}`}>
      <ol className="m-0 list-none border-y border-border p-0" aria-label="Rows from the record">
        {rows.map((r, i) => {
          // The chain, where it holds: the row above wrote the hash this row
          // carries as prev, and the row below carries this row's hash.
          const prevMatches = i > 0 && rows[i - 1].hash === r.prev;
          const hashMatches = i < rows.length - 1 && rows[i + 1].prev === r.hash;
          return (
            <li key={r.seq} className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3 py-4 [&+li]:border-t [&+li]:border-border">
              {/* The rule from one sequence number to the next is the chain. */}
              {hashMatches && (
                <span aria-hidden className="pointer-events-none absolute bottom-0 left-[0.6rem] top-10 w-px translate-y-4 bg-muted-foreground/70" />
              )}
              <span className="pt-px font-mono text-caption tabular-nums text-muted-foreground">#{r.seq}</span>
              <div className="min-w-0">
                <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-3 font-mono text-caption">
                  <span className={r.refused ? "text-danger-ink" : "text-foreground"}>{r.action}</span>
                  <time dateTime={r.at} className="tabular-nums text-muted-foreground">
                    {recordTime(r.at)} UTC
                  </time>
                </p>
                <p className="m-0 mt-1.5 text-small text-foreground">{r.summary}</p>
                <p className="m-0 mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-caption text-muted-foreground">
                  <span>
                    <span aria-hidden>prev</span> <span className="sr-only">Hash of the row before: </span>
                    <Hash value={r.prev} matches={prevMatches ? "above" : undefined} />
                  </span>
                  <span>
                    <span aria-hidden>this</span> <span className="sr-only">This row&apos;s hash: </span>
                    <Hash value={r.hash} matches={hashMatches ? "below" : undefined} />
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      {caption && <figcaption className="mt-3 text-caption text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

/** A short hash; boxed, and said to match, when the neighbouring row carries it too. */
function Hash({ value, matches }: { value: string; matches?: "above" | "below" }) {
  return (
    <>
      <span translate="no" className={matches ? "rounded-sm border border-muted-foreground/70 px-1 text-foreground" : undefined}>
        {shortHash(value)}
      </span>
      {matches && <span className="sr-only">{` (matches the row ${matches})`}</span>}
    </>
  );
}

/**
 * The record on a night ground (site.md S20): 12/18 mono in ink-2, the
 * action in the agent's ink for an attempt and berry for a refusal, a 3px
 * rule in the same, and each hash as a chip; the hashes two rows share wear
 * one dusk ring, which is the chain.
 */
function NightRows({ rows, caption, className }: { rows: RecordRow[]; caption?: ReactNode; className: string }) {
  return (
    <figure className={`m-0 ${className}`}>
      <ol className="m-0 list-none space-y-3 p-0" aria-label="Rows from the record">
        {rows.map((r, i) => {
          const prevMatches = i > 0 && rows[i - 1].hash === r.prev;
          const hashMatches = i < rows.length - 1 && rows[i + 1].prev === r.hash;
          return (
            <li key={r.seq} className={`reveal border-l-[3px] pl-3 font-mono text-[12px] leading-[18px] text-muted-foreground ${r.refused ? "border-camp-berry" : "border-agent"}`}>
              <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-3">
                <span>
                  <span className={r.refused ? "text-camp-berry-ink" : "text-agent-ink"}>{r.action}</span> <span className="tabular-nums">#{r.seq}</span>
                </span>
                <time dateTime={r.at} className="tabular-nums">
                  {recordTime(r.at)} UTC
                </time>
              </p>
              <p className="m-0 mt-1 font-sans text-caption text-foreground">{r.summary}</p>
              <p className="m-0 mt-2 flex flex-wrap items-center gap-1.5">
                <span aria-hidden>prev</span>
                <span className="sr-only">Hash of the row before: </span>
                <Chip value={r.prev} matches={prevMatches ? "above" : undefined} />
                <span aria-hidden className="ml-1.5">this</span>
                <span className="sr-only">This row&apos;s hash: </span>
                <Chip value={r.hash} matches={hashMatches ? "below" : undefined} />
              </p>
            </li>
          );
        })}
      </ol>
      {caption && <figcaption className="mt-4 text-caption text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function Chip({ value, matches }: { value: string; matches?: "above" | "below" }) {
  return (
    <>
      <span translate="no" className={`inline-flex h-5 items-center rounded-[5px] bg-white/[0.06] px-1.5 text-foreground ${matches ? "ring-1 ring-camp-dusk/70" : ""}`}>
        {shortHash(value)}
      </span>
      {matches && <span className="sr-only">{` (matches the row ${matches})`}</span>}
    </>
  );
}
