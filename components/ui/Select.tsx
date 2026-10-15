"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/icons";
import { FIELD_HINT, FIELD_LABEL, RequiredMark } from "@/components/ui/Field";
import { closedState, optionId, selectKey, type SelectState } from "@/lib/selectKeys";
import { ix } from "@/lib/interactive";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  /** The field's visible name ("Country"). It names the combobox; nothing else does. */
  label: string;
  /** A line under the field, read after its name and value. */
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * The site's one select: a select-only combobox (WAI-ARIA APG), drawn as a
 * field (ui-field) with its list on the overlay surface.
 *
 * A screen reader hears the field's label as its name and the chosen option as
 * its value ("Country, combo box, India, collapsed"), and every option the
 * keys move to, through aria-activedescendant: focus never leaves the field.
 * The country on /buy sets GST and the currency's wording, so a buyer must be
 * able to confirm it (storefront audit K5: the old trigger's aria-label hid
 * the value, and arrowing said nothing).
 *
 * The keys are lib/selectKeys.ts (a native select's: arrows, Home, End, Page
 * Up and Down, type-ahead, Enter, Escape, and Tab chooses and moves on).
 * A tap or click outside closes the list and keeps the value. Options are 44
 * px tall under a finger.
 */
export function Select({ label, hint, value, onChange, options, placeholder = "Select…", required, disabled, className = "" }: SelectProps) {
  const [state, setState] = useState<SelectState>(closedState);
  const live = useRef(state);
  live.current = state;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const base = useId().replace(/:/g, "");
  const labelId = `${base}-label`;
  const listId = `${base}-list`;
  const hintId = `${base}-hint`;

  const chosen = options.findIndex((o) => o.value === value);
  const selected = chosen >= 0 ? options[chosen] : undefined;
  const labels = options.map((o) => o.label);

  const choose = useCallback(
    (i: number) => {
      const opt = options[i];
      if (opt && opt.value !== value) onChange(opt.value);
    },
    [options, value, onChange],
  );

  // A press anywhere outside closes the list and keeps the value.
  useEffect(() => {
    if (!state.open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setState(closedState());
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [state.open]);

  // The option under the keys stays in view; on opening, the chosen one is centred.
  const opened = useRef(false);
  useEffect(() => {
    if (!state.open) {
      opened.current = false;
      return;
    }
    const el = listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(listId, state.active))}`);
    el?.scrollIntoView({ block: opened.current ? "nearest" : "center" });
    opened.current = true;
  }, [state.open, state.active, listId]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const r = selectKey(live.current, { key: e.key, altKey: e.altKey, now: Date.now() }, labels, chosen);
    if (r.handled) e.preventDefault();
    if (r.commit !== undefined) choose(r.commit);
    setState(r.state);
  };

  const toggle = () => {
    if (disabled) return;
    setState(live.current.open ? closedState() : { open: true, active: chosen >= 0 ? chosen : 0, typed: "", typedAt: 0 });
  };

  const open = state.open && options.length > 0;
  return (
    <div className={className}>
      <span id={labelId} className={FIELD_LABEL}>
        {label} {required && <RequiredMark />}
      </span>
      <div ref={rootRef} className="relative">
        <div
          {...comboboxAria({ open, active: state.active, labelId, listId, hintId: hint ? hintId : undefined, required, disabled })}
          onClick={toggle}
          onKeyDown={onKeyDown}
          // Focus leaving any other way (another window, a script) closes the
          // list too; Tab has already chosen in onKeyDown.
          onBlur={() => live.current.open && setState(closedState())}
          className="ui-field cursor-pointer select-none items-center justify-between gap-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-70"
        >
          <span className={`truncate ${selected ? "text-foreground" : "text-faint"}`}>{selected ? selected.label : placeholder}</span>
          <Icon name="chevron-down" className={`shrink-0 text-muted-foreground transition-transform duration-pop ${open ? "rotate-180" : ""}`} />
        </div>

        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          hidden={!open}
          // A press on an option must not take focus from the combobox.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-50 mt-1 max-h-[min(20rem,50vh)] w-full animate-popover-in overflow-auto overscroll-contain rounded-xl bg-pop p-1 shadow-e3"
        >
          {open && (
            <SelectOptions
              listId={listId}
              options={options}
              chosen={chosen}
              active={state.active}
              onActive={(i) => setState((s) => (s.active === i ? s : { ...s, active: i }))}
              onPick={(i) => {
                choose(i);
                setState(closedState());
              }}
            />
          )}
        </ul>
      </div>
      {hint && (
        <span id={hintId} className={FIELD_HINT}>
          {hint}
        </span>
      )}
    </div>
  );
}

/**
 * The combobox's own attributes: named by the label's id (never an
 * aria-label, which would hide the value), pointing at its list, and while
 * open at the option under the keys, which is how a screen reader hears each
 * option as the keys move without focus leaving the field.
 */
export function comboboxAria({
  open,
  active,
  labelId,
  listId,
  hintId,
  required,
  disabled,
}: {
  open: boolean;
  active: number;
  labelId: string;
  listId: string;
  hintId?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return {
    role: "combobox",
    tabIndex: disabled ? -1 : 0,
    "aria-labelledby": labelId,
    "aria-controls": listId,
    "aria-expanded": open,
    "aria-haspopup": "listbox",
    "aria-activedescendant": open && active >= 0 ? optionId(listId, active) : undefined,
    "aria-describedby": hintId,
    "aria-required": required || undefined,
    "aria-disabled": disabled || undefined,
  } as const;
}

/**
 * The open list's options: each with the id the combobox points at, the
 * chosen one selected and ticked, the one under the keys or the pointer
 * highlighted (data-active). They are the interaction layer's items, 44 px
 * tall under a finger.
 */
export function SelectOptions({
  listId,
  options,
  chosen,
  active,
  onActive,
  onPick,
}: {
  listId: string;
  options: SelectOption[];
  chosen: number;
  active: number;
  onActive: (i: number) => void;
  onPick: (i: number) => void;
}) {
  return (
    <>
      {options.map((opt, i) => {
        const isChosen = i === chosen;
        const isActive = i === active;
        return (
          <li
            key={opt.value || `opt-${i}`}
            id={optionId(listId, i)}
            role="option"
            aria-selected={isChosen}
            data-active={isActive || undefined}
            onPointerMove={() => onActive(i)}
            onClick={() => onPick(i)}
            // The layer's item: the highlight is the accent's press tint
            // and the focus, with no ring; 44 px under a finger.
            {...ix("item")}
            className="flex min-h-9 cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-small text-muted-foreground"
          >
            <span className="truncate">{opt.label}</span>
            {isChosen && <Icon name="check" className="shrink-0 text-foreground" />}
          </li>
        );
      })}
    </>
  );
}
