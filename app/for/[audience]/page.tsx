import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AudienceView } from "@/components/site/AudienceView";
import { audienceBySlug, audiences } from "@/lib/audiences";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { getPricing } from "@/lib/pricing";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return audiences.map((a) => ({ audience: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ audience: string }> }): Promise<Metadata> {
  const a = audienceBySlug((await params).audience);
  if (!a) return {};
  return {
    title: a.seoTitle,
    description: a.seoDescription,
    alternates: { canonical: `/for/${a.slug}` },
    openGraph: { title: a.seoTitle, description: a.seoDescription, url: `${site.url}/for/${a.slug}`, type: "website", images: defaultOgImages },
    twitter: { card: "summary_large_image", title: a.seoTitle, description: a.seoDescription, images: defaultTwitterImages },
  };
}

export default async function AudiencePage({ params }: { params: Promise<{ audience: string }> }) {
  const a = audienceBySlug((await params).audience);
  if (!a) notFound();
  return <AudienceView a={a} pricing={await getPricing()} />;
}
