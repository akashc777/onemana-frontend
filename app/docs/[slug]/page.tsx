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
      <section className="border-b border-border pt-14 sm:pt-16">
        <div className="container-x pb-6">
          {doc.category && <p className="text-sm font-medium text-brand">{doc.category}</p>}
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{doc.title}</h1>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <DocsShell groups={groups} activeSlug={doc.slug}>
        <div
          className="prose prose-lg max-w-none
            prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:text-foreground
            prose-a:text-brand prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted
            prose-blockquote:border-l-brand prose-blockquote:text-muted-foreground
            prose-img:rounded-xl prose-img:border prose-img:border-border
            prose-table:overflow-hidden prose-th:text-foreground"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </DocsShell>
    </>
  );
}