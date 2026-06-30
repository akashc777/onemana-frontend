import { pricingComparison } from "@/lib/content";
import { OneCampLogo } from "@/components/site/BrandMarks";

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/70" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Static cost comparison for the pricing section.
 * Stack convergence is already shown earlier on the page - here we only explain the billing math.
 */
export function PricingComparison() {
  const { typical, onecamp } = pricingComparison;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <article className="rounded-lg border border-border bg-muted/30 p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{typical.eyebrow}</p>
          <h3 className="mt-1 text-base font-semibold text-foreground">{typical.title}</h3>
          <ul className="mt-5 space-y-3.5">
            {typical.rows.map((row) => (
              <li key={row.label} className="flex items-start gap-2.5 text-sm">
                <XIcon />
                <span>
                  <span className="font-medium text-foreground">{row.label}</span>
                  <span className="text-muted-foreground"> · {row.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="premium-frame relative overflow-hidden rounded-lg border-brand/25 bg-gradient-to-b from-brand/[0.04] to-card p-5 dark:from-brand/[0.08] sm:p-6">
          <div className="flex items-center gap-2.5">
            <OneCampLogo className="h-7 w-7 rounded-md" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">{onecamp.eyebrow}</p>
              <h3 className="text-base font-semibold text-foreground">{onecamp.title}</h3>
            </div>
          </div>
          <ul className="mt-5 space-y-3.5">
            {onecamp.rows.map((row) => (
              <li key={row.label} className="flex items-start gap-2.5 text-sm">
                <CheckIcon />
                <span>
                  <span className="font-medium text-foreground">{row.label}</span>
                  <span className="text-muted-foreground"> · {row.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}