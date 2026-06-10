import type { ReactNode } from "react";
import { Reveal } from "@/components/site/Reveal";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Adds a subtle top divider that reads well on the dark canvas. */
  divider?: boolean;
}

/** Semantic <section> with consistent vertical rhythm and width. */
export function Section({ id, children, className = "", divider = false }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative py-20 sm:py-24 ${divider ? "border-t border-white/5" : ""} ${className}`}
    >
      <div className="container-x">{children}</div>
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
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-light">{eyebrow}</p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg leading-relaxed text-slate-400">{subtitle}</p>}
    </Reveal>
  );
}
