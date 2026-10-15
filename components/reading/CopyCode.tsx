"use client";

import { useEffect, useRef } from "react";

/**
 * What a copy button says. Its words are the span lib/article.ts wrote, which
 * keeps the width of the longest of them, so only the span's text changes.
 */
export function setCopyLabel(button: Pick<HTMLElement, "querySelector" | "textContent">, label: string): void {
  const words = button.querySelector<HTMLElement>("[data-label]");
  if (words) words.textContent = label;
  else button.textContent = label;
}

/**
 * Makes the copy buttons in an article copy (lib/article.ts writes them).
 *
 * One listener on the document, not one per block: an article is static HTML,
 * so there is nothing for React to render per button. What is copied is the
 * code without its last newline, so a command pasted into a terminal waits
 * for Enter instead of running. Where the clipboard is not available (an http
 * page, an old browser) the code is selected, for Ctrl+C.
 */
export function CopyCode() {
  const status = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timers = new Set<number>();
    const say = (button: HTMLElement, label: string, announce: string) => {
      setCopyLabel(button, label);
      button.setAttribute("data-copied", "");
      if (status.current) status.current.textContent = announce;
      const t = window.setTimeout(() => {
        setCopyLabel(button, "Copy");
        button.removeAttribute("data-copied");
        timers.delete(t);
      }, 1600);
      timers.add(t);
    };

    const onClick = async (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest?.<HTMLElement>("button[data-copy-code]");
      const code = button?.closest(".code-block")?.querySelector("code");
      if (!button || !code) return;
      const text = (code.textContent ?? "").replace(/\n$/, "");
      try {
        await navigator.clipboard.writeText(text);
        say(button, "Copied", "Copied to the clipboard");
      } catch {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        const keys = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘C" : "Ctrl+C";
        say(button, `Press ${keys}`, `Selected. Press ${keys} to copy.`);
      }
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return <span ref={status} role="status" aria-live="polite" className="sr-only" />;
}
