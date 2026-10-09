import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** A hairline above the section, aligned to the content. */
  divider?: boolean;
  /** Tighter vertical rhythm for strips and short bands. */
  spacing?: "default" | "compact";
}

// 80 on a wide screen and 64 on a phone (DESIGN.md, Space). No reveal on
// scroll: every section is visible to a crawler, a link preview, a full-page
// capture and a fast reader alike.
const SPACING = {
  default: "py-16 sm:py-20",
  compact: "py-10 sm:py-14",
} as const;

/** Semantic <section> with the site's width and vertical rhythm. */
export function Section({ id, children, className = "", divider = false, spacing = "default" }: SectionProps) {
  return (
    <section id={id} className={`relative scroll-mt-16 ${className}`}>
      <div className="container-x">
        {divider && <div className="section-divider" role="separator" aria-hidden />}
        <div className={SPACING[spacing]}>{children}</div>
      </div>
    </section>
  );
}

interface HeadingProps {
  /** Grey, sentence case, and rare: at most two on a page. */
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Centred only for a page's final call to action. */
  align?: "left" | "center";
  className?: string;
  /** The heading's level: h2 by default. */
  as?: "h1" | "h2";
}

/** A section's heading: left-aligned, one weight, no decoration. */
export function SectionHeading({ eyebrow, title, subtitle, align = "left", className = "", as = "h2" }: HeadingProps) {
  const H = as;
  const centred = align === "center";
  return (
    <div className={`${centred ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <H className="text-balance text-h2 text-foreground">{title}</H>
      {subtitle && <p className="mt-3 text-body text-muted-foreground sm:text-body-lg">{subtitle}</p>}
    </div>
  );
}
