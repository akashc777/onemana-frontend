// Central site configuration. Values that differ per environment come from
// NEXT_PUBLIC_* env vars with sensible production defaults.

export const site = {
  name: "OneCamp",
  company: "OneMana Solutions (OPC) Private Limited",
  tagline: "One workspace. Yours forever.",
  description:
    "OneCamp is a self-hosted, all-in-one workspace - chat, tasks, docs, video, calendar, and a local AI assistant. One-time payment, unlimited users, your server.",
  url: "https://onemana.dev",
  backendUrl:
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "https://backend.onemana.dev",
  demoUrl: process.env.NEXT_PUBLIC_DEMO_URL || "https://onecamp.onemana.dev",
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/OneMana-Soft/OneCamp-fe",
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO || "OneMana-Soft/OneCamp-fe",
  docsPath: "/docs",
  // Static display fallbacks (live values come from /onecamp/pricing, which is
  // admin-editable). Charges are always enforced server-side in INR.
  priceInr: 2000,
  priceUsd: 19,
  // OneCamp Cloud - managed hosting, monthly subscription (charged in INR).
  cloudPriceUsd: 99,
  cloudPriceInr: 10000,
  cloudSeats: 30,
  demoVideoId: "hh5gwvLsAjA",
  twitter: "https://twitter.com/akashc777",
};

export const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/#faq" },
  { label: "Docs", href: "/docs" },
];

export const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Live Demo", href: site.demoUrl, external: true },
    { label: "Setup Docs", href: "/docs" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ],
  Policies: [
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Account Ownership", href: "/account-ownership-policy" },
    { label: "Taxes on Services", href: "/taxes-on-services" },
  ],
};
