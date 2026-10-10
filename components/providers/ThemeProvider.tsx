"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * The site follows the reader's system theme (owner decision D9, 11 Oct
 * 2026): technical buyers often run dark, and the dark theme was finished but
 * only shown to readers who pressed the toggle. The toggle still overrides it.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}