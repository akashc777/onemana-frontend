import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  /** Show a small status dot before the label. */
  dot?: boolean;
}

/** Subtle pill used for eyebrows, status chips, and tags. */
export function Badge({ children, className = "", dot = false }: BadgeProps) {
  return (
    <span className={`${dot ? "pill-premium" : "pill"} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-[1px] bg-brand" />}
      {children}
    </span>
  );
}