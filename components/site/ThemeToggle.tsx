"use client";

import { useTheme } from "next-themes";

/**
 * The page's colours cross-fade when the theme changes (site.md G8): the
 * html element carries .theme-fading for one pop's length, and only colour
 * and background transition, so nothing else moves.
 */
function fadeTo(set: (t: string) => void, theme: string) {
  const html = document.documentElement;
  html.classList.add("theme-fading");
  set(theme);
  window.setTimeout(() => html.classList.remove("theme-fading"), 240);
}

/**
 * Light or dark, drawn on the server and correct before any script runs.
 * next-themes sets the theme class on <html> before the page paints, so CSS
 * chooses both the icon and the button's name: each is in the markup twice
 * and the `dark:` variant shows one. The icon turns a quarter on a change
 * (S17), on the spring.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => fadeTo(setTheme, resolvedTheme === "dark" ? "light" : "dark")}
      className="group inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-hover hover:text-foreground lg:h-8 lg:w-8"
    >
      <span className="sr-only dark:hidden">Switch to dark mode</span>
      <span className="sr-only hidden dark:inline">Switch to light mode</span>
      <svg className="h-4 w-4 transition-transform duration-panel ease-spring dark:hidden group-active:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.875" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
      </svg>
      <svg className="hidden h-4 w-4 transition-transform duration-panel ease-spring group-active:-rotate-90 dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.875" aria-hidden>
        <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

const MODES = [
  ["light", "Light"],
  ["dark", "Dark"],
  ["system", "System"],
] as const;

/** The phone menu's theme row (S17): Light, Dark or System, as a segmented control. */
export function ThemeSegments() {
  const { theme, setTheme } = useTheme();
  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-ctl bg-muted p-0.5 ring-1 ring-inset ring-border">
      {MODES.map(([value, label]) => {
        const on = (theme ?? "system") === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => fadeTo(setTheme, value)}
            className={`min-h-9 rounded-md px-3 text-caption font-[510] transition-[background-color,box-shadow,color] ${on ? "bg-card text-foreground shadow-e1" : "text-muted-foreground"}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
