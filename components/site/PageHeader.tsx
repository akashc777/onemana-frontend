import type { ReactNode } from "react";

interface PageHeaderProps {
  /** 13/510 after a brand dot; most pages need none. */
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Left by default. Centred headers are kept only for call sites that ask. */
  align?: "center" | "left";
  /** A hairline under the header. */
  divider?: boolean;
  className?: string;
  /** Anything that belongs under the title block: the page's first actions, 32px under the lead. */
  children?: ReactNode;
  /**
   * The page's colour moment (site.md S4): a v3 spot or a small hue
   * composition, 360 x 240 on the right from lg. On a phone it sits above
   * the H1 at 96px, unless `artOnPhone` is false (legal, docs).
   */
  art?: ReactNode;
  artOnPhone?: boolean;
  /** The H1's step: `page` (52/56) for most pages, `title-read` (40/46) for a doc, a post and a policy. */
  size?: "page" | "read";
  /** A checkout's compact header: 64px above, 32 below. */
  compact?: boolean;
}

/**
 * An inner page's opening (site.md S4): an optional eyebrow, the H1 in the
 * `page` step at up to 20 characters a line, the lead at 20/30 in ink-2, and
 * the page's art on the right. 96px above on a wide screen and 56 on a
 * phone; 48 below. The H1 and the lead rise 8px on load (transform only,
 * so the LCP is never held back); the art may fade, being decoration.
 *
 * `className` lands on the outer <section>, so it cannot take the bottom
 * padding away (pageHeaderPadding.test.ts).
 */
export function PageHeader({ eyebrow, title, subtitle, align = "left", divider = false, className = "", children, art, artOnPhone = true, size = "page", compact = false }: PageHeaderProps) {
  const centred = align === "center";
  return (
    <section className={`${compact ? "pt-10 sm:pt-16" : "pt-14 sm:pt-20 lg:pt-24"} ${className}`}>
      <div className={`container-x ${divider ? "" : compact ? "pb-8" : "pb-12"} ${centred ? "text-center" : ""}`}>
        <div className={art ? "lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8" : ""}>
          {art && (
            <div aria-hidden="true" className={`${artOnPhone ? "mb-6 flex [&>*]:max-h-24 [&>*]:max-w-24 lg:[&>*]:max-h-none lg:[&>*]:max-w-none" : "hidden lg:flex"} fx-fade justify-start lg:order-2 lg:col-span-4 lg:col-start-9 lg:mb-0 lg:h-60 lg:items-center lg:justify-center`}>
              {art}
            </div>
          )}
          <div className={art ? "lg:col-span-8" : ""}>
            {eyebrow && <p className={`eyebrow in-lift ${centred ? "justify-center" : ""}`}>{eyebrow}</p>}
            <h1 className={`in-lift text-balance text-foreground ${size === "read" ? "text-title-read" : "text-page"} ${centred ? "mx-auto max-w-3xl" : "max-w-[20ch]"}`}>{title}</h1>
            {subtitle && <p className={`in-lift at-60 mt-5 max-w-[640px] text-lead text-muted-foreground ${centred ? "mx-auto" : ""}`}>{subtitle}</p>}
            {children}
          </div>
        </div>
      </div>
      {divider && (
        <div className="container-x pt-10">
          <div className="section-divider" role="separator" aria-hidden />
        </div>
      )}
    </section>
  );
}
