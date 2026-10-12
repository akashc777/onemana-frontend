import { Fragment, type ReactNode } from "react";
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
   * The page's one band (site.md S6): the hue's tint, fading to 70% at the
   * foot, under a 1px rule in the hue. The hue says what the section is
   * about, the same hue it has everywhere on the site. Text on it keeps its
   * tokens, which hold AA on every tint (app/bandContrast.test.ts). Wins over
   * tone.
   */
  band?: CampHue;
  /**
   * The page's one night section (S6): the dark page with inverted ink, in
   * both themes. Only home uses it, for Safe AI.
   */
  night?: boolean;
  /** The id of the heading that names this section, for aria-labelledby. */
  labelledBy?: string;
}

// 96 on a wide screen and 64 on a phone (DESIGN.md, Space), with a little more
// below than above: equal padding reads as a gap that is too big at the top.
// Nothing is hidden on scroll: every section is visible to a crawler, a link
// preview, a full-page capture and a fast reader alike. A heading's entrance
// (.reveal) only moves it 8px, and only where the browser has a scroll
// timeline (site.md G5).
// Every page's sections keep this one rhythm (sectionRhythm.test.ts): 144 px
// between two sections' content on a phone and 208 on a wide screen, and a
// band's edge 64 and 96 above its content, 80 and 112 below.
export const SECTION_SPACING = {
  default: "pt-16 pb-20 sm:pt-24 sm:pb-28",
  compact: "py-10 sm:py-14",
} as const;
/** The bottom of a section, for a first section that follows a PageHeader. */
export const SECTION_END = "pb-20 sm:pb-28";
const SPACING = SECTION_SPACING;

/**
 * Semantic <section> with the site's width and vertical rhythm. No scroll
 * margin of its own: html's scroll-padding-top (globals.css) already stops an
 * anchor below the sticky nav.
 */
export function Section({ id, children, className = "", divider = false, spacing = "default", tone = "page", band, night = false, labelledBy }: SectionProps) {
  const ground = night
    ? "night"
    : band
      ? `${HUE_CLASS[band]} band`
      : tone === "muted"
        ? "border-y border-border bg-muted/70"
        : "";
  return (
    <section id={id} aria-labelledby={labelledBy} data-band={band} data-night={night ? "" : undefined} className={`relative ${ground} ${className}`}>
      <div className="container-x">
        {divider && tone === "page" && !band && <div className="section-divider" role="separator" aria-hidden />}
        <div className={SPACING[spacing]}>{children}</div>
      </div>
    </section>
  );
}

/**
 * A heading of two sentences breaks between them first ("Free for small
 * teams. / Pay once when you grow."), never after the first word of the
 * second ("… teams. Pay / once …"). Each sentence is one inline box, so a
 * line can only end at a sentence's end, and a sentence wider than the line
 * wraps inside itself, balanced. A heading that is not a plain string, or is
 * one sentence, is drawn as it is.
 */
export function Sentences({ children }: { children: ReactNode }) {
  if (typeof children !== "string") return <>{children}</>;
  const parts = children.split(/(?<=[.?!])\s+(?=\S)/);
  if (parts.length < 2) return <>{children}</>;
  return (
    <>
      {parts.map((s, i) => (
        <Fragment key={i}>
          {i > 0 ? " " : null}
          <span className="inline-block">{s}</span>
        </Fragment>
      ))}
    </>
  );
}

interface HeadingProps {
  /** 13/510 after a brand dot (site.md S5), on at most every other section. */
  eyebrow?: string;
  /** The eyebrow dot's colour, when the section has a hue of its own (agents' indigo, say). */
  eyebrowDot?: "agent" | "berry";
  title: ReactNode;
  subtitle?: ReactNode;
  /**
   * S5's two layouts, alternating down a page: "stack" (the heading, then a
   * 20/30 lead under it) and "split" (the heading on the left, a 17/27 lead
   * on the right, aligned to its foot).
   */
  layout?: "stack" | "split";
  /** Centred only for a page's final call to action. */
  align?: "left" | "center";
  className?: string;
  /** The heading's level: h2 by default. */
  as?: "h1" | "h2";
  id?: string;
}

const DOT = { agent: "[--eyebrow-dot:rgb(var(--agent))]", berry: "[--eyebrow-dot:rgb(var(--camp-berry))]" } as const;

/** A section's heading (S5): H2 at 44/50, an optional eyebrow and lead; it rises 8px once as it enters. */
export function SectionHeading({ eyebrow, eyebrowDot, title, subtitle, layout = "stack", align = "left", className = "", as = "h2", id }: HeadingProps) {
  const H = as;
  const centred = align === "center";
  const eb = eyebrow && <p className={`eyebrow ${eyebrowDot ? DOT[eyebrowDot] : ""}`}>{eyebrow}</p>;
  if (layout === "split") {
    return (
      <div className={`reveal grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-x-8 ${className}`}>
        <div className="lg:col-span-7">
          {eb}
          <H id={id} className="text-balance text-h2 text-foreground">
            <Sentences>{title}</Sentences>
          </H>
        </div>
        {subtitle && <p className="max-w-[420px] text-balance text-body text-muted-foreground sm:text-[17px] sm:leading-[27px] lg:col-span-4 lg:col-start-9 lg:pb-1">{subtitle}</p>}
      </div>
    );
  }
  return (
    <div className={`reveal ${centred ? "mx-auto max-w-2xl text-center" : "max-w-3xl"} ${className}`}>
      {eb}
      <H id={id} className="text-balance text-h2 text-foreground">
        <Sentences>{title}</Sentences>
      </H>
      {subtitle && <p className="mt-4 max-w-[640px] text-lead text-muted-foreground">{subtitle}</p>}
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

/** A heading for the margin: the section heading's size, sticky beside its content on a wide screen. */
export function MarginHeading({ title, subtitle, id, eyebrow }: { title: ReactNode; subtitle?: ReactNode; id?: string; eyebrow?: string }) {
  return (
    <div className="reveal lg:sticky lg:top-24">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="text-balance text-h2 text-foreground">
        <Sentences>{title}</Sentences>
      </h2>
      {subtitle && <p className="mt-4 text-body text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
