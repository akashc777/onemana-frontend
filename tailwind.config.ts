import type { Config } from "tailwindcss";

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
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          subtle: "rgb(var(--border) / 0.6)",
          strong: "rgb(var(--border-strong) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        card: "rgb(var(--card) / <alpha-value>)",
        agent: {
          DEFAULT: "rgb(var(--agent) / <alpha-value>)",
          foreground: "rgb(var(--agent-foreground) / <alpha-value>)",
          muted: "rgb(var(--agent-muted) / <alpha-value>)",
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
          DEFAULT: "rgb(var(--background) / <alpha-value>)",
          soft: "rgb(var(--muted) / <alpha-value>)",
          raised: "rgb(var(--card) / <alpha-value>)",
        },
      },
      fontFamily: {
        // The one-glyph rupee faces come first (lib/fonts.ts): their
        // unicode-range is U+20B9 alone, so they draw ₹ and nothing else.
        sans: ["var(--font-rupee)", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-rupee-display)", "var(--font-display-face)", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      // The marketing scale (DESIGN.md, Type). Size / line height / tracking.
      // The display headline steps down on a tablet and a phone; a page's
      // title (h1) is "title" on a phone; a reading page's title (a guide, a
      // policy, the account) is title-sm on a phone and title from sm.
      fontSize: {
        display: ["4rem", { lineHeight: "4.25rem", letterSpacing: "-0.032em" }],
        "display-md": ["3.5rem", { lineHeight: "3.6875rem", letterSpacing: "-0.03em" }],
        "display-sm": ["2.75rem", { lineHeight: "2.875rem", letterSpacing: "-0.03em" }],
        h1: ["3rem", { lineHeight: "3.25rem", letterSpacing: "-0.026em" }],
        title: ["2.25rem", { lineHeight: "2.625rem", letterSpacing: "-0.024em" }],
        "title-sm": ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.022em" }],
        h2: ["2rem", { lineHeight: "2.375rem", letterSpacing: "-0.016em" }],
        h3: ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.75rem" }],
        body: ["1rem", { lineHeight: "1.625rem" }],
        small: ["0.875rem", { lineHeight: "1.25rem" }],
        caption: ["0.8125rem", { lineHeight: "1.125rem" }],
      },
      maxWidth: {
        content: "1120px",
        prose: "720px",
      },
      // Four radii. 4: chips, kbd, checkboxes. 6: buttons, inputs. 10: cards,
      // popovers, menus. 14: dialogs and sheets. Full is for avatars and dots.
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.375rem",
        lg: "0.625rem",
        xl: "0.625rem",
        "2xl": "0.875rem",
      },
      // Shadows only for things that float. Cards, inputs and buttons have none:
      // structure is a hairline.
      boxShadow: {
        sm: "none",
        card: "none",
        product: "none",
        elevated: "0 4px 16px rgb(0 0 0 / 0.08)",
        popover: "0 4px 16px rgb(0 0 0 / 0.08)",
        dialog: "0 16px 48px rgb(0 0 0 / 0.16)",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(.2,.8,.2,1)",
        // A knob that travels lands with a slight overshoot (ease-spring).
        spring: "cubic-bezier(0.3,1.35,0.5,1)",
      },
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
        "popover-in": "popover-in 160ms cubic-bezier(.2,.8,.2,1) both",
        "spark-out": "spark-out 460ms cubic-bezier(0.3,1.35,0.5,1) both",
        "fade-up": "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "scene-in": "scene-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        marquee: "marquee 45s linear infinite",
        "icon-pop": "icon-pop 0.35s ease-out",
        spring: "spring-pop 220ms cubic-bezier(0.2,0.8,0.2,1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;