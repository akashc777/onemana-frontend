import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds hover lift + glow. */
  interactive?: boolean;
  /** Wraps the card in a gradient hairline border. */
  ring?: boolean;
}

/** Glass surface card. Optionally interactive (hover) and ring-bordered. */
export function Card({ children, className = "", interactive = false, ring = false }: CardProps) {
  const inner = (
    <div className={`card ${interactive ? "card-hover" : ""} ${ring ? "h-full" : ""} ${className}`}>
      {children}
    </div>
  );
  if (ring) return <div className="ring-border h-full">{inner}</div>;
  return inner;
}
