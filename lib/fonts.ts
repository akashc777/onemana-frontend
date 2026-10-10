import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

/** Text: everything dense, 13 to 18 px. A variable font, so every weight loads once. */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  // next/font's own fallback is a copy of Arial sized to match, which Android
  // and most Linux machines cannot load. With nothing after it, text set by
  // this class (the <body>) fell to the browser's serif until Inter arrived,
  // then jumped. Written out, as next/font reads only literals. Inter Tight
  // and JetBrains Mono are used only through their variables, which every
  // stack follows with these same families.
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/**
 * Display: headings only, at 500 and 600. Tight and quiet, in the way Linear
 * sets Inter Display. It replaced Bricolage Grotesque, whose quirky terminals
 * were the most recognisable face of template-built sites in 2025-26.
 */
export const fontDisplay = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
  weight: ["500", "600"],
});

/** Code, keys, identifiers and timestamps. Never eyebrows. */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

/**
 * THE RUPEE SIGN, ON ITS OWN. Inter and Inter Tight draw ₹, but Google Fonts
 * files it in their latin-ext subsets (85 and 90 kB), so every page with a
 * price downloaded both just to draw one character: 175 kB of fonts, at the
 * highest priority, before a phone could finish the hero. These two files
 * hold that one glyph (about 1 kB each, cut from the same fonts, wght axis
 * kept), and they come first in the stacks (tailwind.config.ts, globals.css)
 * with a unicode-range of U+20B9 alone: the browser asks them for ₹ and
 * nothing else, so it never needs latin-ext.
 *
 * Preloaded, because they are tiny and must be there before the first ₹ is
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

export const fontRupeeDisplay = localFont({
  src: "./font-files/inter-tight-rupee.woff2",
  variable: "--font-rupee-display",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+20B9" }],
});
