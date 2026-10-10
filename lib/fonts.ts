import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

/*
 * Each face ends in a generic family. next/font's own fallback is a copy of
 * Arial sized to match, which phones without Arial (Android) and most Linux
 * machines cannot load; with nothing after it, the body text (set by the
 * class on <body>) fell to the browser's default serif until Inter arrived,
 * then jumped when it did. The lists match the Tailwind stacks, and are
 * written out in each call because next/font only reads literals.
 */

/** Text: everything dense, 13 to 18 px. A variable font, so every weight loads once. */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
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
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/** Code, keys, identifiers and timestamps. Never eyebrows. */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});
