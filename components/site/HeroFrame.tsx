import type { ReactNode } from "react";

/** Wraps the hero product mock with a CF-style flat frame and top accent. */
export function HeroFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full">
      <div className="premium-frame relative overflow-hidden rounded-lg pointer-events-none select-none">
        <div className="premium-frame-ring" aria-hidden />
        <div aria-hidden className="premium-frame-accent h-px w-full" />
        {children}
      </div>
    </div>
  );
}