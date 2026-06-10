import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  /** Show a small pulsing status dot before the label. */
  dot?: boolean;
}

/** Glassy pill used for eyebrows, status chips, and tags. */
export function Badge({ children, className = "", dot = false }: BadgeProps) {
  return (
    <span className={`pill ${className}`}>
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
      )}
      {children}
    </span>
  );
}
