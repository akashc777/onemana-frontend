"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { buttonClasses } from "@/components/ui/Button";

/** What a confirm says: its question as the title, the rest of the sentence under it, and its two buttons. */
export type ConfirmAsk = {
  title: string;
  body: string;
  /** The button that acts, in a few words of what it does ("Move now", "Go ahead"), never a bare OK. */
  yes: string;
  /** The way out that does nothing. */
  no?: string;
  /** Drawn as destructive (Cancel subscription). */
  danger?: boolean;
};

/**
 * The account page's confirm for a money action: an upgrade or a switch,
 * Cancel subscription, Move now. They were window.confirm, which a phone draws
 * itself, light over a dark page, with no name of ours and its buttons wherever
 * the system puts them. This is the house one: a centred dialog on a computer,
 * and below 640 px a drawer from the bottom edge whose buttons sit in a foot
 * that stays in view, clear of the home indicator.
 *
 * It is awaited like the call it replaced, so each call site keeps its shape:
 *
 *   const [confirm, confirmSheet] = useConfirm();
 *   if (!(await confirm({ title, body, yes }))) return;
 *   ...and {confirmSheet} once in what the component draws.
 *
 * Esc, the backdrop and the safe button all answer false. Focus starts on the
 * safe button, Tab stays inside, and on close it goes back to the button that
 * opened it. It reads nothing and calls nothing; it only answers.
 */
export function useConfirm(): [(ask: ConfirmAsk) => Promise<boolean>, ReactNode] {
  const [ask, setAsk] = useState<ConfirmAsk | null>(null);
  const settle = useRef<((ok: boolean) => void) | null>(null);
  const confirm = useCallback(
    (next: ConfirmAsk) =>
      new Promise<boolean>((resolve) => {
        settle.current?.(false);
        settle.current = resolve;
        setAsk(next);
      }),
    [],
  );
  const close = useCallback((ok: boolean) => {
    settle.current?.(ok);
    settle.current = null;
    setAsk(null);
  }, []);
  // Leaving the page with a confirm open answers it: nothing waits for ever.
  useEffect(() => () => settle.current?.(false), []);
  return [confirm, ask && <ConfirmSheet ask={ask} onClose={close} />];
}

function ConfirmSheet({ ask, onClose }: { ask: ConfirmAsk; onClose: (ok: boolean) => void }) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const safe = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const page = document.body.style;
    const overflow = page.overflow;
    page.overflow = "hidden";
    safe.current?.focus();
    return () => {
      page.overflow = overflow;
      trigger?.focus();
    };
  }, []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose(false);
      return;
    }
    if (e.key !== "Tab") return;
    const buttons = panel.current?.querySelectorAll("button");
    if (!buttons?.length) return;
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    const at = document.activeElement;
    if (e.shiftKey ? at === first || at === panel.current : at === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose(false)}
    >
      <div
        ref={panel}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-d`}
        tabIndex={-1}
        onKeyDown={onKey}
        className="flex max-h-[85dvh] w-full flex-col rounded-t-2xl bg-card text-foreground shadow-e3 outline-none sm:max-w-md sm:rounded-2xl"
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 sm:px-6 sm:pt-6">
          <h2 id={`${id}-t`} className="text-body font-semibold">
            {ask.title}
          </h2>
          <p id={`${id}-d`} className="mt-2 text-small text-muted-foreground">
            {ask.body}
          </p>
        </div>
        <div className="flex shrink-0 flex-col-reverse gap-2 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
          <button ref={safe} type="button" onClick={() => onClose(false)} className={buttonClasses("ghost", "md", "min-h-11")}>
            {ask.no ?? "Not now"}
          </button>
          <button
            type="button"
            onClick={() => onClose(true)}
            className={ask.danger ? "ui-btn ui-btn-md min-h-11 bg-danger text-white shadow-e1" : buttonClasses("brand", "md", "min-h-11")}
          >
            {ask.yes}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
