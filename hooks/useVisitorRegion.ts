"use client";

import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";
import { detectRegion, type Region } from "@/lib/visitorCurrency";

/**
 * The visitor's region (lib/visitorCurrency), for the words and estimates
 * that depend on it.
 *
 * NULL UNTIL MOUNT. The server cannot know where a reader is, so its HTML
 * says the neutral thing (a dollar estimate, no GST wording) and the page
 * switches after mount, as /buy's country field does. A provider fixes the
 * region instead: tests render each region on the server with it, and a page
 * that already knows (the receipt, from its checkout) passes it down.
 */
const RegionContext = createContext<Region | null | undefined>(undefined);

export function RegionProvider({ region, children }: { region: Region | null; children: ReactNode }) {
  return createElement(RegionContext.Provider, { value: region }, children);
}

let detected: Region | null = null;

export function useVisitorRegion(): Region | null {
  const fixed = useContext(RegionContext);
  const [region, setRegion] = useState<Region | null>(fixed ?? null);
  useEffect(() => {
    if (fixed !== undefined) return;
    detected ??= detectRegion();
    setRegion(detected);
  }, [fixed]);
  return fixed !== undefined ? fixed : region;
}
