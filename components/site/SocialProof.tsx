import { Reveal } from "@/components/site/Reveal";
import { socialProof } from "@/lib/content";
import { site } from "@/lib/site";

export function SocialProof() {
  return (
    <div className="mx-auto max-w-4xl">
      <Reveal>
        <blockquote className="premium-frame overflow-hidden rounded-lg text-center">
          <div className="premium-frame-accent" aria-hidden />
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <p className="mx-auto max-w-3xl text-balance text-lg leading-relaxed text-foreground sm:text-xl">
              &ldquo;{socialProof.quote}&rdquo;
            </p>
            <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
              <cite className="font-semibold not-italic text-foreground">{socialProof.author}</cite>
              <span className="text-muted-foreground">· {socialProof.role}</span>
            </footer>
          </div>
        </blockquote>
      </Reveal>

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