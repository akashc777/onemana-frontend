/**
 * Questions and their answers, open, on a shared grid.
 *
 * They were a disclosure each (a question with a plus that rotated): the FAQ
 * accordion every SaaS template ends on, and the answer a buyer came for was
 * one tap away, five times over. The answers are short, so they are simply
 * shown: each pair under a hairline, the question in the text face at weight
 * 500 and the answer under it, in one or two columns. In two columns the rows
 * share their top line, so the hairlines meet across the page.
 *
 * The question is an h3, so a screen reader can move between them by heading.
 */
export function QuestionList({
  items,
  columns = 1,
  className = "",
}: {
  items: readonly { q: string; a: string }[];
  columns?: 1 | 2;
  className?: string;
}) {
  return (
    <ul role="list" className={`m-0 grid list-none gap-x-12 p-0 ${columns === 2 ? "md:grid-cols-2" : ""} ${className}`}>
      {items.map((f) => (
        <li key={f.q} className="border-t border-border pb-8 pt-5">
          <h3 className="font-sans text-body font-medium tracking-normal text-foreground">{f.q}</h3>
          <p className="mt-2 max-w-prose text-small text-muted-foreground sm:text-body">{f.a}</p>
        </li>
      ))}
    </ul>
  );
}
