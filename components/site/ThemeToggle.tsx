"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Icon } from "@/components/ui/icons";
import { ix } from "@/lib/interactive";
import { Segmented } from "@/components/ui/Segmented";

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
 * The theme script sets the theme class on <html> before the page paints, so CSS
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
      {...ix("icon")}
      className="group inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground lg:h-8 lg:w-8"
    >
      <span className="sr-only dark:hidden">Switch to dark mode</span>
      <span className="sr-only hidden dark:inline">Switch to light mode</span>
      {/* The quarter turn is motion, so it waits for motion to be welcome
          (storefront audit G6: it still turned, instantly, for reduced motion). */}
      <Icon name="sun" className="transition-transform duration-panel ease-spring dark:hidden motion-safe:group-active:rotate-90" />
      <Icon name="moon" className="hidden transition-transform duration-panel ease-spring motion-safe:group-active:-rotate-90 dark:block" />
    </button>
  );
}

const MODES = ["light", "dark", "system"] as const;
const MODE_LABEL: Record<(typeof MODES)[number], string> = { light: "Light", dark: "Dark", system: "System" };

/**
 * The phone menu's theme row (S17): Light, Dark or System, a segmented
 * control (components/ui/Segmented): one Tab stop, the arrows move and
 * choose, and each segment is 44 px tall (storefront audit G11: 36 px, and
 * no arrow keys).
 */
export function ThemeSegments() {
  const { theme, setTheme } = useTheme();
  const value = MODES.find((m) => m === theme) ?? "system";
  return (
    <Segmented
      label="Theme"
      options={MODES}
      value={value}
      onChange={(m) => fadeTo(setTheme, m)}
      className="inline-flex rounded-ctl bg-muted p-0.5 ring-1 ring-inset ring-border"
      itemClass="min-h-11 rounded-md px-3 text-caption font-[510] text-muted-foreground"
      option={(m) => MODE_LABEL[m]}
    />
  );
}
