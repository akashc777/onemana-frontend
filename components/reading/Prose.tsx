import { CopyCode } from "./CopyCode";

/** Which reading size a long page uses (app/globals.css, the reading system). */
export type ReadingKind = "docs" | "post" | "legal";

/**
 * The body of a long page: a doc, a post or a legal page, from HTML that
 * lib/article.ts has shaped. One component, so the three read the same way
 * and a change to how reading looks is made once.
 *
 * Code blocks copy with a few hundred bytes of script, loaded only by a page
 * that has one.
 */
export function Prose({ html, kind, className = "" }: { html: string; kind: ReadingKind; className?: string }) {
  return (
    <>
      <div className={`prose reading reading-${kind} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
      {html.includes("data-copy-code") ? <CopyCode /> : null}
    </>
  );
}
