/**
 * A question and its answer, as a plain disclosure under a hairline.
 *
 * No card, no tinted chevron chip, no animated height: the list reads as a
 * list, and the native <details> element does the opening without a script.
 */
export function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-border">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-body font-medium text-foreground [&::-webkit-details-marker]:hidden">
        {q}
        <svg
          className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-45"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </summary>
      <p className="max-w-prose pb-5 text-body text-muted-foreground">{a}</p>
    </details>
  );
}
