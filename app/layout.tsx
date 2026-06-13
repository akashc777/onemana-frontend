import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontMono, fontSans } from "@/lib/fonts";
import { site } from "@/lib/site";
import { defaultOgImages, defaultTwitterImages, OG_DESCRIPTION, OG_TITLE } from "@/lib/og-card";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { SiteBackground } from "@/components/site/SiteBackground";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { VisitorTracker } from "@/components/site/VisitorTracker";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { getGithubStars } from "@/lib/github";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · The workspace for the AI era`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "self-hosted workspace",
    "Slack alternative",
    "Notion alternative",
    "open source team chat",
    "self-hosted AI",
    "OneCamp",
    "team collaboration",
    "managed hosting",
  ],
  applicationName: site.name,
  authors: [{ name: site.company }],
  alternates: { canonical: "/" },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_US",
    images: defaultOgImages,
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: defaultTwitterImages,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#191919" },
  ],
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.company,
      url: site.url,
      description: site.description,
    },
    {
      "@type": "SoftwareApplication",
      name: site.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Docker, Linux",
      description: site.description,
      offers: [
        { "@type": "Offer", price: "2000", priceCurrency: "INR", name: "Lifetime self-host license (≈ $19)" },
        { "@type": "Offer", price: "10000", priceCurrency: "INR", name: "OneCamp Cloud - managed hosting, monthly (≈ $99)" },
      ],
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const stars = await getGithubStars();
  return (
    <html lang="en" className={`${fontSans.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <body className={`${fontSans.className} flex min-h-screen flex-col font-sans antialiased`}>
        <ThemeProvider>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <SiteBackground />
          <ScrollProgress />
          <VisitorTracker />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
          >
            Skip to content
          </a>
          <Nav stars={stars} />
          <main id="main" className="flex-1 pb-20">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}