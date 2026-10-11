import type { Config } from "tailwindcss";

import { APP, tracking } from "./lib/appSystem";
import appSystem, { alphaColour, appTheme } from "./lib/tailwindAppSystem";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        /** Placeholders and disabled text only: it is not body-text contrast. */
        faint: "rgb(var(--faint) / <alpha-value>)",
        // Hairlines are ink at a low alpha (design v3): border is --line,
        // strong is --line-3, so one token reads on the page, a card and a menu.
        border: {
          DEFAULT: alphaColour("line"),
          subtle: alphaColour("line", 0.6),
          strong: alphaColour("line-3"),
        },
        line: { DEFAULT: alphaColour("line"), 2: alphaColour("line-2"), 3: alphaColour("line-3") },
        hover: alphaColour("hover"),
        press: alphaColour("press"),
        sel: alphaColour("sel"),
        pop: "rgb(var(--pop) / <alpha-value>)",
        "ink-4": "rgb(var(--ink-4) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        card: "rgb(var(--card) / <alpha-value>)",
        /** The pressed step, the app's bg-highlight: --press as an alpha. */
        highlight: alphaColour("press"),
        agent: {
          DEFAULT: "rgb(var(--agent) / <alpha-value>)",
          foreground: "rgb(var(--agent-foreground) / <alpha-value>)",
          muted: "rgb(var(--agent-muted) / <alpha-value>)",
          ink: "rgb(var(--agent-ink) / <alpha-value>)",
        },
        ring: "rgb(var(--ring) / <alpha-value>)",
        // Pointed at the tokens, never hardcoded, so the palette in globals.css
        // is the one source of truth and the one the product shares.
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          /** Text on a brand fill: white in light mode, near black in dark. */
          foreground: "rgb(var(--brand-foreground) / <alpha-value>)",
          /** The accent as text (links): a step deeper than the fill, for AA. */
          ink: "rgb(var(--brand-ink) / <alpha-value>)",
          /** A selected background. */
          soft: "rgb(var(--brand-soft) / <alpha-value>)",
          // Derived from the one value, so a hover cannot drift from its button.
          dark: "color-mix(in oklab, rgb(var(--brand)) 88%, black)",
          light: "color-mix(in oklab, rgb(var(--brand)) 76%, white)",
          subtle: "rgb(var(--brand) / 0.10)",
        },
        success: { DEFAULT: "rgb(var(--success) / <alpha-value>)", ink: "rgb(var(--success-ink) / <alpha-value>)" },
        warning: { DEFAULT: "rgb(var(--warning) / <alpha-value>)", ink: "rgb(var(--warning-ink) / <alpha-value>)" },
        danger: { DEFAULT: "rgb(var(--danger) / <alpha-value>)", ink: "rgb(var(--danger-ink) / <alpha-value>)" },
        info: { DEFAULT: "rgb(var(--info) / <alpha-value>)", ink: "rgb(var(--info-ink) / <alpha-value>)" },
        // The camp palette, six identity hues in three cuts (globals.css):
        // bg-camp-sky-tint, text-camp-sky-ink, fill-camp-sky and so on.
        camp: Object.fromEntries(
          ["sun", "moss", "lake", "sky", "dusk", "berry"].map((hue) => [
            hue,
            {
              DEFAULT: `rgb(var(--camp-${hue}) / <alpha-value>)`,
              tint: `rgb(var(--camp-${hue}-tint) / <alpha-value>)`,
              ink: `rgb(var(--camp-${hue}-ink) / <alpha-value>)`,
            },
          ]),
        ),
        // The current hue, set by a hue-* class (globals.css): bg-hue-tint,
        // text-hue-ink, fill-hue, stroke-hue.
        hue: {
          DEFAULT: "rgb(var(--hue) / <alpha-value>)",
          tint: "rgb(var(--hue-tint) / <alpha-value>)",
          ink: "rgb(var(--hue-ink) / <alpha-value>)",
        },
        ink: "rgb(var(--foreground) / <alpha-value>)",
        canvas: {
          /** The frame: the nav and the gutter round the sheet, the app's bg-canvas. */
          DEFAULT: "rgb(var(--canvas) / <alpha-value>)",
          soft: "rgb(var(--muted) / <alpha-value>)",
          raised: "rgb(var(--card) / <alpha-value>)",
        },
      },
      // A border with no colour of its own is a hairline in the token, as the
      // app's base layer has it (* { border-border }), not Tailwind's gray-200.
      borderColor: {
        DEFAULT: "var(--line-c)",
      },
      fontFamily: {
        // The one-glyph rupee faces come first (lib/fonts.ts): their
        // unicode-range is U+20B9 alone, so they draw ₹ and nothing else.
        sans: ["var(--font-rupee)", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Inter Display: the same Inter at its opsz 32 cut (globals.css sets
        // the axis on headings and .font-display). Inter Tight is retired.
        display: ["var(--font-rupee)", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      // The marketing scale (DESIGN_V3.md §3.6). Size / line height /
      // tracking. The sizes are the site's own layouts; the tracking is
      // Inter's for each size, and the hero's display steps take the spec's
      // -0.024em (Inter Display at 600).
      fontSize: {
        display: ["4rem", { lineHeight: "4.25rem", letterSpacing: `${APP.marketing.hero.tracking}em` }],
        "display-md": ["3.5rem", { lineHeight: "3.6875rem", letterSpacing: `${APP.marketing.hero.tracking}em` }],
        "display-sm": ["2.75rem", { lineHeight: "2.875rem", letterSpacing: `${APP.marketing.hero.tracking}em` }],
        h1: ["3rem", { lineHeight: "3.25rem", letterSpacing: `${tracking(48)}em` }],
        title: ["2.25rem", { lineHeight: "2.625rem", letterSpacing: `${tracking(36)}em` }],
        "title-sm": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: `${tracking(30)}em` }],
        h2: ["2rem", { lineHeight: "2.375rem", letterSpacing: `${tracking(32)}em` }],
        h3: appTheme.fontSize.h3,
        "body-lg": ["1.125rem", { lineHeight: "1.75rem", letterSpacing: `${tracking(18)}em` }],
        body: ["1rem", { lineHeight: "1.625rem", letterSpacing: `${tracking(16)}em` }],
        small: appTheme.fontSize.small,
        caption: appTheme.fontSize.caption,
      },
      maxWidth: {
        content: "1120px",
        prose: "720px",
      },
      // The app's radii, elevation and timing, from the one table
      // (lib/appSystem.ts, built by lib/tailwindAppSystem.ts), design v3:
      // 4 kbd, 6 chips, 8 controls, 12 cards, 16 dialogs, 20 the canvas; the
      // e1 to e4 ladder; 140 ms on the out-curve, the spring for a knob.
      borderRadius: appTheme.borderRadius,
      boxShadow: appTheme.boxShadow,
      transitionDuration: appTheme.transitionDuration,
      transitionTimingFunction: appTheme.transitionTimingFunction,
      keyframes: {
        // DESIGN.md, Motion: a popover arrives in 160 ms, opacity plus 4 px.
        "popover-in": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // A celebration's sparks leave the element they celebrate (the
        // playful layer: 300 to 500 ms, never on routine actions). Each spark
        // sets --spark-x and --spark-y, the way back to the element's centre.
        "spark-out": {
          "0%": { opacity: "0", transform: "translate(var(--spark-x), var(--spark-y)) scale(0.3)" },
          "40%": { opacity: "1" },
          "100%": { opacity: "1", transform: "translate(0, 0) scale(1)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scene-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.995)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "icon-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.06)" },
          "100%": { transform: "scale(1)" },
        },
        // The springy check (the playful layer): 1 -> 1.12 -> 1, as the app's.
        "spring-pop": {
          "0%, 100%": { scale: "1" },
          "45%": { scale: "1.12" },
        },
      },
      animation: {
        "popover-in": "popover-in 180ms cubic-bezier(.22,1,.36,1) both",
        "spark-out": "spark-out 460ms cubic-bezier(0.3,1.35,0.5,1) both",
        "fade-up": "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "scene-in": "scene-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        marquee: "marquee 45s linear infinite",
        "icon-pop": "icon-pop 0.35s ease-out",
        spring: "spring-pop 220ms cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), appSystem],
};

export default config;