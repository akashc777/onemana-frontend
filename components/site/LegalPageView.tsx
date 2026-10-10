import { notFound } from "next/navigation";
import { legalPages } from "@/lib/legalPages";
import { enhanceArticle, TOC_MIN_HEADINGS } from "@/lib/article";
import { formatDay } from "@/lib/format";
import { Prose } from "@/components/reading/Prose";
import { OnThisPage } from "@/components/reading/OnThisPage";
import { OnThisPageDisclosure } from "@/components/reading/OnThisPageDisclosure";

/**
 * A legal page, read the way every long page is (components/reading): the
 * title, the date it last changed, and the text at the reading measure. Its
 * sections can be linked to (/privacy-policy#your-rights) and, on a page with
 * several, are listed beside it on a wide screen and above it on a narrow one.
 */
export function LegalPageView({ slug }: { slug: string }) {
  const page = legalPages[slug];
  if (!page) notFound();
  const { html, headings } = enhanceArticle(page.bodyHtml);
  const toc = headings.length >= TOC_MIN_HEADINGS ? headings : [];

  return (
    <div className="container-x pb-24 pt-10 sm:pt-16 lg:grid lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] lg:gap-x-16">
      <article className="min-w-0">
        <header>
          <h1 className="text-balance text-title-sm text-foreground sm:text-title">
            {page.title}
          </h1>
          {page.subtitle && <p className="mt-3 text-body-lg text-muted-foreground">{page.subtitle}</p>}
          <p className="mt-4 text-caption text-muted-foreground">
            Last updated <time dateTime={page.updated}>{formatDay(page.updated)}</time>
          </p>
        </header>

        {toc.length ? <OnThisPageDisclosure headings={toc} className="mt-6 lg:hidden" /> : null}

        <Prose html={html} kind="legal" className="mt-8" />

        {page.note && (
          <p className="mt-10 border-t border-border pt-6 text-small text-muted-foreground" dangerouslySetInnerHTML={{ __html: page.note }} />
        )}
      </article>

      {toc.length ? (
        <aside className="hidden lg:block">
          <div className="sticky top-[5.5rem] max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain pb-10 pt-1.5">
            <OnThisPage headings={toc} />
          </div>
        </aside>
      ) : null}
    </div>
  );
}
