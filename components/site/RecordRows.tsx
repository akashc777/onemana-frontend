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
 * Mono is for the record's data only (sequence, action, time, hashes); the
 * sentence a person reads is in the text face.
 */
export function RecordRows({ rows, caption, className = "" }: { rows: RecordRow[]; caption?: ReactNode; className?: string }) {
  const linked = new Set(rows.slice(1).map((r) => r.prev));
  return (
    <figure className={`m-0 ${className}`}>
      <ol className="m-0 list-none border-y border-border p-0" aria-label="Rows from the record">
        {rows.map((r, i) => (
          <li key={r.seq} className="relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3 py-4 [&+li]:border-t [&+li]:border-border">
            {/* The rule from one sequence number to the next is the chain. */}
            {i < rows.length - 1 && (
              <span aria-hidden className="absolute bottom-0 left-[0.6rem] top-10 w-px translate-y-4 bg-border-strong" />
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
                  prev <Hash value={r.prev} marked={linked.has(r.prev)} />
                </span>
                <span>
                  this <Hash value={r.hash} marked={linked.has(r.hash)} />
                </span>
              </p>
            </div>
          </li>
        ))}
      </ol>
      {caption && <figcaption className="mt-3 text-caption text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function Hash({ value, marked }: { value: string; marked: boolean }) {
  if (!marked) return <span translate="no">{shortHash(value)}</span>;
  return (
    <span translate="no" className="rounded-sm border border-border-strong px-1 text-foreground">
      {shortHash(value)}
    </span>
  );
}
