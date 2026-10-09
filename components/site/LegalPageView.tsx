import { legalPages } from "@/lib/legalPages";

const EYEBROWS: Record<string, string> = {
  "privacy-policy": "Legal",
  "refund-policy": "Legal",
  "terms-of-service": "Legal",
  "account-ownership-policy": "Legal",
  "taxes-on-services": "Legal",
};

export function LegalPageView({ slug }: { slug: string }) {
  const page = legalPages[slug];
  if (!page) {
    return <div className="container-x py-20 text-center text-muted-foreground">Page not found.</div>;
  }
  const eyebrow = EYEBROWS[slug] ?? "Legal";
  return (
    <article className="container-x max-w-[46rem] py-12 sm:py-16">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="text-balance text-[2.25rem] leading-[2.625rem] tracking-[-0.024em] text-foreground sm:text-h1">{page.title}</h1>
      {page.subtitle && <p className="mt-4 text-body-lg text-muted-foreground">{page.subtitle}</p>}
      <div className="section-divider mt-8" role="separator" aria-hidden />
      <div
        className="prose mt-8 max-w-none
          prose-headings:text-foreground prose-strong:text-foreground
          prose-li:marker:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />
      {page.note && (
        <div className="mt-10 rounded-lg bg-muted p-5 text-small text-muted-foreground">
          <span dangerouslySetInnerHTML={{ __html: page.note }} />
        </div>
      )}
    </article>
  );
}