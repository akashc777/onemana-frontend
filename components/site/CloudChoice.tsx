"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { PriceLines } from "@/components/site/RegionalMoney";
import type { Pricing } from "@/lib/pricing";

/** One Cloud size, every figure worked out on the server from /onecamp/pricing. */
export interface CloudOption {
  id: string;
  label: string;
  /** The label on a phone. */
  short: string;
  /** "2 months free", worked out from the prices (cloudYear.ts), or nothing. */
  hint: string;
  price: string;
  per: string;
  inr: number;
  fits: string;
  href: string;
}

/**
 * Cloud's sizes on /pricing (site.md P2): a 3-way segmented control under
 * the Cloud card's price, on a sunken track with the raised thumb sliding
 * under the choice; 44px tall on a phone. It swaps the price (cross-faded in place), the "fits"
 * line and the button's link. Team monthly first. The rows are the card's
 * subgrid rows, so the card still lines up with its neighbours.
 */
export function CloudChoice({
  options,
  title,
  pricing,
  body,
  list,
  gets,
}: {
  options: CloudOption[];
  title: ReactNode;
  pricing: Pricing;
  body: string;
  list: ReactNode;
  gets: ReactNode;
}) {
  const [at, setAt] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const o = options[at]!;
  const n = options.length;

  const onKey = (e: KeyboardEvent) => {
    const to = e.key === "ArrowRight" ? at + 1 : e.key === "ArrowLeft" ? at - 1 : null;
    if (to === null) return;
    e.preventDefault();
    const next = (to + n) % n;
    setAt(next);
    refs.current[next]?.focus();
  };

  const control = (
    <div role="radiogroup" aria-label="Cloud size" onKeyDown={onKey} className="relative mt-3 grid rounded-md bg-muted p-0.5 ring-1 ring-inset ring-border" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0.5 left-0.5 top-0.5 rounded-[6px] bg-card shadow-e1 transition-transform duration-pop ease-out"
        style={{ width: `calc((100% - 4px) / ${n})`, transform: `translateX(${at * 100}%)` }}
      />
      {options.map((opt, i) => (
        <button
          key={opt.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={i === at}
          tabIndex={i === at ? 0 : -1}
          onClick={() => setAt(i)}
          className={`relative z-10 flex min-h-11 flex-col items-center justify-center px-1 text-[12px] font-[510] leading-4 transition-colors sm:min-h-8 ${i === at ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <span className="hidden sm:inline">{opt.label}</span>
          <span className="sm:hidden">{opt.short}</span>
          {opt.hint && <span className="text-[11px] font-normal leading-3 text-camp-moss-ink">{opt.hint}</span>}
        </button>
      ))}
    </div>
  );

  // The rows are the card's subgrid rows (the name, the price, its lines,
  // who it is for...). The switch sits under the price it changes, in the
  // lines' row: at the top of the card it made the name's row tall, and the
  // Free and Licence cards beside it opened an empty band under their names
  // (design/site-polish/AUDIT.md, L2).
  return (
    <>
      <div>{title}</div>
      <div className="mt-5" aria-live="polite">
        <p key={o.id} className="fx-fade flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-price tabular-nums text-foreground">{o.price}</span>
          <span className="text-body text-muted-foreground">{o.per}</span>
        </p>
      </div>
      <div className="mt-1.5">
        <PriceLines pricing={pricing} inr={o.inr} />
        {control}
      </div>
      <p className="mt-4 text-small font-[510] text-foreground">{o.fits}</p>
      <p className="mt-1.5 text-small text-muted-foreground">{body}</p>
      {list}
      {gets}
      <div className="pt-5">
        <ButtonLink href={o.href} variant="ghost" size="lg" className="w-full">
          Choose Cloud
        </ButtonLink>
      </div>
    </>
  );
}
