import type { ReactNode } from "react";

/**
 * Questions and their answers, open, on a shared grid.
 *
 * They were a disclosure each (a question with a plus that rotated): the FAQ
 * accordion every SaaS template ends on, and the answer a buyer came for was
 * one tap away, five times over. The answers are short, so they are simply
 * shown: each pair under a hairline, the question in the text face at weight
 * 500 and the answer under it, in one or two columns. In two columns the rows
 * share their top line, so the hairlines meet across the page, and each pair
 * takes two rows of one subgrid, so a question that wraps moves the answer
 * beside it down with its own: the answers start on one line.
 *
 * The question is an h3, so a screen reader can move between them by heading.
 */
export function QuestionList({
  items,
  columns = 1,
  className = "",
}: {
  /** `id` makes a question a link target (#currency); a question that
   *  depends on the reader passes nodes, and then needs an id for its key. */
  items: readonly { q: ReactNode; a: ReactNode; id?: string }[];
  columns?: 1 | 2;
  className?: string;
}) {
  return (
    <ul role="list" className={`m-0 grid list-none gap-x-12 p-0 ${columns === 2 ? "md:grid-cols-2" : ""} ${className}`}>
      {items.map((f, i) => (
        <li key={f.id ?? (typeof f.q === "string" ? f.q : i)} id={f.id} className={`border-t border-border pb-8 pt-5 ${columns === 2 ? "md:row-span-2 md:grid md:grid-rows-subgrid md:gap-y-0" : ""}`}>
          <h3 className="font-sans text-body font-medium tracking-normal text-foreground">{f.q}</h3>
          <p className="mt-2 max-w-prose text-small text-muted-foreground sm:text-body">{f.a}</p>
        </li>
      ))}
    </ul>
  );
}
