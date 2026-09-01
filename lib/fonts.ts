import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";

/** Primary UI typeface - loaded once via next/font, exposed as CSS variable + class. */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/**
 * Headings and product moments only. The same face the workspace uses, because
 * the marketing site and the thing it sells should not introduce themselves in
 * two different voices.
 */
export const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
  weight: ["600", "700"],
});

/** Code, license keys, and tech chips only. */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});