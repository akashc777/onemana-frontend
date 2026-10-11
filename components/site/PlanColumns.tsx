import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { PLAN_HUE } from "@/components/site/planHues";
import { PlanBenefit } from "@/components/site/PlanCard";
import { CloudChoice, type CloudOption } from "@/components/site/CloudChoice";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { Rings } from "@/components/ui/graphics/motifs";
import { Dot } from "@/components/ui/v3";
import type { CampHue } from "@/lib/campHue";
import { FREE_SEATS, freeIncludes } from "@/lib/freePlan";
import { choicePrice, cloudBuyHref, cloudChoices, yearlySaving } from "@/lib/paymentTerms";
import { fmtINR, type Pricing } from "@/lib/pricing";
import { cloudBenefits, lifetimeBenefits, planHighlights } from "@/lib/content";
import { site } from "@/lib/site";
import { PriceLines, PricesFootnote, TaxText } from "@/components/site/RegionalMoney";

/** The pill on the free plan (D8): where most teams begin, not a popularity claim. */
export const FREE_PILL = "Most teams start here";

/**
 * Free, a licence, or Cloud (site.md H9 and P2): three neutral cards, the
 * plan's identity as a dot (moss, sun, sky, the same hue wherever the plan
 * appears), rupees first. The rupee amount is the price because it is what
 * is charged; the line under it is an estimate in the reader's currency at
 * today's rate, in a block that never changes height. Every figure comes
 * from the backend's /onecamp/pricing, never from this file.
 *
 * The licence is lifted (e3 and a brand ring at 45%) with no words claiming
 * popularity; Free carries "Most teams start here". The parts of the three
 * cards share a subgrid, so every row lines up whatever wraps.
 *
 * NO TRIALS AND NO REFUNDS is said under the cards, before anyone reaches a
 * form, framed as what it is: the reason the demo and the free plan exist.
 *
 * `detailed` (/pricing): each card's full list, and Cloud's sizes as a
 * segmented control at the top of its card.
 */
