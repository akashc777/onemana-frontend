import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { CloudGlyph, KeyGlyph, PeopleGlyph } from "@/components/site/Glyphs";
import { PLAN_HUE } from "@/components/site/planHues";
import type { CampHue } from "@/lib/campHue";
import { FREE_SEATS } from "@/lib/freePlan";
import { cloudBuyHref } from "@/lib/paymentTerms";
import { currencyNote, fmtINR, usdEstimate, type Pricing } from "@/lib/pricing";
import { site } from "@/lib/site";

interface Plan {
  name: string;
  hue: CampHue;
  Glyph: ComponentType<SVGProps<SVGSVGElement>>;
  /** Who it is for, in the header beside the name. */
  fits: string;
  price: string;
  per: string;
  estimate: string;
  body: string;
  /** What arrives when you choose it: the concrete thing, not a feature list. */
  gets: string;
  cta: React.ReactNode;
}

/**
 * Free, a licence, or Cloud: three cards, rupees first. The rupee amount is
 * the price because it is what is charged; the dollar line under it is an
 * estimate at today's rate. Every figure comes from the backend's
 * /onecamp/pricing, never from this file.
 *
 * WHAT MAKES THEM OURS. Three equal columns with a big number and a button was
 * the pricing table of every template. Each plan now has its camp hue (moss
 * for free, sun for the licence, sky for Cloud, the same wherever the plan
 * appears) in a tinted header that says who it is for, and each says what
 * actually arrives: a key and one command, a key and a GST invoice, or an
 * address on onemana.dev. The buttons sit on one line across the cards.
 *
 * NO TRIALS AND NO REFUNDS is said here, before anyone reaches a form, and
 * framed as what it is: the reason the demo and the free plan exist.
 */
export function PlanColumns({ pricing, headingLevel = "h3" }: { pricing: Pricing; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const plans: Plan[] = [
    {
      name: "Free",
      hue: PLAN_HUE.free,
      Glyph: PeopleGlyph,
      fits: `Up to ${FREE_SEATS} people`,
      price: fmtINR(0),
      per: "",
      estimate: "",
      body: "Everything a team uses, on your own server. No card, no email.",
      gets: "A free key and one install command",
      cta: (
        <ButtonLink href="/free" variant="ghost" className="w-full">
          Install free
        </ButtonLink>
      ),
    },
    {
      name: "Licence",
      hue: PLAN_HUE.lifetime,
      Glyph: KeyGlyph,
      fits: "Any number of people",
      price: fmtINR(pricing.lifetime_inr),
      per: "once",
      estimate: usdEstimate(pricing.lifetime_usd),
      body: "Everyone on your server, for good. Single sign-on, SCIM and audit export included.",
      gets: "A key by email, with a GST invoice",
      cta: (
        <ButtonLink href="/buy" variant="brand" className="w-full">
          Buy a licence
        </ButtonLink>
      ),
    },
    {
      name: "Cloud",
      hue: PLAN_HUE.cloud,
      Glyph: CloudGlyph,
      fits: `Up to ${pricing.cloud_seats} people, run by us`,
      price: fmtINR(pricing.cloud_inr),
      per: "a month",
      estimate: usdEstimate(pricing.cloud_usd),
      body: "Your own server, which we set up, update and back up. A self-host licence is included.",
      gets: "An address on onemana.dev, or your own domain",
      cta: (
        <ButtonLink href={cloudBuyHref("monthly")} variant="ghost" className="w-full">
          Choose Cloud
        </ButtonLink>
      ),
    },
  ];

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className={`${HUE_CLASS[p.hue]} flex flex-col overflow-hidden rounded-lg border border-border bg-card`}>
            <div className="flex items-center gap-2.5 bg-hue-tint px-6 py-3.5">
              <p.Glyph className="size-5 shrink-0 text-hue" />
              <H className="font-sans text-small font-semibold tracking-normal text-hue-ink">{p.name}</H>
              <span className="ml-auto text-right text-caption text-hue-ink">{p.fits}</span>
            </div>
            <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-h2 font-semibold tabular-nums text-foreground">{p.price}</span>
                {p.per && <span className="text-small text-muted-foreground">{p.per}</span>}
              </p>
              <p className="mt-1 min-h-5 text-caption text-muted-foreground">{p.estimate}</p>
              <p className="mt-4 text-small text-muted-foreground">{p.body}</p>
              <p className="mt-4 flex-1 border-t border-border pt-4 text-small text-foreground">
                <span className="text-muted-foreground">You get: </span>
                {p.gets}
              </p>
              <div className="mt-6">{p.cta}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-body text-foreground">
        No trials or refunds: try the{" "}
        <a href={site.demoStartUrl} target="_blank" rel="noreferrer" className="link">
          live demo
        </a>{" "}
        and the{" "}
        <Link href="/free" className="link">
          free plan
        </Link>{" "}
        first.
      </p>
      <p className="mt-2 text-caption text-muted-foreground">
        Prices include GST. {currencyNote(pricing)}
      </p>
    </div>
  );
}
