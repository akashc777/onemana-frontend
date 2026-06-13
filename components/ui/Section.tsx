import type { ReactNode } from "react";
import { Reveal } from "@/components/site/Reveal";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Adds a content-aligned horizontal rule above the section. */
  divider?: boolean;
  /** Tighter vertical rhythm for stat strips and similar bands. */
  spacing?: "default" | "compact";
}

const SPACING = {
  default: "py-16 sm:py-20",
  compact: "py-12 sm:py-14",
} as const;

const SPACING_WITH_DIVIDER = {
  default: "pt-16 sm:pt-20 pb-16 sm:pb-20",
  compact: "pt-12 sm:pt-14 pb-12 sm:pb-14",
} as const;

/** Semantic <section> with consistent vertical rhythm and width. */
export function Section({ id, children, className = "", divider = false, spacing = "default" }: SectionProps) {
  const pad = divider ? SPACING_WITH_DIVIDER[spacing] : SPACING[spacing];

  return (
    <section id={id} className={`relative ${className}`}>
      <div className="container-x">
        {divider && <div className="section-divider" role="separator" aria-hidden />}
        <div className={pad}>{children}</div>
      </div>
    </section>
  );
}

interface HeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
}

/** Reusable eyebrow + title + subtitle block with reveal animation. */
export function SectionHeading({ eyebrow, title, subtitle, align = "center", className = "" }: HeadingProps) {
  const alignment = align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left";
  return (
    <Reveal className={`${alignment} ${className}`}>
      {eyebrow && (
        <p className={`eyebrow-premium ${align === "center" ? "mx-auto w-fit" : ""}`}>{eyebrow}</p>
      )}
      <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{subtitle}</p>}
    </Reveal>
  );
}