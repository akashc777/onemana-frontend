"use client";

import { useCallback, useEffect, useState } from "react";
import { portalApi, type PortalOverview, type PortalSubscription, type Invoice } from "@/lib/portalApi";
import { formatINR, formatDate } from "@/lib/format";

type Tab = "overview" | "invoices" | "subscription" | "billing";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "invoices", label: "Invoices" },
  { key: "subscription", label: "Subscription" },
  { key: "billing", label: "Billing details" },
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    created: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    paused: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    halted: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    completed: "bg-slate-500/20 text-foreground/80",
    failed: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  };
  return map[status] || "bg-slate-500/20 text-foreground/80";
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked - no-op */
        }
      }}
      className="rounded-md border border-border bg-muted px-2 py-1 text-xs text-foreground/80 hover:bg-muted"
    >
      {done ? "Copied ✓" : label}
    </button>
  );
}

export function AccountDashboard({
  overview,
  onLogout,
  onReload,
}: {
  overview: PortalOverview;
  onLogout: () => void;
  onReload: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const c = overview.customer;

  return (
    <div className="container-x py-10 sm:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {c.name ? `Hi, ${c.name.split(" ")[0]}` : "Your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{c.email}</p>
        </div>
        <button onClick={onLogout} className="btn-ghost px-4 py-2 text-sm">
          Sign out
        </button>
      </div>

      {/* tabs */}
      <div className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition ${
              tab === t.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab overview={overview} onManageSubscription={() => setTab("subscription")} />}
      {tab === "invoices" && <InvoicesTab />}
      {tab === "subscription" && <SubscriptionTab initial={overview.subscriptions} onChanged={onReload} />}
      {tab === "billing" && <BillingTab overview={overview} />}
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function OverviewTab({ overview, onManageSubscription }: { overview: PortalOverview; onManageSubscription: () => void }) {
  const nextSub = overview.subscriptions.find((s) => s.status === "active" || s.status === "created");
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Licenses" value={String(overview.licenses.length)} />
        <StatCard label="Orders" value={String(overview.order_count)} />
        <StatCard label="Invoices" value={String(overview.invoice_count)} />
        <StatCard
          label="Next payment"
          value={nextSub?.next_due_date ? formatDate(nextSub.next_due_date) : "-"}
          hint={nextSub ? nextSub.plan_code : "No active subscription"}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Your licenses</h2>
        {overview.licenses.length === 0 ? (
          <p className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            No licenses yet. Once your payment is processed, your license key appears here.
          </p>
        ) : (
          <div className="space-y-3">
            {overview.licenses.map((l) => (
              <div key={l.key} className="rounded-2xl border border-border bg-muted/30 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {l.product_type === "saas_subscription" ? "Cloud (includes self-host)" : "Lifetime self-host license"}
                  </span>
                  <span className="text-xs text-muted-foreground">Issued {formatDate(l.issued_at)}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs text-brand">{l.key}</code>
                  <CopyButton value={l.key} label="Copy key" />
                </div>
                <div className="mt-3">
                  <p className="mb-1 text-xs text-muted-foreground">Install on your server:</p>
                  <div className="flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-[11px] text-foreground/80">{l.install_cmd}</code>
                    <CopyButton value={l.install_cmd} label="Copy" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {nextSub && (
        <div className="rounded-2xl border border-border bg-muted/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">OneCamp Cloud subscription</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {nextSub.cancel_at_period_end
                  ? `Cancels on ${nextSub.next_due_date ? formatDate(nextSub.next_due_date) : "the period end"}.`
                  : nextSub.next_due_date
                    ? `Renews on ${formatDate(nextSub.next_due_date)}.`
                    : "Active."}
              </p>
            </div>
            <button onClick={onManageSubscription} className="btn-ghost px-4 py-2 text-sm">
              Manage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Loading() {
  return <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>;
}
function ErrorState({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="py-10 text-center text-sm">
      <p className="text-red-600 dark:text-red-400">{msg}</p>
      <button onClick={onRetry} className="btn-ghost mt-3 px-4 py-2 text-xs">Retry</button>
    </div>
  );
}

function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const load = useCallback(() => {
    setError("");
    setInvoices(null);
    portalApi
      .invoices()
      .then(setInvoices)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function download(inv: Invoice) {
    setDownloading(inv.id);
    try {
      await portalApi.downloadInvoice(inv.id, `${inv.invoice_no.replace(/\//g, "-")}.pdf`);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(null);
    }
  }

  if (error) return <ErrorState msg={error} onRetry={load} />;
  if (!invoices) return <Loading />;
  if (invoices.length === 0)
    return <p className="rounded-2xl border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">No invoices yet.</p>;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Invoice</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Amount</th>
            <th className="px-4 py-3 font-semibold">GST</th>
            <th className="px-4 py-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium text-foreground">{inv.invoice_no}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.issued_at)}</td>
              <td className="px-4 py-3 text-foreground/80">{formatINR(inv.gross_amount)}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {inv.is_export ? "Export 0%" : formatINR(inv.cgst_amount + inv.sgst_amount + inv.igst_amount)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => download(inv)}
                  disabled={downloading === inv.id}
                  className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs text-foreground hover:bg-muted disabled:opacity-50"
                >
                  {downloading === inv.id ? "…" : "Download PDF"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscriptionTab({ initial, onChanged }: { initial: PortalSubscription[]; onChanged: () => void }) {
  const [subs, setSubs] = useState<PortalSubscription[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function cancel(s: PortalSubscription) {
    if (!window.confirm("Cancel this subscription? It stays active until the current period ends, then will not renew.")) return;
    setBusy(s.id);
    try {
      await portalApi.cancelSubscription(s.id);
      const fresh = await portalApi.subscriptions();
      setSubs(fresh);
      onChanged();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setBusy(null);
    }
  }

  if (subs.length === 0)
    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        You don&apos;t have any subscriptions. The lifetime license is a one-time purchase with nothing to manage here.
      </div>
    );

  return (
    <div className="space-y-4">
      {subs.map((s) => (
        <div key={s.id} className="rounded-2xl border border-border bg-muted/30 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">OneCamp Cloud</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBadge(s.status)}`}>{s.status}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{s.seats} seats · {s.plan_code}</p>
              <p className="mt-2 text-sm text-foreground/80">
                {s.status === "paused"
                  ? "Paused - no charges will be made while paused."
                  : s.cancel_at_period_end
                    ? `Cancels on ${s.next_due_date ? formatDate(s.next_due_date) : "period end"} - no further charges.`
                    : s.next_due_date
                      ? `Next payment on ${formatDate(s.next_due_date)}.`
                      : "Active."}
              </p>
            </div>
            {s.can_cancel ? (
              <button
                onClick={() => cancel(s)}
                disabled={busy === s.id}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-700 hover:bg-rose-500/20 disabled:opacity-50 dark:text-rose-300"
              >
                {busy === s.id ? "Cancelling…" : "Cancel subscription"}
              </button>
            ) : s.cancel_at_period_end ? (
              <span className="rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground">Cancellation scheduled</span>
            ) : null}
          </div>
          <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            Need to update your card or change plan? Reply to your billing email and we&apos;ll help.
          </p>
        </div>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value || "-"}</span>
    </div>
  );
}

function BillingTab({ overview }: { overview: PortalOverview }) {
  const c = overview.customer;
  const address = [c.address_line, c.city, c.state, c.country].filter(Boolean).join(", ");
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-5">
      <h2 className="mb-2 text-sm font-semibold text-foreground">Billing details</h2>
      <p className="mb-4 text-xs text-muted-foreground">These appear on your GST invoices. To change them, reply to your invoice email.</p>
      <Row label="Name" value={c.name} />
      <Row label="Email" value={c.email} />
      <Row label="GSTIN" value={c.gstin} />
      <Row label="Phone" value={c.phone} />
      <Row label="Address" value={address} />
      <Row label="Customer since" value={formatDate(c.created_at)} />
    </div>
  );
}
