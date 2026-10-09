import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Grey, sentence case; most pages need none. */
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Left by default. Centred headers are kept only for call sites that ask. */
  align?: "center" | "left";
  /** A hairline under the header. */
  divider?: boolean;
  className?: string;
  /** Anything that belongs beside the title block: a primary action, say. */
  children?: ReactNode;
}

/**
 * An inner page's opening: the title, one line under it, and nothing behind
 * it. The orange beam and the orange eyebrow it used to carry were the
 * template's signature; the page's own content is enough.
 */
export function PageHeader({ eyebrow, title, subtitle, align = "left", divider = false, className = "", children }: PageHeaderProps) {
  const centred = align === "center";
  return (
    <section className={`pt-12 sm:pt-16 ${className}`}>
      <div className={`container-x ${divider ? "" : "pb-10"} ${centred ? "text-center" : ""}`}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className={`text-balance text-[2.25rem] leading-[2.625rem] tracking-[-0.024em] text-foreground sm:text-h1 ${centred ? "mx-auto max-w-3xl" : "max-w-3xl"}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-4 max-w-2xl text-body-lg text-muted-foreground ${centred ? "mx-auto" : ""}`}>{subtitle}</p>
        )}
        {children}
      </div>
      {divider && (
        <div className="container-x pt-10">
          <div className="section-divider" role="separator" aria-hidden />
        </div>
      )}
    </section>
  );
}