export function PlanColumns({
  pricing,
  headingLevel = "h3",
  detailed = false,
}: {
  pricing: Pricing;
  headingLevel?: "h2" | "h3";
  detailed?: boolean;
}) {
  const H = headingLevel;
  const saving = yearlySaving(pricing);
  const cloudOptions: CloudOption[] = cloudChoices(pricing).map((b) => {
    const c = choicePrice(b, pricing);
    return {
      id: b,
      label: b === "monthly" ? "Team monthly" : b === "yearly" ? "Team yearly" : "Business",
      short: b === "monthly" ? "Monthly" : b === "yearly" ? "Yearly" : "Business",
      hint: b === "yearly" ? saving : "",
      price: fmtINR(c.inr),
      per: c.per === "/yr" ? "a year" : "a month",
      inr: c.inr,
      fits: b === "business" ? `Up to ${pricing.business_seats} people, run by us` : `Up to ${pricing.cloud_seats} people, run by us`,
      href: cloudBuyHref(b),
    };
  });
  const monthly = cloudOptions[0]!;

  const cards: Card[] = [
    {
      key: "free",
      name: "Free",
      hue: PLAN_HUE.free,
      pill: FREE_PILL,
      price: <PriceFigure price="Free" />,
      lines: <PriceLines pricing={pricing} inr={0} free="No card, no email" />,
      fits: `Up to ${FREE_SEATS} people`,
      body: "Everything a team uses, on your own server. No card, no email.",
      list: detailed ? freeIncludes.slice(1, 5) : planHighlights.free,
      gets: "a free key and one install command",
      cta: (
        <ButtonLink href="/free" variant="ghost" size="lg" className="w-full">
          Install free
        </ButtonLink>
      ),
    },
    {
      key: "lifetime",
      name: "Licence",
      hue: PLAN_HUE.lifetime,
      lifted: true,
      price: <PriceFigure price={fmtINR(pricing.lifetime_inr)} per="once" />,
      lines: <PriceLines pricing={pricing} inr={pricing.lifetime_inr} />,
      fits: "Any number of people",
      body: "Everyone on your server, for good. Single sign-on, SCIM and audit export included.",
      list: detailed ? lifetimeBenefits : planHighlights.lifetime,
      gets: (
        <>
          a key by email, with <TaxText kind="invoice" />
        </>
      ),
      cta: (
        <ButtonLink href="/buy" variant="brand" size="lg" className="w-full">
          Buy a licence
        </ButtonLink>
      ),
    },
    {
      key: "cloud",
      name: "Cloud",
      hue: PLAN_HUE.cloud,
      price: <PriceFigure price={monthly.price} per={monthly.per} />,
      lines: <PriceLines pricing={pricing} inr={monthly.inr} />,
      fits: monthly.fits,
      body: "Your own server, which we set up, update and back up. A self-host licence is included.",
      list: detailed ? cloudBenefits : planHighlights.cloud,
      gets: "an address on onemana.dev, or your own domain",
      cta: (
        <ButtonLink href={monthly.href} variant="ghost" size="lg" className="w-full">
          Choose Cloud
        </ButtonLink>
      ),
    },
  ];

  return (
    <div>
      {/* Three across from lg; at a tablet's width two and one, the third
          centred under them (three 230px cards were too narrow to read).
          Side by side, the cards share one subgrid of eight rows (the name,
          the price, its two lines, who it is for, what it is, the list, what
          you get, the button), so each row lines up across the three. Stacked
          on a phone, each card is a plain column, Free first. */}
      <div className="grid gap-6 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-y-0">
        {cards.map((c) => (
          <div
            key={c.key}
            data-plan={c.key}
            className={`${HUE_CLASS[c.hue]} reveal group relative isolate flex flex-col overflow-hidden rounded-2xl bg-card p-6 lift-2 ${c.lifted ? "lift-move shadow-e3 ring-1 ring-brand/45 hover:ring-brand/55" : "lift shadow-e1"} lg:row-span-8 lg:grid lg:grid-rows-subgrid lg:gap-y-0 ${c.key === "cloud" ? "md:col-span-2 md:mx-auto md:w-[calc(50%-8px)] lg:col-span-1 lg:mx-0 lg:w-auto" : ""}`}
          >
            {c.lifted && (
              <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 -z-10 opacity-60 transition-transform duration-page ease-out group-hover:rotate-[8deg]">
                <Rings size={170} hue="sun" count={2} core={false} className="opacity-50" />
              </span>
            )}
            {c.key === "cloud" && detailed && cloudOptions.length > 1 ? (
              <CloudChoice options={cloudOptions} title={<CardName H={H} hue={c.hue} name={c.name} />} pricing={pricing} body={c.body} list={<BenefitList items={c.list} />} gets={<Gets>{c.gets}</Gets>} />
            ) : (
              <>
                <div className="flex items-center justify-between gap-3 self-start">
                  <CardName H={H} hue={c.hue} name={c.name} />
                  {c.pill && <span className="rounded-full bg-camp-moss-tint px-2 text-[12px] font-[510] leading-[22px] text-camp-moss-ink">{c.pill}</span>}
                </div>
                <div className="mt-5">{c.price}</div>
                <div className="mt-1.5">{c.lines}</div>
                <p className="mt-4 text-small font-[510] text-foreground">{c.fits}</p>
                <p className="mt-1.5 text-small text-muted-foreground">{c.body}</p>
                <BenefitList items={c.list} />
                <Gets>{c.gets}</Gets>
                <div className="pt-5">{c.cta}</div>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="mt-8 flex items-start gap-2.5 text-body text-foreground sm:items-center">
        <Dot hue="ink" size={7} className="mt-2 sm:mt-0" />
        <span>
          No trials or refunds: try the{" "}
          <a href={site.demoStartUrl} target="_blank" rel="noreferrer" className="link">
            live demo
          </a>{" "}
          and the{" "}
          <Link href="/free" className="link">
            free plan
          </Link>{" "}
          first.
        </span>
      </p>
      <p className="mt-2 pl-[17px] text-small text-muted-foreground">
        <PricesFootnote />
      </p>
    </div>
  );
}

interface Card {
  key: "free" | "lifetime" | "cloud";
  name: string;
  hue: CampHue;
  pill?: string;
  lifted?: boolean;
  price: ReactNode;
  lines: ReactNode;
  fits: string;
  body: string;
  list: readonly string[];
  gets: ReactNode;
  cta: ReactNode;
}

function CardName({ H, hue, name }: { H: "h2" | "h3"; hue: CampHue; name: string }) {
  return (
    <H className="flex items-center gap-2 font-sans text-body font-[590] tracking-normal text-foreground">
      <Dot hue={hue} />
      {name}
    </H>
  );
}

/** The price in the price step (44/48, tabular), with "once" or "a month" on its baseline. */
export function PriceFigure({ price, per }: { price: string; per?: string }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="font-display text-price tabular-nums text-foreground">{price}</span>
      {per && <span className="text-body text-muted-foreground">{per}</span>}
    </p>
  );
}

function BenefitList({ items }: { items: readonly string[] }) {
  return (
    <ul className="m-0 mt-5 list-none space-y-2.5 border-t border-border p-0 pt-5 text-small text-foreground">
      {items.map((b) => (
        <PlanBenefit key={b}>{b}</PlanBenefit>
      ))}
    </ul>
  );
}

function Gets({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 self-end text-caption text-foreground">
      <span className="text-muted-foreground">You get: </span>
      <span className="font-[510]">{children}</span>
    </p>
  );
}
