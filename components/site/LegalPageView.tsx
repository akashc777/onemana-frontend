import { legalPages } from "@/lib/legalPages";

const EYEBROWS: Record<string, string> = {
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
    <article className="container-x mx-auto max-w-prose py-14 sm:py-16">
      <p className="eyebrow-premium">{eyebrow}</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">{page.title}</h1>
      {page.subtitle && <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{page.subtitle}</p>}
      <div className="section-divider mt-8" role="separator" aria-hidden />
      <div
        className="prose mt-8 max-w-none
          prose-headings:text-foreground prose-a:text-brand prose-strong:text-foreground
          prose-li:marker:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />
      {page.note && (
        <div className="mt-10 rounded-xl border border-border bg-muted/50 p-5 text-sm text-muted-foreground">
          <span dangerouslySetInnerHTML={{ __html: page.note }} />
        </div>
      )}
    </article>
  );
}