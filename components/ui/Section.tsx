import type { ReactNode } from "react";
import type { CampHue } from "@/lib/campHue";
import { HUE_CLASS } from "@/components/ui/graphics/hues";

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  /** A hairline above the section, aligned to the content. */
  divider?: boolean;
  /** Tighter vertical rhythm for strips and short bands. */
  spacing?: "default" | "compact";
  /**
   * The ground. "muted" is a step darker in the same palette. Never a theme flip.
   */
  tone?: "page" | "muted";
  /**
   * A full-width band in a camp hue's tint (the playful layer): at most every
   * other section, and one band colour on a screen. The hue says what the
   * section is about, the same hue it has everywhere on the site (dusk for
   * agents and the record, for one). Text on it keeps its tokens, which hold
   * AA on every tint (app/bandContrast.test.ts). Wins over tone.
   */
  band?: CampHue;
}

// 96 on a wide screen and 64 on a phone (DESIGN.md, Space), with a little more
// below than above: equal padding reads as a gap that is too big at the top.
// No reveal on scroll: every section is visible to a crawler, a link preview,
// a full-page capture and a fast reader alike.
const SPACING = {
  default: "pt-16 pb-20 sm:pt-24 sm:pb-28",
  compact: "py-10 sm:py-14",
} as const;

/**
 * Semantic <section> with the site's width and vertical rhythm. No scroll
 * margin of its own: html's scroll-padding-top (globals.css) already stops an
 * anchor below the sticky nav, and a margin here added to it, so a link
 * landed 80 px lower on the screen than it meant to.
 */
export function Section({ id, children, className = "", divider = false, spacing = "default", tone = "page", band }: SectionProps) {
  const ground = band
    ? `${HUE_CLASS[band]} border-y border-hue/15 bg-hue-tint`
    : tone === "muted"
      ? "border-y border-border bg-muted/70"
      : "";
  return (
    <section id={id} data-band={band} className={`relative ${ground} ${className}`}>
      <div className="container-x">
        {divider && tone === "page" && !band && <div className="section-divider" role="separator" aria-hidden />}
        <div className={SPACING[spacing]}>{children}</div>
      </div>
    </section>
  );
}

interface HeadingProps {
  /** Grey, sentence case, and rare: at most one on a page. */
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

/**
 * The editorial grid: the heading in the margin (four of twelve columns), the
 * content in the measure beside it. For sections that read like a document:
 * a specification, a list of questions, a policy. It alternates with
 * full-width sections, so two neighbours never share a shape. Below lg the
 * margin stacks above the content.
 */
export function Margin({ aside, children, className = "" }: { aside: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`grid gap-8 lg:grid-cols-12 lg:gap-x-8 ${className}`}>
      <div className="lg:col-span-4 lg:pr-6">{aside}</div>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </div>
  );
}

/** A heading for the margin: smaller than a section heading, because the margin is narrow. */
export function MarginHeading({ title, subtitle, id }: { title: ReactNode; subtitle?: ReactNode; id?: string }) {
  return (
    <div className="lg:sticky lg:top-24">
      <h2 id={id} className="text-balance text-[1.75rem] leading-[2.125rem] tracking-[-0.016em] text-foreground">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-body text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
