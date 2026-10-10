import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "brand" | "brandPremium" | "ghost" | "subtle";
type Size = "sm" | "md" | "lg";

// Radius 6, no shadow, and the focus ring comes from the global :focus-visible
// rule (globals.css), so every control shows the same one.
const base =
  "inline-flex items-center justify-center gap-2 text-center rounded-md font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  /** Neutral fill, for an action that matters but is not the page's one primary. */
  primary: "bg-foreground text-background hover:bg-foreground/90",
  /** The accent fill. One per view: it is the thing the page wants you to do. */
  brand: "bg-brand text-brand-foreground hover:bg-brand-dark",
  /** Kept as a name for older call sites; it is the same as brand now. */
  brandPremium: "bg-brand text-brand-foreground hover:bg-brand-dark",
  /** Outline: the secondary action beside a primary one. */
  ghost: "border border-border-strong bg-card text-foreground hover:bg-muted",
  subtle: "text-muted-foreground hover:bg-muted hover:text-foreground",
};

// Each size states its line height, and its padding plus line height plus an
// outline's two border pixels stays inside the minimum height, so a filled
// and an outlined button of one size are one height (buttonHeight.test.ts).
// lg once inherited a 22.5 px line and came out 44 filled, 44.5 outlined.
const sizes: Record<Size, string> = {
  sm: "min-h-8 px-3 py-1 text-sm",
  md: "min-h-10 px-4 py-2 text-sm",
  lg: "min-h-11 px-5 py-2 text-[0.9375rem] leading-6",
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