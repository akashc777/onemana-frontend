"use client";

import { ChangeEmail } from "@/components/account/ChangeEmail";
import { FREE_PLAN_CODE, FREE_SEATS } from "@/lib/freePlan";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Script from "next/script";
import { switchConfirm, switchLabel } from "@/lib/billingSwitch";
import { openSubscriptionCheckout } from "@/lib/razorpayCheckout";
import { cloudCheckoutDescription, cloudPlanCode } from "@/lib/paymentTerms";
import { fetchPricingClient, defaultPricing, type Pricing } from "@/lib/pricing";
import { portalApi, type PortalInstance, type PortalOverview, type PortalSubscription, type Invoice } from "@/lib/portalApi";
import { formatINR, formatDate, formatDay } from "@/lib/format";
import { subscriptionTone } from "@/lib/instanceState";
import { WorkspaceSection } from "./WorkspaceSection";
import { CopyField, StatusDot, SummaryTile, glyphs } from "./AccountParts";
import { SpotWelcome } from "@/components/ui/graphics/spots";
import { buttonClasses } from "@/components/ui/Button";

type Tab = "overview" | "invoices" | "subscription" | "billing";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "invoices", label: "Invoices" },
  { key: "subscription", label: "Subscription" },
  { key: "billing", label: "Billing" },
];

const isTab = (v: string | null): v is Tab => TABS.some((t) => t.key === v);

