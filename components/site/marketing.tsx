import { Icon } from "@/components/ui/icons";
import type { ReactNode } from "react";

type QA = { q: ReactNode; a: ReactNode; id?: string };

/**
 * Questions as accordions (site.md S13), for /pricing and the audience
 * pages: 56px rows, a 15/590 question, a 20px plus in the group's hue that
 * turns 45° into a cross, and the answer in 16/26 ink-2, fading in when
 * opened. `open` names the questions that start open (the trial and refund
 * question on /pricing). A <details> each, so it works with no script.
 */
export function QuestionAccordion({ items, open = [], plus = "text-camp-sun", className = "" }: { items: readonly QA[]; open?: readonly number[]; plus?: string; className?: string }) {
  return (
    <div className={`border-t border-border ${className}`}>
      {items.map((f, i) => (
        <details key={f.id ?? (typeof f.q === "string" ? f.q : i)} id={f.id} open={open.includes(i)} className="group border-b border-border">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 [&::-webkit-details-marker]:hidden">
            <h3 className="m-0 font-sans text-body font-[590] text-foreground">{f.q}</h3>
            {/* The icon set's plus at its one stroke (it was a 22px "+" in the
                text face, heavier than every icon beside it). */}
            <Icon name="plus" size={20} className={`transition-transform duration-pop ease-out group-open:rotate-45 ${plus}`} />
          </summary>
          <p className="fx-fade m-0 max-w-prose pb-5 text-body text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/**
 * Open questions in labelled groups (site.md S13, home's "Before you pay"):
 * the group's name after its dot on the left (3 of 12 columns), its
 * questions and answers open on the right. On a phone the group's name sits
 * above its questions as a pill that sticks under the nav while they scroll.
 */
export function QuestionGroups({ groups }: { groups: readonly { label: string; dot: string; items: readonly QA[] }[] }) {
  return (
    <div className="space-y-10 lg:space-y-0">
      {groups.map((g) => (
        <div key={g.label} className="reveal grid gap-4 lg:grid-cols-12 lg:gap-x-8 lg:border-t lg:border-border lg:pb-10 lg:pt-6">
          <p className="sticky top-16 z-10 m-0 flex h-8 w-fit items-center gap-2 rounded-full bg-background/90 pr-3 text-caption font-[510] text-foreground lg:static lg:col-span-3 lg:h-auto lg:items-start lg:bg-transparent">
            <span aria-hidden="true" className={`size-[7px] shrink-0 rounded-full lg:mt-1.5 ${g.dot}`} />
            {g.label}
          </p>
          {/* Side by side, each question and answer are two rows of one
              subgrid, so a question that wraps moves its neighbour's answer
              down with its own and both answers start on one line. */}
          <ul role="list" className="m-0 grid list-none gap-x-10 gap-y-6 p-0 md:grid-cols-2 md:gap-y-0 lg:col-span-9">
            {g.items.map((f, i) => (
              <li key={f.id ?? (typeof f.q === "string" ? f.q : i)} id={f.id} className="border-t border-border pt-4 md:row-span-2 md:grid md:grid-rows-subgrid md:gap-y-0 lg:border-0 lg:pt-0">
                <h3 className="font-sans text-body font-[590] text-foreground">{f.q}</h3>
                <p className="mt-2 text-small text-muted-foreground sm:text-body">{f.a}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

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
          <h3 className="font-sans text-body font-[590] text-foreground">{f.q}</h3>
          <p className="mt-2 max-w-prose text-small text-muted-foreground sm:text-body">{f.a}</p>
        </li>
      ))}
    </ul>
  );
}
