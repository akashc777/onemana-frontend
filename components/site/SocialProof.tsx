import { Reveal } from "@/components/site/Reveal";
import { socialProof, testimonials } from "@/lib/content";
import { site } from "@/lib/site";

function QuoteMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 text-brand/30" fill="currentColor" aria-hidden>
      <path d="M13 8c-3.9 1.7-6 4.9-6 9.6V24h7v-7H9.8c0-2.7 1.2-4.4 3.9-5.3L13 8zm12 0c-3.9 1.7-6 4.9-6 9.6V24h7v-7h-4.2c0-2.7 1.2-4.4 3.9-5.3L25 8z" />
    </svg>
  );
}

export function SocialProof() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-5 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal key={t.author} delay={i * 80}>
            <figure className="premium-frame relative h-full overflow-hidden rounded-lg">
              <div className="premium-frame-accent" aria-hidden />
              <div className="flex h-full flex-col px-6 py-7 sm:px-8 sm:py-8">
                <QuoteMark />
                <blockquote className="mt-3 flex-1 text-base leading-relaxed text-foreground">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                  <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                    {t.author.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{t.author}</span>
                    <span className="block truncate text-xs text-muted-foreground">{t.role}</span>
                  </span>
                </figcaption>
              </div>
            </figure>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {socialProof.signals.map((s, i) => (
          <Reveal key={s.label} delay={i * 60}>
            <div className="rounded-lg border border-border bg-background px-4 py-3.5 text-center">
              <p className="text-sm font-medium text-foreground">{s.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {s.label === "Live demo" ? (
                  <a href={site.demoUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-foreground hover:underline">
                    {s.detail}
                  </a>
                ) : s.label === "Open-source frontend" ? (
                  <a href={site.githubUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-foreground hover:underline">
                    {s.detail}
                  </a>
                ) : (
                  s.detail
                )}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
