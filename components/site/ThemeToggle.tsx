"use client";

import { useTheme } from "next-themes";

/**
 * Light or dark, drawn on the server and correct before any script runs.
 *
 * It used to wait for a mounted flag and render an empty square until then,
 * because the server cannot know the theme; the icon popped in after
 * hydration. next-themes sets the theme class on <html> before the page
 * paints, so CSS can choose both the icon and the button's name: each is in
 * the markup twice and the `dark:` variant shows one. display:none also
 * takes the other name out of the accessibility tree, so one is read.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex h-11 w-11 items-center justify-center rounded-md lg:h-8 lg:w-8 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <span className="sr-only dark:hidden">Switch to dark mode</span>
      <span className="sr-only hidden dark:inline">Switch to light mode</span>
      <svg className="h-4 w-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round" />
      </svg>
      <svg className="hidden h-4 w-4 dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
