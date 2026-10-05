import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AudienceView } from "@/components/site/AudienceView";
import { audienceBySlug, audiences } from "@/lib/audiences";
import { landingMetadata } from "@/lib/landingMetadata";
import { getPricing } from "@/lib/pricing";

export function generateStaticParams() {
  return audiences.map((a) => ({ audience: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ audience: string }> }): Promise<Metadata> {
  const a = audienceBySlug((await params).audience);
  return a ? landingMetadata(a, `/for/${a.slug}`) : {};
}

export default async function AudiencePage({ params }: { params: Promise<{ audience: string }> }) {
  const a = audienceBySlug((await params).audience);
  if (!a) notFound();
  return <AudienceView a={a} pricing={await getPricing()} />;
}
