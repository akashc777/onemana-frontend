import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds hover background. */
  interactive?: boolean;
}

/** Clean bordered surface card. */
export function Card({ children, className = "", interactive = false }: CardProps) {
  return <div className={`card ${interactive ? "card-hover" : ""} ${className}`}>{children}</div>;
}