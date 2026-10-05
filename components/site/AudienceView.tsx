import { PageHeader } from "@/components/site/PageHeader";
import { FeatureIcon } from "@/components/site/FeatureIcons";
import { FaqItem } from "@/components/site/marketing";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { FREE_SEATS } from "@/lib/freePlan";
import { dual, fmtINR, type Pricing } from "@/lib/pricing";
import type { Audience } from "@/lib/audiences";

/** One page for one kind of buyer: what fits them, the price, and where to go next. */
export function AudienceView({ a, pricing }: { a: Audience; pricing: Pricing }) {
  const lifetime = a.prices === "inr" ? fmtINR(pricing.lifetime_inr) : dual(pricing.lifetime_usd, pricing.lifetime_inr);
  const cloud =
    a.prices === "inr" ? `${fmtINR(pricing.cloud_inr)} a month` : dual(pricing.cloud_usd, pricing.cloud_inr, " a month");
  return (
    <>
      <PageHeader eyebrow={a.eyebrow} title={a.title} subtitle={a.subtitle} align="left" className="!pb-0" />

      <section className="pb-14 pt-8 sm:pb-16">
        <div className="container-x">
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={site.demoStartUrl} external variant="brandPremium" size="lg">Try the live demo</ButtonLink>
            <ButtonLink href="/free" variant="ghost" size="lg">Start free, up to {FREE_SEATS} people</ButtonLink>
          </div>

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {a.points.map((p) => (
              <li key={p.title} className="card border border-border">
                <span aria-hidden className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
                  <FeatureIcon icon={p.icon} className="!h-5 !w-5" />
                </span>
                <h2 className="mt-3 text-base font-semibold text-foreground">{p.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </li>
            ))}
          </ul>

          <div className="mt-12 grid gap-4 rounded-xl border border-border p-6 sm:grid-cols-3 sm:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Own it</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{lifetime} once</p>
              <p className="text-sm text-muted-foreground">Everyone on your server, for good.</p>
            </div>
            {pricing.cloud_configured && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Or we run it</p>
                <p className="mt-1 text-lg font-semibold text-foreground">{cloud}</p>
                <p className="text-sm text-muted-foreground">Cloud, for {pricing.cloud_seats} people.</p>
              </div>
            )}
            <div className="sm:text-right">
              <ButtonLink href="/buy" variant="ghost" size="sm">See plans</ButtonLink>
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-3">{a.priceNote}</p>
          </div>

          <div className="mt-12 grid gap-3">
            <h2 className="text-lg font-semibold text-foreground">Questions</h2>
            {a.faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>

          {a.proof && (
            <p className="mt-8 text-sm text-muted-foreground">
              More detail:{" "}
              <a href={a.proof.href} className="font-medium text-foreground underline underline-offset-4">{a.proof.label}</a>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
