import type { ComponentType, ReactNode, SVGProps } from "react";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import type { CampHue } from "@/lib/campHue";

/**
 * A plan's card: a header in the plan's camp hue (planHues.ts) with its glyph,
 * its name and who it is for, then the body. The plan columns on the home
 * page and /pricing, and the licence and Cloud details under them, share it,
 * so a plan looks like itself wherever it appears.
 */
export function PlanCard({
  hue,
  Glyph,
  title,
  fits,
  titleAs: H = "h3",
  children,
  className = "",
}: {
  hue: CampHue;
  Glyph: ComponentType<SVGProps<SVGSVGElement>>;
  title: ReactNode;
  /** Who it is for, at the right of the header. */
  fits?: ReactNode;
  titleAs?: "h2" | "h3" | "p";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${HUE_CLASS[hue]} flex flex-col overflow-hidden rounded-lg border border-border bg-card ${className}`}>
      <div className="flex items-center gap-2.5 bg-hue-tint px-6 py-3.5">
        <Glyph className="size-5 shrink-0 text-hue" />
        <H className="font-sans text-small font-semibold tracking-normal text-hue-ink">{title}</H>
        {fits && <span className="ml-auto text-right text-caption text-hue-ink">{fits}</span>}
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-5">{children}</div>
    </div>
  );
}

/** A benefit line with a tick in the plan's hue (the strong cut, a mark, not text). */
export function PlanBenefit({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg className="mt-0.5 size-4 shrink-0 text-hue" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  );
}
