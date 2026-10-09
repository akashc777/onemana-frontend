import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

/** Text: everything dense, 13 to 18 px. A variable font, so every weight loads once. */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
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
