import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateView } from "@/components/site/TemplateView";
import { landingMetadata } from "@/lib/landingMetadata";
import { taskCount, templateBySlug, templates } from "@/lib/templates";

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const t = templateBySlug((await params).slug);
  if (!t) return {};
  return landingMetadata(
    {
      seoTitle: `${t.name} template: a free project plan with ${taskCount(t)} tasks`,
      seoDescription: `${t.description} Every task with what done looks like and its date. Use it free in OneCamp.`,
    },
    `/templates/${t.id}`,
  );
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const t = templateBySlug((await params).slug);
  if (!t) notFound();
  return <TemplateView t={t} />;
}
