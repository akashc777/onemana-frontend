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
const CHOICE_ATTR = "data-theme-choice";

const isChoice = (value: unknown): value is ThemeChoice => value === "light" || value === "dark" || value === "system";

/**
 * The browser's bar (theme-color) in the chosen theme. The layout gives one
 * colour per system scheme, by media query, so a reader who chose Light on a
 * dark system had a dark bar over a light page. A chosen theme's own meta
 * applies everywhere and the other nowhere; System puts the queries back.
 * Self-contained: the theme script inlines it.
 */
export function pinThemeColor(choice: string | null) {
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((m) => {
    let own = m.getAttribute("data-media");
    if (own === null) {
      own = m.getAttribute("media") || "";
      m.setAttribute("data-media", own);
    }
    m.setAttribute("media", choice === "light" || choice === "dark" ? (own.includes(choice) ? "all" : "not all") : own);
  });
}

/** pinThemeColor as the theme script runs it, before React; themeChoice.test runs both. */
const PIN_SCRIPT = `document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){var o=m.getAttribute("data-media");if(o===null){o=m.getAttribute("media")||"";m.setAttribute("data-media",o)}m.setAttribute("media",c?(o.indexOf(c)>-1?"all":"not all"):o)})`;

/**
 * Runs before the page paints, as the first thing in <body>. It does what
 * applyTheme() does; a stored choice it cannot read means following the system.
 * It also names the choice on <html> (data-theme-choice), so the bar's switch
 * shows System, Light or Dark from the first paint (components/site/ThemeToggle).
 */
export const THEME_SCRIPT = `(function(){var d=document.documentElement,c=null;try{c=localStorage.getItem(${JSON.stringify(KEY)})}catch(e){}if(c!=="light"&&c!=="dark")c=null;var t=c||(matchMedia(${JSON.stringify(MEDIA)}).matches?"dark":"light");d.classList.remove("light","dark");d.classList.add(t);d.style.colorScheme=t;d.setAttribute(${JSON.stringify(CHOICE_ATTR)},c||"system");${PIN_SCRIPT}})()`;

/**
 * The bar's switch, one press at a time: from System to the look the system
 * is not showing, then to the system's look kept whatever the system does,
 * then back to System. Every state is a press or two away, and the first
 * press always changes what the page looks like.
 */
export function nextChoice(choice: ThemeChoice, system: Resolved): ThemeChoice {
  if (choice === "system") return system === "dark" ? "light" : "dark";
  return choice === system ? "system" : system;
}

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
  // Unknown in the first render, in the browser as on the server, and read
  // straight after. React 18 keeps the server's attributes when the first
  // client render differs: reading the choice in the first render left the
  // phone menu saying System to a reader who had chosen Dark (themeChoice.test).
  // The page already wears the right theme: the script put it there.
  const [theme, setThemeState] = useState<ThemeChoice | undefined>(undefined);
  const [systemTheme, setSystemTheme] = useState<Resolved | undefined>(undefined);
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    setThemeState(readChoice());
    setSystemTheme(systemNow());
  }, []);

  // The choice, named on <html> for the bar's switch.
  useEffect(() => {
    if (!theme) return;
    document.documentElement.setAttribute(CHOICE_ATTR, theme);
    pinThemeColor(theme);
  }, [theme]);

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

  // System clears the override: nothing is kept, and the page follows the
  // system as it does for a reader who never chose.
  const setTheme = useCallback((next: string) => {
    const choice = isChoice(next) ? next : "system";
    setThemeState(choice);
    try {
      if (choice === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, choice);
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
