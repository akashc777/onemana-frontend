import privacyPolicy from "@/content/legal/privacy-policy.md?raw";
import termsOfService from "@/content/legal/terms-of-service.md?raw";
import refundPolicy from "@/content/legal/refund-policy.md?raw";
import taxesOnServices from "@/content/legal/taxes-on-services.md?raw";
import accountOwnershipPolicy from "@/content/legal/account-ownership-policy.md?raw";
import type { Metadata } from "next";
import { renderMarkdown } from "./markdown";

// The site's legal pages.
//
// ONE SOURCE. A page's words are content/legal/<slug>.md, built into the page
// as text (next.config.mjs) and rendered with the site's Markdown renderer.
// This file holds only what is not the policy's text: its name, its subtitle,
// the contact line under it and the date it last changed. The words used to
// be HTML typed in here beside a Page Builder export in content/, and the two
// had drifted: the export still said prices exclude tax. lib/legalPages.test.tsx
// holds every page to its file.
//
// `updated` is the date shown at the top of each page as "Last updated". The
// privacy policy promises that a change moves it ("If we change this policy,
// we update the date at the top"), and the same test pins each page's words to
// its date, so changing the words without moving the date fails.
//
// ONE NAME. `title` is the page's name everywhere: its H1 (LegalPageView), its
// tab (legalMetadata) and every link to it, in the footer, the checkout, the
// audience pages and the other policies (lib/legalPages.test.tsx reads them
// all). The footer called the taxes page "Tax and invoices", the India page
// "Taxes on our services" and its own H1 "Taxes on services"; it is "Tax and
// invoices" now, the name that says what a buyer finds there.
export interface LegalPage {
  title: string;
  subtitle: string;
  /** The page's words as written, in Markdown. */
  source: string;
  bodyHtml: string;
  note: string;
  updated: string;
}

const NOTE = 'If you have any questions about this policy, please contact us at <a href="mailto:support@onemana.dev" class="link">support@onemana.dev</a>.';

function legalPage(title: string, subtitle: string, source: string, updated: string): LegalPage {
  return { title, subtitle, source, bodyHtml: renderMarkdown(source), note: NOTE, updated };
}

export const legalPages: Record<string, LegalPage> = {
  "privacy-policy": legalPage("Privacy policy", "What we collect, why, and for how long.", privacyPolicy, "2026-10-01"),
  "terms-of-service": legalPage("Terms of service", "", termsOfService, "2026-10-15"),
  "refund-policy": legalPage("Refund policy", "", refundPolicy, "2026-06-10"),
  "taxes-on-services": legalPage("Tax and invoices", "", taxesOnServices, "2026-10-15"),
  "account-ownership-policy": legalPage("Account ownership policy", "", accountOwnershipPolicy, "2026-10-15"),
};

/** A legal page's tab title and canonical address: its own name, as its H1 says it. */
export function legalMetadata(slug: string): Metadata {
  const page = legalPages[slug];
  if (!page) throw new Error(`no legal page "${slug}"`);
  return { title: page.title, alternates: { canonical: `/${slug}` } };
}
