import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { FREE_SEATS } from "@/lib/freePlan";
import { cloudBuyHref } from "@/lib/paymentTerms";
import { currencyNote, fmtINR, usdEstimate, type Pricing } from "@/lib/pricing";
import { site } from "@/lib/site";

/**
 * Free, a licence, or Cloud: three columns under one hairline frame, rupees
 * first. The rupee amount is the price because it is what is charged; the
 * dollar line under it is an estimate at today's rate. Every figure comes from
 * the backend's /onecamp/pricing, never from this file.
 *
 * NO TRIALS AND NO REFUNDS is said here, before anyone reaches a form, and
 * framed as what it is: the reason the demo and the free plan exist.
 */
export function PlanColumns({ pricing, headingLevel = "h3" }: { pricing: Pricing; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  const plans = [
    {
      name: "Free",
      price: fmtINR(0),
      per: "",
      estimate: "",
      body: `Everything a team uses, for up to ${FREE_SEATS} people on your own server. No card, no email.`,
      cta: <ButtonLink href="/free" variant="ghost" className="w-full">Install free</ButtonLink>,
    },
    {
      name: "Licence",
      price: fmtINR(pricing.lifetime_inr),
      per: "once",
      estimate: usdEstimate(pricing.lifetime_usd),
      body: "Unlimited people on your server, for good. Single sign-on, SCIM and audit export included.",
      cta: <ButtonLink href="/buy" variant="brand" className="w-full">Buy a licence</ButtonLink>,
    },
    {
      name: "Cloud",
      price: fmtINR(pricing.cloud_inr),
      per: "a month",
      estimate: usdEstimate(pricing.cloud_usd),
      body: `We run it for you on a server of your own, for up to ${pricing.cloud_seats} people. Includes a self-host licence.`,
      cta: <ButtonLink href={cloudBuyHref("monthly")} variant="ghost" className="w-full">Choose Cloud</ButtonLink>,
    },
  ];

  return (
    <div>
      <div className="grid overflow-hidden rounded-lg border border-border bg-card md:grid-cols-3">
        {plans.map((p, i) => (
          <div key={p.name} className={`flex flex-col p-6 sm:p-8 ${i > 0 ? "border-t border-border md:border-l md:border-t-0" : ""}`}>
            <H className="font-sans text-small font-medium tracking-normal text-muted-foreground">{p.name}</H>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-h2 font-semibold text-foreground">{p.price}</span>
              {p.per && <span className="text-small text-muted-foreground">{p.per}</span>}
            </p>
            <p className="mt-2 min-h-5 text-caption text-muted-foreground">{p.estimate}</p>
            <p className="mt-4 flex-1 text-small text-muted-foreground">{p.body}</p>
            <div className="mt-6">{p.cta}</div>
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
