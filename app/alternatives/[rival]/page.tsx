import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AudienceView } from "@/components/site/AudienceView";
import { alternativeBySlug, alternatives } from "@/lib/alternatives";
import { landingMetadata } from "@/lib/landingMetadata";
import { getPricing } from "@/lib/pricing";

// "OneCamp as an alternative to X", one page per rival, from lib/alternatives.
export function generateStaticParams() {
  return alternatives.map((a) => ({ rival: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ rival: string }> }): Promise<Metadata> {
  const a = alternativeBySlug((await params).rival);
  return a ? landingMetadata(a, `/alternatives/${a.slug}`) : {};
}

export default async function AlternativePage({ params }: { params: Promise<{ rival: string }> }) {
  const a = alternativeBySlug((await params).rival);
  if (!a) notFound();
  return <AudienceView a={a} pricing={await getPricing()} />;
}
