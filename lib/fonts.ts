import { Archivo, Instrument_Sans, JetBrains_Mono } from "next/font/google";

/**
 * Typefaces.
 *
 * WHY NOT INTER. Inter was the body face here, and it is the single most common
 * fingerprint of a generated marketing page: it is the default every tool reaches
 * for, so a site wearing it reads as untouched before anyone has read a word. It
 * is a fine typeface and that is the problem.
 *
 * The pairing is picked for what this product actually is. OneCamp is
 * infrastructure a customer runs on their own hardware, so the register is
 * operational and industrial rather than consumer-friendly.
 *
 *   Archivo         display and headings. A grotesque with real weight at the top
 *                   end, which is what lets a headline carry a page without being
 *                   set enormous.
 *   Instrument Sans running text and UI. Readable small, slightly narrower than
 *                   Inter, and not the default.
 *   JetBrains Mono  licence keys, commands, tech chips. Kept: it was already the
 *                   right call and changing it would buy nothing.
 */

/** Display face. Headings only, so the weight range is worth the bytes. */
export const fontDisplay = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

/** Primary UI typeface, loaded once via next/font and exposed as a CSS variable. */
export const fontSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/** Code, license keys, and tech chips only. */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
