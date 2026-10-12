"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * The site follows the reader's system theme (owner decision D9, 11 Oct
 * 2026): technical buyers often run dark, and the dark theme was finished but
 * only shown to readers who pressed the toggle. The toggle still overrides it.
 *
 * This is what next-themes did, without its cost on every load. The script
 * below puts the theme on <html> before the page paints, and the choice is
 * kept under the same localStorage key, so a reader's earlier choice holds.
 * next-themes then put it on again once React had loaded: it took the class
 * off and back on, and added and removed a stylesheet, and each of those
 * restyled every element on the page. On a throttled phone that was two long
 * tasks after the first paint, the longest on home (12 Oct 2026). Here the
 * page is touched only when the theme really changes: the reader chooses
 * one, the system changes while the page follows it, or another tab changes
 * it.
 */

export type ThemeChoice = "light" | "dark" | "system";
type Resolved = "light" | "dark";

const KEY = "theme";
const MEDIA = "(prefers-color-scheme: dark)";
const THEMES: ThemeChoice[] = ["light", "dark", "system"];

const isChoice = (value: unknown): value is ThemeChoice => value === "light" || value === "dark" || value === "system";

/**
 * Runs before the page paints, as the first thing in <body>. It does what
 * applyTheme() does; a stored choice it cannot read means following the system.
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement,c=null;try{c=localStorage.getItem(${JSON.stringify(KEY)})}catch(e){}var t=c==="light"||c==="dark"?c:matchMedia(${JSON.stringify(MEDIA)}).matches?"dark":"light";d.classList.remove("light","dark");d.classList.add(t);d.style.colorScheme=t})()`;

function readChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(KEY);
    return isChoice(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

const systemNow = (): Resolved => (window.matchMedia(MEDIA).matches ? "dark" : "light");

/**
 * Puts a theme on <html> when it is not already there, with transitions held
 * off for the change (next-themes' disableTransitionOnChange, kept as it was).
 */
export function applyTheme(theme: Resolved) {
  const html = document.documentElement;
  const other: Resolved = theme === "dark" ? "light" : "dark";
  if (html.classList.contains(theme) && !html.classList.contains(other) && html.style.colorScheme === theme) return;
  const hold = document.createElement("style");
  hold.appendChild(document.createTextNode("*,*::before,*::after{transition:none!important}"));
  document.head.appendChild(hold);
  html.classList.remove(other);
  html.classList.add(theme);
  html.style.colorScheme = theme;
  window.setTimeout(() => hold.remove(), 1);
}

type ThemeState = {
  /** The reader's choice; undefined on the server, which cannot know it. */
  theme: ThemeChoice | undefined;
  /** Light or dark, as the page wears it. */
  resolvedTheme: Resolved | undefined;
  systemTheme: Resolved | undefined;
  themes: ThemeChoice[];
  setTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeState>({
  theme: undefined,
  resolvedTheme: undefined,
  systemTheme: undefined,
  themes: THEMES,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Read in the browser for the first render, as next-themes did.
  const [theme, setThemeState] = useState<ThemeChoice | undefined>(() => (typeof window === "undefined" ? undefined : readChoice()));
  const [systemTheme, setSystemTheme] = useState<Resolved | undefined>(() => (typeof window === "undefined" ? undefined : systemNow()));
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  // The script has already put this theme on the page, so on load this only
  // looks; it writes when the theme changes.
  useEffect(() => {
    if (resolvedTheme) applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const media = window.matchMedia(MEDIA);
    const onChange = () => setSystemTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Another tab chose a theme.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setThemeState(isChoice(e.newValue) ? e.newValue : "system");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: string) => {
    const choice = isChoice(next) ? next : "system";
    setThemeState(choice);
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      // Storage refused (a private window, blocked site data): the choice holds for this page.
    }
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, systemTheme, themes: THEMES, setTheme }), [theme, resolvedTheme, systemTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