/** A subscription status in words: Razorpay's "authenticated" means authorised, first charge still to come. */
function statusLabel(status: string): string {
  const word = status === "authenticated" ? "scheduled" : status;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Invoices, read once per visit: the Invoices tab asks for them when it is
// pointed at, so they are usually there by the time it opens.
let invoiceRequest: Promise<Invoice[]> | null = null;
function loadInvoices(fresh = false): Promise<Invoice[]> {
  if (fresh || !invoiceRequest) {
    invoiceRequest = portalApi.invoices().catch((e) => {
      invoiceRequest = null;
      throw e;
    });
  }
  return invoiceRequest;
}

export function AccountDashboard({
  overview,
  instances,
  onLogout,
  onReload,
}: {
  overview: PortalOverview;
  /** The workspaces, read with the overview so the page arrives whole (see app/account/page.tsx). */
  instances?: PortalInstance[] | null;
  onLogout: () => void;
  onReload: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const c = overview.customer;
  const id = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ overview: null, invoices: null, subscription: null, billing: null });

  // The tab is in the address (?tab=invoices), so it can be linked to and
  // survives a reload; switching replaces the entry rather than adding one.
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("tab");
    if (isTab(asked)) setTab(asked);
  }, []);
  const choose = useCallback((next: Tab) => {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const at = TABS.findIndex((t) => t.key === tab);
    let next = -1;
    if (e.key === "ArrowRight") next = (at + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (at - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    choose(TABS[next].key);
    tabRefs.current[TABS[next].key]?.focus();
  };

  return (
    <div className="container-x pb-24 pt-10 sm:pt-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-title-sm text-foreground sm:text-title">
            {c.name ? `Hi, ${c.name.split(" ")[0]}` : "Your account"}
          </h1>
          <p className="mt-1 truncate text-small text-muted-foreground">{c.email}</p>
        </div>
        <button onClick={onLogout} className="btn-ghost h-9 px-3.5 py-0">
          Sign out
        </button>
      </div>

      <div role="tablist" aria-label="Your account" onKeyDown={onTabKey} className="-mx-4 mb-8 mt-8 flex gap-4 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:gap-6 sm:px-0">
        {TABS.map((t) => {
          const selected = tab === t.key;
          return (
            <button
              key={t.key}
              ref={(el) => {
                tabRefs.current[t.key] = el;
              }}
              role="tab"
              id={`${id}-tab-${t.key}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(t.key)}
              onPointerEnter={t.key === "invoices" ? () => void loadInvoices().catch(() => {}) : undefined}
              onFocus={t.key === "invoices" ? () => void loadInvoices().catch(() => {}) : undefined}
              className={`-mb-px shrink-0 whitespace-nowrap border-b-2 py-2.5 text-small font-medium transition-colors ${
                selected ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${tab}`} tabIndex={-1} className="outline-none">
        {/* First on the overview, because when a workspace still needs a name this is
            the only thing on the page that matters. Everything else is a record of
            what has already happened. */}
        {tab === "overview" && <WorkspaceSection onReload={onReload} subscriptions={overview.subscriptions} initial={instances} />}
        {tab === "overview" && <OverviewTab overview={overview} onOpen={choose} />}
        {tab === "invoices" && <InvoicesTab />}
        {tab === "subscription" && <SubscriptionTab initial={overview.subscriptions} onChanged={onReload} />}
        {tab === "billing" && <BillingTab overview={overview} onChanged={onReload} />}
      </div>
    </div>
  );
}

function licenceKind(l: PortalOverview["licenses"][number]): string {
  if (l.product_type === "saas_subscription") return "Cloud, includes self-hosting";
  if (l.plan_code === FREE_PLAN_CODE) return `Free self-host licence, up to ${FREE_SEATS} people`;
  return "Lifetime self-host licence";
}

function OverviewTab({ overview, onOpen }: { overview: PortalOverview; onOpen: (tab: Tab) => void }) {
  const nextSub = overview.subscriptions.find((s) => s.status === "active" || s.status === "created");
  const tileLink = "text-small font-medium text-brand-ink underline decoration-brand-ink/35 underline-offset-[3px] transition-colors hover:decoration-brand-ink";
  const licences = overview.licenses.length;
  const invoices = overview.invoice_count;
  // Signed in with an address that has bought nothing yet (or whose payment
  // has not reached us): say so, with the one thing to do next, instead of
  // three tiles that each say "none".
  if (licences === 0 && overview.subscriptions.length === 0 && invoices === 0) {
    return (
      <div className="flex flex-col items-start gap-6 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
        <SpotWelcome size={96} className="shrink-0" />
        <div className="min-w-0">
          <h2 className="text-h3 font-semibold text-foreground">Nothing here yet</h2>
          <p className="mt-2 max-w-md text-small text-muted-foreground">
            Your licences, invoices and workspace appear here once you buy OneCamp or claim a free licence, under
            this address. Paid a minute ago? Your key is on its way by email, and this page shows it on your next visit.
          </p>
          {/* A plain link: next/link (via ButtonLink) would add 26 KB of
              script to every account visit for a state few people see. */}
          <a href="/free" className="btn-brand mt-5 h-10 px-4 py-0">
            Install free
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-10">
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryTile
          hue="sun"
          icon={glyphs.key}
          label="Licences"
          value={licences === 0 ? "None yet" : `${licences} ${licences === 1 ? "licence" : "licences"}`}
          detail={licences === 0 ? "A key appears here once a payment is processed." : "Keys and install commands are below."}
          action={
            licences > 0 ? (
              <a href="#licences" className={tileLink}>
                See your keys
              </a>
            ) : null
          }
        />
        <SummaryTile
          hue="sky"
          icon={glyphs.receipt}
          label="Invoices"
          value={invoices === 0 ? "None yet" : `${invoices} ${invoices === 1 ? "invoice" : "invoices"}`}
          detail="GST invoices, as PDFs."
          action={
            invoices > 0 ? (
              <button type="button" onClick={() => onOpen("invoices")} onPointerEnter={() => void loadInvoices().catch(() => {})} className={tileLink}>
                Download invoices
              </button>
            ) : null
          }
        />
        <SummaryTile
          hue="lake"
          icon={glyphs.cloud}
          label="OneCamp Cloud"
          value={nextSub ? (nextSub.label || "Subscribed") : "Not subscribed"}
          detail={
            nextSub
              ? nextSub.cancel_at_period_end
                ? `Cancels on ${nextSub.next_due_date ? formatDay(nextSub.next_due_date) : "the period end"}.`
                : nextSub.next_due_date
                  ? `Renews on ${formatDay(nextSub.next_due_date)}.`
                  : "Active."
              : "The lifetime licence has nothing to renew."
          }
          action={
            nextSub ? (
              <button type="button" onClick={() => onOpen("subscription")} className={tileLink}>
                Manage the subscription
              </button>
            ) : null
          }
        />
      </div>

      <section id="licences" className="scroll-mt-24">
        <h2 className="text-body font-semibold text-foreground">Your licences</h2>
        {overview.licenses.length === 0 ? (
          <p className="mt-3 text-small text-muted-foreground">
            No licences yet. Once your payment is processed, your licence key appears here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {overview.licenses.map((l) => (
              <li key={l.key} className="rounded-lg border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-small font-medium text-foreground">{licenceKind(l)}</p>
                  <p className="text-caption text-muted-foreground">Issued {formatDay(l.issued_at)}</p>
                </div>
                <p className="mb-1.5 mt-4 text-caption text-muted-foreground">Licence key</p>
                <CopyField value={l.key} label="licence key" />
                <p className="mb-1.5 mt-4 text-caption text-muted-foreground">Install on your server</p>
                <CopyField value={l.install_cmd} label="install command" wrap />
                <p className="mt-3 text-caption text-muted-foreground">
                  Includes both editions. The installer asks which to set up: v2 with AI teammates, or v1 with no AI at all. Moving from v1 to v2 later uses this same key.
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Loading({ label }: { label: string }) {
  // The shape of what is coming: three rows where the table will be.
  return (
    <div role="status" aria-label={label} className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-12 rounded-md bg-muted" />
      ))}
    </div>
  );
}

function ErrorState({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-border bg-card p-5">
      <p className="text-small font-medium text-foreground">This did not load</p>
      <p className="mt-1 text-small text-muted-foreground">{msg}</p>
      <button onClick={onRetry} className="btn-ghost mt-4 h-9 px-3.5 py-0">
        Try again
      </button>
    </div>
  );
}

function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  const load = useCallback((fresh = false) => {
    setError("");
    loadInvoices(fresh)
      .then(setInvoices)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function download(inv: Invoice) {
    setDownloading(inv.id);
    setRowError((r) => ({ ...r, [inv.id]: "" }));
    try {
      await portalApi.downloadInvoice(inv.id, `${inv.invoice_no.replace(/\//g, "-")}.pdf`);
    } catch (e) {
      // Said on the row, not in a browser alert.
      setRowError((r) => ({ ...r, [inv.id]: e instanceof Error ? e.message : "Download failed" }));
    } finally {
      setDownloading(null);
    }
  }

  if (error) return <ErrorState msg={error} onRetry={() => load(true)} />;
  if (!invoices) return <Loading label="Loading your invoices…" />;
  if (invoices.length === 0)
    return <p className="text-small text-muted-foreground">No invoices yet. Each payment&apos;s GST invoice appears here.</p>;

  const gst = (inv: Invoice) => (inv.is_export ? "Export, 0%" : formatINR(inv.cgst_amount + inv.sgst_amount + inv.igst_amount));
  const downloadButton = (inv: Invoice) => (
    <button
      onClick={() => download(inv)}
      disabled={downloading === inv.id}
      className={buttonClasses("ghost", "sm", "whitespace-nowrap")}
    >
      {downloading === inv.id ? "Downloading…" : "Download PDF"}
    </button>
  );
  const failed = (inv: Invoice) =>
    rowError[inv.id] ? (
      <p role="alert" className="mt-1 text-caption text-danger-ink">
        {rowError[inv.id]}
      </p>
    ) : null;

  return (
    <>
      {/* A phone gets a list: in the table, three lines a row and the download
          button off the right edge of the screen. */}
      <ul className="divide-y divide-border rounded-lg border border-border bg-card tabular-nums sm:hidden">
        {invoices.map((inv) => (
          <li key={inv.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-small font-medium text-foreground">{inv.invoice_no}</p>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  {formatDate(inv.issued_at)}{"\u00a0· GST\u00a0"}{gst(inv)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <p className="text-small font-medium text-foreground">{formatINR(inv.gross_amount)}</p>
                {downloadButton(inv)}
              </div>
            </div>
            {failed(inv)}
          </li>
        ))}
      </ul>
      {/* relative: the header's screen-reader label is absolutely positioned, and
          without a containing block inside the scroll box it escaped it and
          widened the page by 39 px on a phone. */}
      <div className="relative hidden overflow-x-auto rounded-lg border border-border bg-card sm:block">
        <table className="w-full min-w-[34rem] text-left text-small">
          <thead className="border-b border-border text-caption text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Invoice</th>
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 text-right font-medium">Amount</th>
              <th className="px-4 py-2.5 text-right font-medium">GST</th>
              <th className="px-4 py-2.5">
                <span className="sr-only">Download</span>
              </th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-border first:border-t-0">
                <td className="px-4 py-3 font-medium text-foreground">{inv.invoice_no}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.issued_at)}</td>
                <td className="px-4 py-3 text-right text-foreground">{formatINR(inv.gross_amount)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{gst(inv)}</td>
                <td className="px-4 py-3 text-right">
                  {downloadButton(inv)}
                  {failed(inv)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** The plan code behind a change target, for the checkout window's words. */
function planCodeFor(to: string): string | undefined {
  return cloudPlanCode(to === "business" ? "business" : to === "yearly" ? "yearly" : "monthly");
}

function SubscriptionTab({ initial, onChanged }: { initial: PortalSubscription[]; onChanged: () => void }) {
  const [subs, setSubs] = useState<PortalSubscription[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [pricing, setPricing] = useState<Pricing>(defaultPricing);
  useEffect(() => {
    let alive = true;
    fetchPricingClient().then((p) => { if (alive) setPricing(p); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  async function changePlan(s: PortalSubscription, to: string) {
    if (!window.confirm(switchConfirm(to, s.plan_code, pricing))) return;
    setBusy(s.id);
    const done = async (detail: string) => {
      setNote((n) => ({ ...n, [s.id]: detail }));
      setSubs(await portalApi.subscriptions());
      onChanged();
    };
    try {
      const res = await portalApi.changePlan(s.id, to);
      if (!res.checkout) {
        await done(res.detail);
        setBusy(null);
        return;
      }
      // A UPI or eMandate subscription cannot change in place: the customer
      // confirms the new plan in Razorpay's window.
      setNote((n) => ({ ...n, [s.id]: res.detail }));
      openSubscriptionCheckout(res.checkout, cloudCheckoutDescription(planCodeFor(to)), {
        paid: () => {
          setBusy(null);
          window.setTimeout(() => void done("Thank you. The new plan takes over as described; this page updates within a minute."), 8000);
        },
        closed: () => setBusy(null),
        failed: (msg) => {
          setBusy(null);
          setNote((n) => ({ ...n, [s.id]: msg }));
        },
      });
    } catch (e) {
      setNote((n) => ({ ...n, [s.id]: e instanceof Error ? e.message : "The change could not be made." }));
      setBusy(null);
    }
  }

  /** Keep a cancelled workspace, or move the renewal to a new card: both are
   *  a new subscription the customer authorises in Razorpay's window. */
  async function replace(s: PortalSubscription, kind: "keep" | "card") {
    setBusy(s.id);
    try {
      const checkout = await portalApi.replacement(s.id, kind);
      openSubscriptionCheckout(checkout, cloudCheckoutDescription(s.plan_code), {
        paid: () => {
          setBusy(null);
          setNote((n) => ({
            ...n,
            [s.id]: kind === "keep"
              ? "Thank you. Your workspace carries on; this page updates within a minute."
              : "Thank you. The next renewal is charged to the new card; this page updates within a minute.",
          }));
          window.setTimeout(() => {
            void portalApi.subscriptions().then(setSubs).then(onChanged).catch(() => {});
          }, 8000);
        },
        closed: () => setBusy(null),
        failed: (msg) => {
          setBusy(null);
          setNote((n) => ({ ...n, [s.id]: msg }));
        },
      });
    } catch (e) {
      setNote((n) => ({ ...n, [s.id]: e instanceof Error ? e.message : "That did not work just now." }));
      setBusy(null);
    }
  }

  async function cancel(s: PortalSubscription) {
    if (!window.confirm("Cancel this subscription? It stays active until the current period ends, then will not renew. You can keep it from this page until then.")) return;
    setBusy(s.id);
    try {
      await portalApi.cancelSubscription(s.id);
      const fresh = await portalApi.subscriptions();
      setSubs(fresh);
      onChanged();
    } catch (e) {
      // Said beside the subscription, where the button was, not in a browser alert.
      setNote((n) => ({ ...n, [s.id]: e instanceof Error ? e.message : "Failed to cancel" }));
    } finally {
      setBusy(null);
    }
  }

  if (subs.length === 0)
    return (
      <p className="text-small text-muted-foreground">
        You don&apos;t have any subscriptions. The lifetime licence is a one-time purchase with nothing to manage here.
      </p>
    );

  const secondary =
    buttonClasses("ghost", "md");

  return (
    <div className="space-y-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {subs.map((s) => (
        <div key={s.id} className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <p className="text-body font-semibold text-foreground">{s.label || "OneCamp Cloud"}</p>
              <p className="mt-0.5 text-caption text-muted-foreground">{s.seats > 0 ? `${s.seats} users included` : s.plan_code}</p>
            </div>
            <StatusDot tone={subscriptionTone(s.status)}>{statusLabel(s.status)}</StatusDot>
          </div>
          <p className="mt-3 text-small text-foreground/80">
            {s.status === "paused"
              ? "Paused. No charges are made while it is paused."
              : s.status === "cancelled" || s.status === "completed" || s.status === "expired"
                ? s.can_keep
                  ? "Ended. Your workspace is still online for you to export or keep."
                  : "Ended. No further charges."
              : s.status === "authenticated"
                ? "Authorised. Takes over at your next renewal, so no day is charged twice."
              : s.status === "halted"
                ? "A payment did not go through. Once it ends you can keep your workspace from here with another card."
              : s.cancel_at_period_end
                ? `Cancels on ${s.next_due_date ? formatDay(s.next_due_date) : "period end"}. No further charges.`
                : s.next_due_date
                  ? `Next payment on ${formatDay(s.next_due_date)}.`
                  : "Active."}
          </p>
          {s.pending_label && (
            <p className="mt-1 text-caption text-muted-foreground">
              Switches to {s.pending_label.toLowerCase()} on {s.next_due_date ? formatDay(s.next_due_date) : "the next renewal"}.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {s.can_cancel &&
              (s.switch_options ?? []).map((to) => (
                <button key={to} onClick={() => changePlan(s, to)} disabled={busy === s.id} className={secondary}>
                  {busy === s.id ? "Working…" : switchLabel(to, s.plan_code, pricing)}
                </button>
              ))}
            {s.can_cancel ? (
              <button
                onClick={() => cancel(s)}
                disabled={busy === s.id}
                className="h-9 rounded-md px-3.5 text-small font-medium text-danger-ink transition-colors hover:bg-danger/10 disabled:opacity-60"
              >
                {busy === s.id ? "Cancelling…" : "Cancel subscription"}
              </button>
            ) : s.can_keep ? (
              <button onClick={() => replace(s, "keep")} disabled={busy === s.id} className="btn-brand h-9 px-3.5 py-0">
                {busy === s.id ? "Working…" : "Keep my workspace"}
              </button>
            ) : s.cancel_at_period_end ? (
              <span className="text-caption text-muted-foreground">Cancellation scheduled</span>
            ) : null}
          </div>

          {note[s.id] && (
            <p role="status" className="mt-3 text-small text-foreground/80">
              {note[s.id]}
            </p>
          )}
          {s.can_keep && (
            <p className="mt-2 text-caption text-muted-foreground">
              Changed your mind? Keeping it starts a new subscription on the same plan
              {s.status === "cancelled" || s.status === "completed" ? " today" : " when this one ends, so no day is charged twice"}.
            </p>
          )}
          {s.can_change_card && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-caption text-muted-foreground">
              <span>The next renewal is charged to the card or UPI mandate you paid with.</span>
              <button onClick={() => replace(s, "card")} disabled={busy === s.id} className={`${secondary} h-8 px-3 text-caption`}>
                Use a different card
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 text-small last:border-b-0 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value || "-"}</dd>
    </div>
  );
}

function BillingTab({ overview, onChanged }: { overview: PortalOverview; onChanged: () => void }) {
  const c = overview.customer;
  const address = [c.address_line, c.city, c.state, c.country].filter(Boolean).join(", ");
  return (
    <div className="max-w-2xl">
      <p className="text-small text-muted-foreground">These appear on your GST invoices. To change the others, reply to your invoice email.</p>
      <dl className="mt-4 rounded-lg border border-border bg-card px-4 sm:px-5">
        <Row label="Name" value={c.name} />
        <div className="grid gap-1 border-b border-border py-3 text-small sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="min-w-0 text-foreground">
            <span className="break-all">{c.email}</span>
            <span className="ml-3">
              <ChangeEmail current={c.email} onChanged={onChanged} />
            </span>
          </dd>
        </div>
        <Row label="GSTIN" value={c.gstin} />
        <Row label="Phone" value={c.phone} />
        <Row label="Address" value={address} />
        <Row label="Customer since" value={formatDay(c.created_at)} />
      </dl>
    </div>
  );
}
