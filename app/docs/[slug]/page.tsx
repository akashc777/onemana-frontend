import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoc, listPublishedDocs, groupDocs, docNeighbours } from "@/lib/docs";
import { renderMarkdown } from "@/lib/markdown";
import { enhanceArticle, TOC_MIN_HEADINGS } from "@/lib/article";
import { jsonLdScript } from "@/lib/jsonLd";
import { formatDay } from "@/lib/format";
import { site } from "@/lib/site";
import { DocsPager, DocsShell } from "@/components/docs/DocsShell";
import { Prose } from "@/components/reading/Prose";
import { OnThisPage } from "@/components/reading/OnThisPage";
import { OnThisPageDisclosure } from "@/components/reading/OnThisPageDisclosure";

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
  // Share image is the dynamic title card from app/docs/[slug]/opengraph-image.tsx.
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function DocPage({ params }: { params: { slug: string } }) {
  const [doc, all] = await Promise.all([getDoc(params.slug), listPublishedDocs()]);
  if (!doc) notFound();

  const groups = groupDocs(all);
  const { html, headings } = enhanceArticle(renderMarkdown(doc.content));
  const toc = headings.length >= TOC_MIN_HEADINGS ? headings : [];
  const { prev, next } = docNeighbours(groups, doc.slug);
  const updated = doc.updated_at || doc.published_at || doc.created_at;

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      <DocsShell groups={groups} activeSlug={doc.slug} aside={toc.length ? <OnThisPage headings={toc} /> : null}>
        <header className="max-w-[36rem]">
          <nav aria-label="Breadcrumb" className="text-caption text-muted-foreground">
            <Link href="/docs" className="tap-target transition-colors duration-150 hover:text-foreground">
              Docs
            </Link>
            {doc.category.trim() && (
              <>
                <span aria-hidden className="mx-1.5 text-faint">
                  /
                </span>
                <span>{doc.category.trim()}</span>
              </>
            )}
          </nav>
          <h1 className="mt-3 text-title-sm text-foreground sm:text-title">
            {doc.title}
          </h1>
          {updated && (
            <p className="mt-3 text-caption text-muted-foreground">
              Updated <time dateTime={updated}>{formatDay(updated)}</time>
            </p>
          )}
        </header>

        {toc.length ? <OnThisPageDisclosure headings={toc} className="mt-6 max-w-[36rem] xl:hidden" /> : null}

        <Prose html={html} kind="docs" className="mt-8" />

        <DocsPager prev={prev} next={next} />

        <p className="mt-10 max-w-[36rem] text-small text-muted-foreground">
          Something missing or wrong in this guide? Write to{" "}
          <a href="mailto:support@onemana.dev" className="link">
            support@onemana.dev
          </a>
          .
        </p>
      </DocsShell>
    </>
  );
}
