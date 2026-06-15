import type { ReactNode } from "react";
import { Reveal } from "@/components/site/Reveal";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  divider?: boolean;
  className?: string;
}

/** Consistent inner-page hero — matches home SectionHeading rhythm. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  divider = false,
  className = "",
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <section className={`relative overflow-hidden pt-14 sm:pt-16 ${className}`}>
      <div aria-hidden className="cf-orange-beam pointer-events-none absolute inset-x-0 top-0 h-48 opacity-60" />
      <div className={`container-x relative z-10 ${divider ? "pb-6" : "pb-10"} ${centered ? "text-center" : ""}`}>
        {eyebrow && (
          <Reveal>
            <p className={`eyebrow-premium ${centered ? "mx-auto w-fit" : ""}`}>{eyebrow}</p>
          </Reveal>
        )}
        <Reveal delay={eyebrow ? 60 : 0}>
          <h1
            className={`text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl ${
              eyebrow ? "mt-4" : ""
            }`}
          >
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={eyebrow ? 120 : 60}>
            <p
              className={`mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground ${
                centered ? "mx-auto" : ""
              }`}
            >
              {subtitle}
            </p>
          </Reveal>
        )}
      </div>
      {divider && (
        <div className="container-x mt-2 pb-8">
          {/* 
            Alignment fix: 
            - For centered headers (e.g. /blog, /about), the divider line is constrained to max-w-2xl
              (via mx-auto max-w-2xl on the line) to visually align with the subtitle + title block
              rather than spanning the full 1200px container-x while the readable text is narrower.
              This matches SectionHeading's max-w-2xl, the subtitle's cap, and the old content/about.md
              Divider blocks which specified max_width:800.
            - Left-aligned headers (docs, buy internals) keep the full container width.
            - Vertical spacing: reduced preceding pb-6 on header text + explicit mt/pb here for 
              consistent rhythm between header copy and the rule, before body content begins.
            - The line is now "owned" by the header block visually.
          */}
          <div
            className={`section-divider ${centered ? "mx-auto max-w-2xl" : ""}`}
            role="separator"
            aria-hidden
          />
        </div>
      )}
    </section>
  );
}