"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import type { CampHue } from "@/lib/campHue";
import { ix, type InteractiveKind } from "@/lib/interactive";
import { rovingIndex } from "@/lib/roving";

/**
 * The site's one choice of one: a radiogroup that is one Tab stop. The arrows
 * move and choose and wrap round, Home and End jump (lib/roving.ts), and only
 * the chosen option is in the Tab order. Every option is drawn by the
 * interaction layer: a segment ("tab", the raised knob when chosen) or a
 * choice card ("chip", a tint and a ring when chosen), with the hover, the
 * press and the focus ring of its kind. The plan, the billing, the AI choice,
 * the Cloud size and the phone's theme all choose through it.
 *
 * `option` draws an option's content; `itemClass` gives its shape (its
 * height, padding and type), never its states.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  option,
  className = "",
  itemClass = "",
  kind = "tab",
  hue,
  thumb = false,
  children,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  option: (value: T, on: boolean) => ReactNode;
  className?: string;
  itemClass?: string | ((value: T, on: boolean) => string);
  kind?: Extract<InteractiveKind, "tab" | "chip">;
  /** An option's camp hue, for its tint and its mark. */
  hue?: (value: T) => CampHue | undefined;
  /** The chosen option's knob is drawn apart, as a sliding thumb. */
  thumb?: boolean;
  /** Drawn inside the group before the options: the sliding thumb, say. */
  children?: ReactNode;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const at = options.indexOf(value);
  const onKeyDown = (e: KeyboardEvent) => {
    const to = rovingIndex(e.key, Math.max(at, 0), options.length);
    if (to === null) return;
    e.preventDefault();
    onChange(options[to]!);
    refs.current[to]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className={className}>
      {children}
      {options.map((o, i) => {
        const on = i === at;
        return (
          <button
            key={o}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on || (at < 0 && i === 0) ? 0 : -1}
            onClick={() => onChange(o)}
            {...ix(kind, { hue: hue?.(o) })}
            data-thumb={thumb || undefined}
            className={typeof itemClass === "function" ? itemClass(o, on) : itemClass}
          >
            {option(o, on)}
          </button>
        );
      })}
    </div>
  );
}
