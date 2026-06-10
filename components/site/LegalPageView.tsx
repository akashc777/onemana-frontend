import { legalPages } from "@/lib/legalPages";

// Renders a static content page (legal / about / docs) extracted from the
// previous site. Content is first-party (not user input).
export function LegalPageView({ slug }: { slug: string }) {
  const page = legalPages[slug];
  if (!page) {
    return (
      <div className="container-x py-20 text-center text-slate-500">Page not found.</div>
    );
  }
  return (
    <article className="container-x mx-auto max-w-3xl py-16">
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{page.title}</h1>
      {page.subtitle && <p className="mt-3 text-lg text-slate-600">{page.subtitle}</p>}
      <div className="mt-8 h-px w-full bg-slate-100" />
      <div
        className="legal-prose mt-8 text-[15px] leading-relaxed text-slate-700 [&_a]:text-brand [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1.5 [&_table]:mt-4 [&_table]:w-full"
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />
      {page.note && (
        <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-slate-600">
          {page.note}
        </div>
      )}
    </article>
  );
}
