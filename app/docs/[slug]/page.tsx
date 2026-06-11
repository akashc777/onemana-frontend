import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDoc, listPublishedDocs, groupDocs } from "@/lib/docs";
import { renderMarkdown } from "@/lib/markdown";
import { site } from "@/lib/site";
import { DocsShell } from "@/components/docs/DocsShell";

export const revalidate = 120;

export async function generateStaticParams() {
  try {
    const docs = await listPublishedDocs();
    return docs.map((d) => ({ slug: d.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const doc = await getDoc(params.slug);
  if (!doc) return { title: "Doc not found" };
  const title = doc.seo_title || `${doc.title} - OneCamp docs`;
  const description = doc.seo_desc || `OneCamp documentation: ${doc.title}.`;
  const url = `${site.url}/docs/${doc.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
  };
}

export default async function DocPage({ params }: { params: { slug: string } }) {
  const [doc, all] = await Promise.all([getDoc(params.slug), listPublishedDocs()]);
  if (!doc) notFound();

  const groups = groupDocs(all);
  const html = renderMarkdown(doc.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: doc.title,
    datePublished: doc.published_at ?? doc.created_at,
    dateModified: doc.updated_at,
    author: { "@type": "Organization", name: site.company },
    publisher: { "@type": "Organization", name: site.company },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}/docs/${doc.slug}` },
  };

  return (
    <>
      <section className="border-b border-white/5 pt-16 sm:pt-20">
        <div className="container-x pb-8">
          {doc.category && <p className="text-sm font-medium text-brand-light">{doc.category}</p>}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">{doc.title}</h1>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <DocsShell groups={groups} activeSlug={doc.slug}>
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:text-white
            prose-a:text-brand-light prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-code:text-accent-cyan
            prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-canvas-soft
            prose-blockquote:border-l-brand prose-blockquote:text-slate-300
            prose-img:rounded-xl prose-img:border prose-img:border-white/10
            prose-table:overflow-hidden prose-th:text-white"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </DocsShell>
    </>
  );
}
