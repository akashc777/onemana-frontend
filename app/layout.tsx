import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontMono, fontRupee, fontSans } from "@/lib/fonts";
import { site } from "@/lib/site";
import { getPricing } from "@/lib/pricing";
import { getOpenSource } from "@/lib/github";
import { jsonLdScript } from "@/lib/jsonLd";
import { defaultOgImages, defaultTwitterImages, OG_DESCRIPTION, OG_TITLE } from "@/lib/og-card";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { VisitorTracker } from "@/components/site/VisitorTracker";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SHARED, tripleToHex } from "@/lib/appSystem";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · Team chat, docs, tasks and calls on your own server`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  // Keywords lead with what this is now sold on. The alternative-to terms stay, because they are how
  // people still search and they cost nothing, but they are no longer the front of the list — a page
  // that presents itself as a Slack alternative gets compared to Slack, which is the comparison this
  // repositioning exists to stop inviting.
  keywords: [
    "governed AI",
    "AI agent permissions",
    "AI audit log",
    "self-hosted AI workspace",
    "SCIM provisioning",
    "SAML SSO self-hosted",
    "AI data residency",
    "self-hosted workspace",
    "Slack alternative",
    "Notion alternative",
    "open source team chat",
    "OneCamp",
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
  // The page's own colour in each mode, from the one table.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: tripleToHex(SHARED.light.background!) },
    { media: "(prefers-color-scheme: dark)", color: tripleToHex(SHARED.dark.background!) },
  ],
  width: "device-width",
  initialScale: 1,
};

// Built per render from the same source the page quotes, because this used to be
// a second hardcoded copy: an admin price change updated the page and left the
// structured data telling search engines the old number.
function buildJsonLd(lifetimeInr: number, lifetimeUsd: number, cloudInr: number, cloudUsd: number) {
  return {
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
          { "@type": "Offer", price: String(lifetimeInr), priceCurrency: "INR", name: `Lifetime self-host licence (≈ $${lifetimeUsd})` },
          { "@type": "Offer", price: String(cloudInr), priceCurrency: "INR", name: `OneCamp Cloud - managed hosting, monthly (≈ $${cloudUsd})` },
        ],
      },
    ],
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The open-source read is kept an hour (lib/github.ts); null when GitHub is
  // silent, and the nav then says "GitHub" with no number.
  const [pricing, openSource] = await Promise.all([getPricing(), getOpenSource()]);
  const jsonLd = buildJsonLd(pricing.lifetime_inr, pricing.lifetime_usd, pricing.cloud_inr, pricing.cloud_usd);
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} ${fontRupee.variable}`}
      suppressHydrationWarning
    >
      {/* font-sans, not Inter's own class: the stack puts the one-glyph rupee
          face first (lib/fonts.ts), which Inter's class would leave out. */}
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <ThemeProvider>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
          <VisitorTracker />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
          >
            Skip to content
          </a>
          <Nav stars={openSource?.stars ?? null} />
          {/* The app's frame: the nav and the gutter are the canvas (the
              warm wash), and the page is one sheet on it. On a phone the
              sheet is the whole width, as the app's is. */}
          <div className="site-sheet flex flex-1 flex-col">
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}