"use client";

import { nextChoice, themeSwitchLabel, useTheme } from "@/components/providers/ThemeProvider";
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

/** Shown while <html> names this choice; System when it names none yet. */
const SHOW = {
  system: "[html[data-theme-choice=light]_&]:hidden [html[data-theme-choice=dark]_&]:hidden",
  light: "hidden [html[data-theme-choice=light]_&]:inline",
  dark: "hidden [html[data-theme-choice=dark]_&]:inline",
} as const;

/**
 * The bar's theme switch: System, Light or Dark, one press at a time
 * (nextChoice: the first press always changes the look, and System is always
 * a press or two away). It used to flip between Light and Dark only, so a
 * reader who pressed it once never followed their system again on a
 * computer. Drawn on the server and correct before any script runs: the
 * theme script names the choice on <html> before the page paints, and CSS
 * picks the icon and the button's name from it; each is in the markup three
 * times. The icon turns a quarter on a press (S17), on the spring.
 */
export function ThemeToggle() {
  const { theme, systemTheme, setTheme } = useTheme();
  const turn = "transition-transform duration-panel ease-spring motion-safe:group-active:rotate-90";
  // Once the choice and the system are known (straight after hydration), the
  // tooltip and the name say the mode and what a press does; before then the
  // spans below name the mode, picked by CSS.
  const label = theme && systemTheme ? themeSwitchLabel(theme, systemTheme) : undefined;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        if (theme && systemTheme) fadeTo(setTheme, nextChoice(theme, systemTheme));
      }}
      {...ix("icon")}
      className="group inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground lg:h-8 lg:w-8"
    >
      <span className={`sr-only ${SHOW.system}`}>Theme follows your device. Change theme</span>
      <span className={`sr-only ${SHOW.light}`}>Theme is light. Change theme</span>
      <span className={`sr-only ${SHOW.dark}`}>Theme is dark. Change theme</span>
      {/* The quarter turn is motion, so it waits for motion to be welcome
          (storefront audit G6: it still turned, instantly, for reduced motion). */}
      <Icon name="monitor" className={`${turn} ${SHOW.system}`} />
      <Icon name="sun" className={`${turn} ${SHOW.light}`} />
      <Icon name="moon" className={`transition-transform duration-panel ease-spring motion-safe:group-active:-rotate-90 ${SHOW.dark}`} />
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
