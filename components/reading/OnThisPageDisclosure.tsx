import type { ArticleHeading } from "@/lib/article";

/**
 * "On this page" where there is no room beside the article: a disclosure
 * above it, closed until asked for. No script: it is a <details>.
 */
export function OnThisPageDisclosure({ headings, className = "" }: { headings: ArticleHeading[]; className?: string }) {
  return (
    <details className={`group border-y border-border ${className}`}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-small font-medium text-foreground [&::-webkit-details-marker]:hidden">
        On this page
        <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-180">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <ul className="pb-3 text-small">
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className={`flex min-h-11 items-center py-1.5 text-muted-foreground hover:text-foreground ${h.level === 3 ? "pl-4" : ""}`}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
