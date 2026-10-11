import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

/**
 * Inter for everything (design v3): a variable font with its optical-size
 * axis, so text takes the text cut and every heading Inter Display (opsz 32,
 * globals.css). One family, so every weight and both cuts load once.
 */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  axes: ["opsz"],
  // next/font's own fallback is a copy of Arial sized to match, which Android
  // and most Linux machines cannot load. With nothing after it, text set by
  // this class (the <body>) fell to the browser's serif until Inter arrived,
  // then jumped. Written out, as next/font reads only literals. JetBrains
  // Mono is used only through its variable, which every stack follows with
  // these same families.
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/** Code, keys, identifiers and timestamps. Never eyebrows. */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

/**
 * THE RUPEE SIGN, ON ITS OWN. Inter draws ₹, but Google Fonts files it in its
 * latin-ext subset (85 kB), so every page with a price downloaded it just to
 * draw one character, at the highest priority, before a phone could finish
 * the hero. This file holds that one glyph (about 1 kB, cut from the same
 * font, wght axis kept), and it comes first in the stacks (tailwind.config.ts, globals.css)
 * with a unicode-range of U+20B9 alone: the browser asks it for ₹ and
 * nothing else, so it never needs latin-ext.
 *
 * Preloaded, because it is tiny and must be there before the first ₹ is
 * drawn: a face still loading lets the browser fall through to the next one
 * in the stack, which is latin-ext again. No fallback face either, which
 * next/font would otherwise add without a unicode-range and so put Arial in
 * front of Inter for every character.
 */
export const fontRupee = localFont({
  src: "./font-files/inter-rupee.woff2",
  variable: "--font-rupee",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+20B9" }],
});
