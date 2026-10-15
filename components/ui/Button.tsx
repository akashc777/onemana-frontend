import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Arrow } from "@/components/ui/v3";

type Variant = "primary" | "brand" | "brandPremium" | "ghost" | "subtle";
type Size = "sm" | "md" | "lg" | "xl";

// The app's Button (onecamp-fe components/ui/button.tsx, design v3), on this
// site's names. The shape and the elevation (radius, weight, sizes, press,
// focus ring, the primary's inner highlight, the secondary's e1) are ui-btn,
// ui-btn-{size} and ui-btn-{primary|secondary}, built from the one table
// (lib/appSystem.ts) by lib/tailwindAppSystem.ts; nothing here writes them.
const base = "ui-btn";

const variants: Record<Variant, string> = {
  /** The app's secondary: the raised surface at e1, e2 under the cursor. */
  primary: "ui-btn-secondary",
  /** The app's primary: the accent with its inner highlight. One per view. */
  brand: "ui-btn-primary",
  /** Kept as a name for older call sites; it is the same as brand now. */
  brandPremium: "ui-btn-primary",
  /** The app's secondary, beside a primary (was the outline). */
  ghost: "ui-btn-secondary",
  /** The app's ghost: ink-2, the accent's tint and ink under the pointer (ui-btn-subtle). */
  subtle: "ui-btn-subtle",
};

// The app's sm (28), default (32), lg (40) and the marketing xl (46); below
// md, md and lg reach 44 px for a finger, as the app's own fields do.
const sizes: Record<Size, string> = {
  sm: "ui-btn-sm",
  md: "ui-btn-md",
  lg: "ui-btn-lg",
  xl: "ui-btn-xl",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** The 16px arrow of a primary marketing CTA (site.md S2), moving 2px on hover. */
  arrow?: boolean;
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
  arrow = false,
}: CommonProps & { href: string; external?: boolean }) {
  const cls = buttonClasses(variant, size, className);
  if (arrow) children = (
    <>
      {children}
      <Arrow />
    </>
  );
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
>(function Button({ variant = "primary", size = "md", className = "", children, arrow = false, ...rest }, ref) {
  return (
    <button ref={ref} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
});