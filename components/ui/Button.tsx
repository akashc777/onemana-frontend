import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "brand" | "brandPremium" | "ghost" | "subtle";
type Size = "sm" | "md" | "lg";

// The app's Button (onecamp-fe components/ui/button.tsx), on this site's
// names. The shape (radius, weight, sizes, press, disabled fade, timing) is
// ui-btn and ui-btn-{size}, built from the one table (lib/appSystem.ts) by
// lib/tailwindAppSystem.ts; the variants here are only colour. Keyboard focus
// is the global ring (globals.css); a filled button takes a thin outline off
// its fill instead (ui-btn-filled), because a 2px ring pressed against orange
// reads as one thick slab.
const base = "ui-btn";

const variants: Record<Variant, string> = {
  /** The app's secondary: a muted fill, for an action that matters but is not the page's one primary. */
  primary: "bg-muted text-foreground hover:bg-muted/80",
  /** The app's default: the accent fill (--brand-ink, the app's --brand-text). One per view. */
  brand: "ui-btn-filled bg-brand-ink text-brand-foreground hover:bg-brand-ink/90",
  /** Kept as a name for older call sites; it is the same as brand now. */
  brandPremium: "ui-btn-filled bg-brand-ink text-brand-foreground hover:bg-brand-ink/90",
  /** The app's outline: the secondary action beside a primary one. */
  ghost: "border border-border-strong bg-background text-foreground hover:bg-highlight",
  /** The app's ghost: no ground until the pointer is on it. */
  subtle: "text-foreground hover:bg-highlight",
};

// The app's sm, default and lg; below md the two larger reach 44 px for a
// finger, as the app's own fields do.
const sizes: Record<Size, string> = {
  sm: "ui-btn-sm",
  md: "ui-btn-md",
  lg: "ui-btn-lg",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

export function ButtonLink({
  href,
  external,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: CommonProps & { href: string; external?: boolean }) {
  const cls = buttonClasses(variant, size, className);
  if (external || href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  CommonProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function Button({ variant = "primary", size = "md", className = "", children, ...rest }, ref) {
  return (
    <button ref={ref} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
});