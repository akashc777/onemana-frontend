import { legalPages } from "@/lib/legalPages";
import { AuroraBackdrop } from "@/components/site/Visuals";

// Renders a static content page (legal / about) extracted from the previous
// site. Content is first-party (not user input).
export function LegalPageView({ slug }: { slug: string }) {
  const page = legalPages[slug];
  if (!page) {
    return <div className="container-x py-20 text-center text-slate-500">Page not found.</div>;
  }
  return (
    <div className="relative overflow-hidden">
      <AuroraBackdrop className="!h-[40vh]" />
      <article className="container-x mx-auto max-w-3xl py-16 sm:py-20">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{page.title}</h1>
        {page.subtitle && <p className="mt-3 text-lg text-slate-400">{page.subtitle}</p>}
        <div className="mt-8 h-px w-full bg-white/10" />
        <div
          className="prose prose-invert prose-slate mt-8 max-w-none
            prose-headings:text-white prose-a:text-brand-light prose-strong:text-white
            prose-li:marker:text-slate-500"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
        {page.note && (
          <div className="mt-10 rounded-2xl border border-brand/20 bg-brand/10 p-5 text-sm text-slate-300">
            <span dangerouslySetInnerHTML={{ __html: page.note }} />
          </div>
        )}
      </article>
    </div>
  );
}
