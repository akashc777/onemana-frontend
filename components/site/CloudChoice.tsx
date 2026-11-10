"use client";

import { useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { PlanPrice } from "@/components/site/PlanPrice";
import type { Pricing } from "@/lib/pricing";
import { CLOUD_CHOICE_GROUP, PLAN } from "@/lib/plans";

/** One Cloud size, every figure worked out on the server from /onecamp/pricing. */
export interface CloudOption {
  id: string;
  /** The glossary's name (lib/plans CLOUD_CHOICE), and what the choice adds under it (lib/paymentTerms choiceLabel). */
  name: string;
  detail: string;
  /** The rupee price, and what it is for. */
  inr: number;
  cadence: "/mo" | "/yr";
  /** Rupees a person a month (lib/paymentTerms choicePerPerson). */
  perPerson: number;
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
  areas,
  list,
  gets,
}: {
  options: CloudOption[];
  title: ReactNode;
  pricing: Pricing;
  body: string;
  /** What the plan holds, under its line (AreaRow). */
  areas?: ReactNode;
  list: ReactNode;
  gets: ReactNode;
}) {
  const [id, setId] = useState(options[0]!.id);
  const at = Math.max(0, options.findIndex((opt) => opt.id === id));
  const o = options[at]!;
  const n = options.length;

  // One Tab stop; the arrows (all four), Home and End move and choose
  // (components/ui/Segmented). Each segment takes the accent's tint under the
  // pointer; the chosen one's knob is the thumb that slides under it.
  const control = (
    <Segmented
      label={CLOUD_CHOICE_GROUP}
      options={options.map((opt) => opt.id)}
      value={o.id}
      onChange={setId}
      thumb
      className={`relative mt-3 grid rounded-md bg-muted p-0.5 ring-1 ring-inset ring-border ${n === 3 ? "grid-cols-3" : n === 2 ? "grid-cols-2" : "grid-cols-1"}`}
      itemClass="relative z-10 flex min-h-11 flex-col items-center justify-center rounded-[6px] px-1 text-[12px] font-[510] leading-4 text-muted-foreground sm:min-h-8"
      option={(value) => {
        const opt = options.find((x) => x.id === value)!;
        return (
          <>
            <span>{opt.name}</span>
            <span className="text-[11px] font-normal leading-3">{opt.detail}</span>
          </>
        );
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0.5 left-0.5 top-0.5 rounded-[6px] bg-card shadow-e1 transition-transform duration-pop ease-out"
        style={{ width: `calc((100% - 4px) / ${n})`, transform: `translateX(${at * 100}%)` }}
      />
    </Segmented>
  );

  // The rows are the card's subgrid rows (the name, the price with its
  // lines, who it is for...). The switch sits under the price it changes, in
  // the price's row: at the top of the card it made the name's row tall, and
  // the Free and Licence cards beside it opened an empty band under their
  // names (design/site-polish/AUDIT.md, L2). The price is said aloud when it
  // changes; the switch keeps its focus (it is outside the price's fade).
  return (
    <>
      <div>{title}</div>
      <PlanPrice pricing={pricing} inr={o.inr} cadence={o.cadence} perPerson={o.perPerson} live className="mt-5">
        {control}
      </PlanPrice>
      <p className="mt-4 text-small font-[510] text-foreground">{o.fits}</p>
      <div className="mt-1.5 flex flex-col">
        <p className="m-0 text-small text-muted-foreground">{body}</p>
        {areas}
      </div>
      {list}
      {gets}
      <div className="pt-5">
        <ButtonLink href={o.href} variant="ghost" size="lg" className="w-full">
          {PLAN.cloud.cta}
        </ButtonLink>
      </div>
    </>
  );
}
