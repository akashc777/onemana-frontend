import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "brand" | "brandPremium" | "ghost" | "subtle";
type Size = "sm" | "md" | "lg";

// The app's Button (onecamp-fe components/ui/button.tsx), on this site's
// names; lib/appSystem.ts has its numbers and app/appSystem.test.ts holds
// them. Radius 6, weight 500, no shadow. Hover is a fill step, a press
// settles the button a pixel, disabled fades to half. Keyboard focus is the
// global ring (globals.css); a filled button takes a thin outline 2px off
// its fill instead, because a 2px ring pressed against orange reads as one
// thick slab. Named transition properties, at the house 120 ms.
const base =
  "inline-flex items-center justify-center gap-2 text-center rounded-md font-medium transition-[color,background-color,border-color,opacity,transform] active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const FILLED_FOCUS = "focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-ring";

const variants: Record<Variant, string> = {
  /** The app's secondary: a muted fill, for an action that matters but is not the page's one primary. */
  primary: "bg-muted text-foreground hover:bg-muted/80",
  /** The app's default: the accent fill (--brand-ink, the app's --brand-text). One per view. */
  brand: `bg-brand-ink text-brand-foreground hover:bg-brand-ink/90 ${FILLED_FOCUS}`,
  /** Kept as a name for older call sites; it is the same as brand now. */
  brandPremium: `bg-brand-ink text-brand-foreground hover:bg-brand-ink/90 ${FILLED_FOCUS}`,
  /** The app's outline: the secondary action beside a primary one. */
  ghost: "border border-border-strong bg-background text-foreground hover:bg-highlight",
  /** The app's ghost: no ground until the pointer is on it. */
  subtle: "text-foreground hover:bg-highlight",
};

// The app's sizes: sm 32, default 36, lg 40, with its padding and text. Each
// states a line height, and padding plus line height plus an outline's two
// border pixels stays inside the minimum height, so a filled and an outlined
// button of one size are one height (buttonHeight.test.ts). Below md, where a
// finger presses them, md and lg reach 44 px, as the app's own fields do.
const sizes: Record<Size, string> = {
  sm: "min-h-8 px-3 py-1 text-caption",
  md: "min-h-11 px-4 py-1.5 text-sm md:min-h-9",
  lg: "min-h-11 px-8 py-2 text-sm md:min-h-10",
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