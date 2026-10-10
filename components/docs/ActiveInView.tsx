"use client";

import { useEffect } from "react";

/**
 * Scrolls the docs sidebar (not the page) so the open guide is in view: with
 * 44 guides the list is taller than the window, and the last ones were
 * marked as current below its bottom edge, where nobody could see them.
 */
export function ActiveInView({ containerId }: { containerId: string }) {
  useEffect(() => {
    const box = document.getElementById(containerId);
    const active = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!box || !active || box.scrollHeight <= box.clientHeight) return;
    const top = active.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top + active.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 3);
    }
  }, [containerId]);
  return null;
}
