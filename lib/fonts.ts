import { Inter, JetBrains_Mono } from "next/font/google";

/** Primary UI typeface — loaded once via next/font, exposed as CSS variable + class. */
export const fontSans = Inter({
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