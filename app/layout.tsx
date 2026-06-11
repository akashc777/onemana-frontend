import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { SiteBackground } from "@/components/site/SiteBackground";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { VisitorTracker } from "@/components/site/VisitorTracker";
import { getGithubStars } from "@/lib/github";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - The self-hosted workspace for the AI era`,
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
    title: `${site.name}. The workspace for the AI era. Yours forever.`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OneCamp. Self-hosted workspace with chat, tasks, docs, video, and local AI.",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}. One workspace. Yours forever.`,
    description: site.description,
    images: ["/twitter-image"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export const viewport: Viewport = {
  themeColor: "#06060a",
  width: "device-width",
  initialScale: 1,
};

// Organization + SoftwareApplication structured data for search + AI agents.
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
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SiteBackground />
        <ScrollProgress />
        <VisitorTracker />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Nav stars={stars} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
