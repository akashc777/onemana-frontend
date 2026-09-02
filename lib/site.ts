// Central site configuration. Values that differ per environment come from
// NEXT_PUBLIC_* env vars with sensible production defaults.

export const site = {
  name: "OneCamp",
  company: "OneMana Solutions (OPC) Private Limited",
  // Leads with governance rather than "one workspace", which described the category and not the reason
  // to choose this one. See the header of lib/content.ts for the argument.
  tagline: "Governed AI. Your infrastructure.",
  description:
    "OneCamp is a self-hosted workspace where AI agents are bounded by the live permissions of the person who authorised them, and no agent action runs unless it is recorded first. Tamper-evident audit log, SAML, OIDC, LDAP, SCIM, and MFA included. Chat, docs, tasks, tables, whiteboards, video, and calendar in one Docker deploy. Pay once, unlimited users.",
  url: "https://onemana.dev",
  backendUrl:
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "https://backend.onemana.dev",
  demoUrl: process.env.NEXT_PUBLIC_DEMO_URL || "https://onecamp.onemana.dev",
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/OneMana-Soft/OneCamp-fe",
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO || "OneMana-Soft/OneCamp-fe",
  docsPath: "/docs",
  // Static display fallbacks (live values come from /onecamp/pricing, which is
  // admin-editable). Charges are always enforced server-side in INR.
  priceInr: 9999,
  priceUsd: 99,
  // OneCamp Cloud - managed hosting, monthly subscription (charged in INR).
  cloudPriceUsd: 99,
  cloudPriceInr: 9999,
  cloudSeats: 30,
  demoVideoId: "t0IpX9IZcmg",
  version: "2",
  twitter: "https://twitter.com/akashc777",
};

export const navLinks = [
  { label: "Tour", href: "/#tour" },
  // Named "Governance" rather than "Security". Security reads as a trust page full of badges; this is a
  // product argument, and it is the reason to choose OneCamp over an AI workspace that is easier to buy.
  { label: "Governance", href: "/#governance" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/docs" },
];

export const footerLinks = {
  Product: [
    { label: "Product tour", href: "/#tour" },
    { label: "Governance", href: "/#governance" },
    { label: "Enterprise controls", href: "/#enterprise" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
    { label: "Blog", href: "/blog" },
    { label: "Live Demo", href: site.demoUrl, external: true },
    { label: "Setup Docs", href: "/docs" },
    { label: "GitHub", href: site.githubUrl, external: true },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "My Account", href: "/account" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ],
  Policies: [
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Account Ownership", href: "/account-ownership-policy" },
    { label: "Taxes on Services", href: "/taxes-on-services" },
  ],
};
