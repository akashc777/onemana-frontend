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

// More air than before, and deliberately NOT symmetrical. A section reads as one
// unit when the space below it is a little larger than the space above, because
// the heading at the top already carries its own optical gap. Equal padding makes
// consecutive sections blur into a single stripe, which is what eleven of them in
// a row were doing.
const SPACING = {
  default: "pt-20 pb-24 sm:pt-24 sm:pb-32",
  compact: "pt-14 pb-16 sm:pt-16 sm:pb-20",
} as const;

const SPACING_WITH_DIVIDER = {
  default: "pt-20 pb-24 sm:pt-24 sm:pb-32",
  compact: "pt-14 pb-16 sm:pt-16 sm:pb-20",
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
// LEFT BY DEFAULT. Every one of the eleven sections on the home page used the
// centred variant, so the whole document ran down a single mirror axis and no
// section could be told apart from the one above it. Centring is a way to mark
// something as special, and marking everything special marks nothing.
//
// The hero stays centred, and now means something because it is the exception.
// Left-aligned headings also scan faster: the eye returns to a known x position
// on every line instead of hunting for the start of each one.
export function SectionHeading({ eyebrow, title, subtitle, align = "left", className = "" }: HeadingProps) {
  const alignment = align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl text-left";
  return (
    <Reveal className={`${alignment} ${className}`}>
      {eyebrow && (
        <p className={`eyebrow-premium ${align === "center" ? "mx-auto w-fit" : ""}`}>{eyebrow}</p>
      )}
      <h2 className="text-balance text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-[2.5rem] sm:leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[1.0625rem]">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}