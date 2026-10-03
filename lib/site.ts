// Central site configuration. Values that differ per environment come from
// NEXT_PUBLIC_* env vars with sensible production defaults.

export const site = {
  name: "OneCamp",
  company: "OneMana Solutions (OPC) Private Limited",
  // Leads with governance rather than "one workspace", which described the category and not the reason
  // to choose this one. See the header of lib/content.ts for the argument.
  tagline: "Like Slack, Notion and Zoom in one app. Free for up to 25 people.",
  description:
    "OneCamp is your team's chat, docs, tasks and video calls in one app that runs on your own server, like Slack, Notion and Zoom together. Its AI agents can only do what you are allowed to do, and everything they do is logged. Open source, free for up to 25 people, pay once for more.",
  url: "https://onemana.dev",
  backendUrl:
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "https://backend.onemana.dev",
  demoUrl: process.env.NEXT_PUBLIC_DEMO_URL || "https://onecamp.onemana.dev",
  // Where a "try the demo" link should actually point.
  //
  // The demo host answers on demoUrl with a SIGN-IN page, where the demo is the
  // last option under Google, GitHub, email and LDAP. Somebody who just clicked
  // "try the demo" has already answered the question that page asks. This
  // parameter tells the demo host to start the demo instead of asking again;
  // the host ignores it unless its own server reports demo login available, so
  // it does nothing on a customer's install.
  //
  // Derived rather than folded into demoUrl so the canonical address stays clean
  // for display, an operator overriding NEXT_PUBLIC_DEMO_URL cannot drop the
  // parameter by forgetting it, and the click tracker's startsWith(demoUrl)
  // match keeps working.
  get demoStartUrl() {
    return `${this.demoUrl}${this.demoUrl.includes("?") ? "&" : "?"}start_demo=1`;
  },
  /**
   * A demo link that names where it is going.
   *
   * `start_demo=1` signs a visitor in and leaves them on the home screen. That
   * is right for a link labelled "live demo" and wrong for one labelled "run
   * the drill", which is what the compare page has: the button named an action
   * and performed a login. The demo reads this value as a destination and lands
   * on the drill, running it once.
   */
  demoDrillUrl(): string {
    return `${this.demoUrl}${this.demoUrl.includes("?") ? "&" : "?"}start_demo=drill`;
  },
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/OneMana-Soft/OneCamp-fe",
  /** The open-source server (AGPL-3.0). */
  serverGithubUrl: "https://github.com/OneMana-Soft/OneCamp",
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO || "OneMana-Soft/OneCamp-fe",
  /** Every public OneCamp repository. The star badge counts all of them and
   *  links to the organisation, so the number and the place it sends people
   *  agree: it used to show the web app's stars beside a link to the server. */
  githubOrgUrl: "https://github.com/OneMana-Soft",
  githubRepos: ["OneMana-Soft/OneCamp", "OneMana-Soft/OneCamp-fe", "OneMana-Soft/OneCamp-desktop"] as const,
  docsPath: "/docs",
  // Rupee fallbacks for anything rendered without the backend. There are no
  // dollar constants: dollars are the rupee price at the day's rate, from
  // /onecamp/pricing (see lib/pricing.ts). Charges are always in INR.
  priceInr: 24999,
  cloudPriceInr: 9999,
  cloudSeats: 30,
  demoVideoId: "FvLeilbRKOo", // the launch film (92 s), recorded in the live demo
  version: "2",
  twitter: "https://twitter.com/akashc777",
};

export const navLinks = [
  { label: "Tour", href: "/#tour" },
  // Named "Safe AI" (was "Governance", 3 Oct 2026): a first-time visitor knows what safe AI means; "governance" needs explaining. Not "Security": that reads as a trust page full of badges; this is a
  // product argument, and it is the reason to choose OneCamp over an AI workspace that is easier to buy.
  { label: "Safe AI", href: "/#governance" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/docs" },
];

export const footerLinks = {
  Product: [
    { label: "Product tour", href: "/#tour" },
    // The homepage stopped arguing "replaces Slack, Notion, Asana, Zoom" on
    // purpose. /compare is where that argument moved, so it has to be reachable
    // from somewhere or it is a page only a search engine ever sees.
    { label: "Compare", href: "/compare" },
    { label: "Safe AI", href: "/#governance" },
    { label: "Enterprise controls", href: "/#enterprise" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
    { label: "Blog", href: "/blog" },
    { label: "Live Demo", href: site.demoStartUrl, external: true },
    { label: "Setup Docs", href: "/docs" },
    { label: "GitHub", href: site.githubOrgUrl, external: true },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "My Account", href: "/account" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ],
  Policies: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Account Ownership", href: "/account-ownership-policy" },
    { label: "Taxes on Services", href: "/taxes-on-services" },
  ],
};
