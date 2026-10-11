import type { ComponentType, ReactNode, SVGProps } from "react";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import type { CampHue } from "@/lib/campHue";

/**
 * A plan card's header: the plan's camp hue (planHues.ts) behind its glyph,
 * its name and, when given, who it is for. One line, so headers side by side
 * are the same height.
 */
export function PlanCardHeader({
  Glyph,
  title,
  fits,
  titleAs: H = "h3",
}: {
  Glyph: ComponentType<SVGProps<SVGSVGElement>>;
  title: ReactNode;
  fits?: ReactNode;
  titleAs?: "h2" | "h3" | "p";
}) {
  return (
    <div className="flex items-center gap-2.5 bg-hue-tint px-6 py-3.5">
      <Glyph className="size-4 shrink-0 text-hue" />
      <H className="font-sans text-small font-semibold tracking-normal text-hue-ink">{title}</H>
      {fits && <span className="ml-auto text-right text-caption text-hue-ink">{fits}</span>}
    </div>
  );
}

/**
 * A plan's card: the header in the plan's hue, then the body. The plan
 * columns on the home page and /pricing (which lay their parts on a shared
 * subgrid instead) and the licence and Cloud details share the look, so a plan
 * looks like itself wherever it appears.
 *
 * `aligned`: side by side from lg, the card and its body lay their parts on
 * the row's grid, the header and then six parts (price, estimate, who it is
 * for, the list, the button, the note), so each part of a pair starts on one
 * line whatever wraps. The parent grid gives each card `lg:row-span-7`'s rows.
 */
export const PLAN_CARD_PARTS = 6;

export function PlanCard({
  hue,
  Glyph,
  title,
  fits,
  titleAs: H = "h3",
  aligned = false,
  children,
  className = "",
}: {
  hue: CampHue;
  Glyph: ComponentType<SVGProps<SVGSVGElement>>;
  title: ReactNode;
  /** Who it is for, at the right of the header. */
  fits?: ReactNode;
  titleAs?: "h2" | "h3" | "p";
  /** Lay the header and six body parts on the row's subgrid from lg. */
  aligned?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${HUE_CLASS[hue]} flex flex-col overflow-hidden rounded-lg border border-border bg-card ${aligned ? "lg:row-span-7 lg:grid lg:grid-rows-subgrid lg:gap-y-0" : ""} ${className}`}
    >
      <PlanCardHeader Glyph={Glyph} title={title} fits={fits} titleAs={H} />
      <div className={`flex flex-1 flex-col px-6 pb-6 pt-5 ${aligned ? "lg:row-span-6 lg:grid lg:grid-rows-subgrid lg:gap-y-0" : ""}`}>{children}</div>
    </div>
  );
}

/** A benefit line with a tick in the plan's hue (the strong cut, a mark, not text). */
export function PlanBenefit({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg className="mt-0.5 size-4 shrink-0 text-hue" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.564" aria-hidden="true">
        <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  );
}
