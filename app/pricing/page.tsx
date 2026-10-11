import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { PlanColumns } from "@/components/site/PlanColumns";
import { PlanComparison } from "@/components/site/PlanComparison";
import { QuestionAccordion } from "@/components/site/marketing";
import { PlanOrbit } from "@/components/ui/graphics/v3marks";
import { TaxQuestion } from "@/components/site/RegionalMoney";
import { Margin, MarginHeading, SECTION_END, Section } from "@/components/ui/Section";
import { FREE_SEATS } from "@/lib/freePlan";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { currencyNote, fmtINR, getPricing } from "@/lib/pricing";
import { whyRupees } from "@/lib/content";
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
 * 12,700 px home page. Three ways to have OneCamp, each with what it includes
 * (one block of prices: the paid plans' matched cards below it said the same
 * prices again), then the table from /buy that compares all four on what
 * differs.
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
    // Every price line links here (#currency). Dollar charges are off; were
    // they switched on, the note built from the same switch /buy reads says so.
    pricing.charge_usd ? { id: whyRupees.id, q: "Which currency am I charged in?", a: currencyNote(pricing) } : whyRupees,
    // GST only for a reader in India; see lib/pricing taxWords.
    { id: "tax", q: <TaxQuestion part="q" />, a: <TaxQuestion part="a" /> },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Free for small teams. Pay once when you grow."
        subtitle={`Free for up to ${FREE_SEATS} people. Pay once for a licence when you grow, or let us run it for you.`}
        art={<PlanOrbit />}
        artOnPhone={false}
      />

      <section className={SECTION_END}>
        <div className="container-x">
          <PlanColumns pricing={pricing} headingLevel="h2" detailed />
        </div>
      </section>

      <PlanComparison pricing={pricing} />

      <Section divider>
        <Margin aside={<MarginHeading title="About paying" />}>
          {/* The trial and refund answer opens first; the rupee answer is a link target (#currency), so it opens too. */}
          <QuestionAccordion items={questions} open={[0, 2]} />
        </Margin>
      </Section>
    </>
  );
}
