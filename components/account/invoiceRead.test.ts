import { afterEach, describe, expect, it, vi } from "vitest";

// The portal's invoice read, answered here for whoever is signed in: no network in a test.
const portal = vi.hoisted(() => ({ signedIn: "", calls: 0 }));
vi.mock("@/lib/portalApi", () => ({
  portalApi: {
    invoices: async () => {
      portal.calls++;
      return [{ id: `inv-${portal.signedIn}`, invoice_no: `OM/${portal.signedIn}/1` }];
    },
  },
}));

import { loadInvoices } from "@/components/account/AccountDashboard";

/**
 * The account page reads a customer's invoices once per visit, ahead of the
 * Invoices tab. Signing out does not reload the page, so the read must never
 * reach the next account to sign in in the same tab.
 */
describe("the invoice read", () => {
  afterEach(() => {
    portal.calls = 0;
  });

  it("is kept for the customer it was made for", async () => {
    portal.signedIn = "anna";
    const first = await loadInvoices("cust-anna");
    expect(await loadInvoices("cust-anna")).toBe(first);
    expect(portal.calls).toBe(1);
  });

  it("is never shown to the next customer to sign in in the tab", async () => {
    portal.signedIn = "anna";
    expect((await loadInvoices("cust-anna"))[0]!.invoice_no).toBe("OM/anna/1");
    // Anna signs out; Ben signs in, in the same tab, with no reload.
    portal.signedIn = "ben";
    expect((await loadInvoices("cust-ben"))[0]!.invoice_no).toBe("OM/ben/1");
  });

  it("is read again when asked to, as the error state's Try again does", async () => {
    portal.signedIn = "anna";
    await loadInvoices("cust-anna");
    const calls = portal.calls;
    await loadInvoices("cust-anna", true);
    expect(portal.calls).toBe(calls + 1);
  });
});
