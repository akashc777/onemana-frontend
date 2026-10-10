import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { PlanColumns } from "@/components/site/PlanColumns";
import { CloudPlanCard } from "@/components/site/CloudPlanCard";
import { PlanComparison } from "@/components/site/PlanComparison";
import { QuestionList } from "@/components/site/marketing";
import { SectionHeading } from "@/components/ui/Section";
import { lifetimeBenefits } from "@/lib/content";
import { FREE_SEATS } from "@/lib/freePlan";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { currencyNote, fmtINR, getPricing } from "@/lib/pricing";
import { site } from "@/lib/site";

export const revalidate = 300;

// Worked out from live pricing, never typed: link previews are often the first
// price somebody sees, and a fixed number there outlives the price.
export async function generateMetadata(): Promise<Metadata> {
  const p = await getPricing();
  const description = `Free for up to ${FREE_SEATS} people. A licence for ${fmtINR(p.lifetime_inr)} once for unlimited people on your server, or OneCamp Cloud from ${fmtINR(p.cloud_inr)} a month.`;
  return {
    title: "Pricing",
    description,
    alternates: { canonical: "/pricing" },
    openGraph: { title: `${site.name} pricing`, description, url: `${site.url}/pricing`, type: "website", images: defaultOgImages },
    twitter: { card: "summary_large_image", title: `${site.name} pricing`, description, images: defaultTwitterImages },
  };
}

/**
 * Pricing, as a page of its own. It used to redirect to the bottom of a
 * 12,700 px home page. Three ways to have OneCamp, then each paid one in
 * detail, then the table from /buy that compares all four on what differs.
 * Every amount comes from /onecamp/pricing; rupees are the price and dollars
 * an estimate. Nothing here offers a trial or a refund: the demo and the free
 * plan are how somebody tries it.
 */
export default async function PricingPage() {
  const pricing = await getPricing();
  const questions = [
    {
      q: "Is there a free trial, or a refund?",
      a: `Neither. The live demo is the real product with sample data, and the free plan runs the same app on your own server for up to ${FREE_SEATS} people for as long as you like. Try both before you pay.`,
    },
    {
      q: "What happens when we pass the free plan's limit?",
      a: "Buy a licence and re-run the install with the key from your purchase email. The workspace you already run keeps its data and carries on.",
    },
    {
      q: "Which currency am I charged in?",
      // Built from the same charge_usd switch /buy reads, so the two pages cannot disagree.
      a: currencyNote(pricing),
    },
    {
      q: "Do prices include GST?",
      a: "Yes. The price you see is the price you pay, and the GST invoice splits the tax out of it.",
    },
  ];

  return (
    <>
      <PageHeader
        title="Pricing"
        subtitle={`Free for up to ${FREE_SEATS} people. Pay once for a licence when you grow, or let us run it for you.`}
      />

      <section className="pb-20 sm:pb-24">
        <div className="container-x">
          <PlanColumns pricing={pricing} headingLevel="h2" />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-x grid gap-12 pb-24 pt-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              title="The licence"
              subtitle={`${fmtINR(pricing.lifetime_inr)} once, for any number of people on your own server.`}
            />
            <ul className="mt-6 grid gap-x-8 gap-y-3 border-t border-border pt-5 sm:grid-cols-2">
              {lifetimeBenefits.map((b) => (
                <li key={b} className="text-small text-foreground">
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-small text-muted-foreground">
              Ready?{" "}
              <Link href="/buy" className="link">
                Buy a licence
              </Link>
              . The key and a GST invoice arrive by email straight away.
            </p>
          </div>
          <div>
            <SectionHeading title="OneCamp Cloud" subtitle="We install, update and back it up, on a server that is yours alone." className="mb-6" />
            <CloudPlanCard pricing={pricing} />
          </div>
        </div>
      </section>

      <div className="border-t border-border">
        <PlanComparison pricing={pricing} />
      </div>

      <section className="border-t border-border">
        <div className="container-x grid gap-8 pb-24 pt-20 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-4">
            <SectionHeading title="About paying" />
          </div>
          <QuestionList items={questions} className="lg:col-span-8" />
        </div>
      </section>
    </>
  );
}
