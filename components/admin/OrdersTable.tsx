"use client";

import { useMemo, useState } from "react";
import { adminApi, type Order, type PaymentReconciliation } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { formatINR, formatDateTime } from "@/lib/format";
import { AsyncState, DataTable, RowDeleteButton, StatusPill, Td, Tr } from "./ui";
import { FilterBar, emptyFilter, matchesQuery, withinRange, type RangeFilter } from "./filtering";

export function OrdersTable() {
  const { data, loading, error, reload } = useAsync<Order[]>(() => adminApi.orders());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<RangeFilter>(emptyFilter);

  const filtered = useMemo(
    () =>
      (data ?? []).filter(
        (o) => withinRange(o.created_at, filter.from, filter.to) && matchesQuery(filter.q, o.email, o.plan_code, o.razorpay_payment_id, o.status),
      ),
    [data, filter],
  );

  async function remove(o: Order) {
    if (!window.confirm(`Delete order for ${o.email}? This also removes its invoice, cancels any linked subscription, and revokes its license key. This cannot be undone.`)) return;
    setDeletingId(o.id);
    try {
      await adminApi.deleteOrder(o.id);
      reload();
    } catch {
      window.alert("Failed to delete order.");
    } finally {
      setDeletingId(null);
    }
  }

  async function revokeKey(o: Order) {
    if (!window.confirm(`Revoke the license key for ${o.email}? Their self-hosted instance will no longer validate or receive updates. The order/invoice are kept. This cannot be undone.`)) return;
    setRevokingId(o.id);
    try {
      await adminApi.revokeOrderLicense(o.id);
      reload();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to revoke key.");
    } finally {
      setRevokingId(null);
    }
  }

  async function refund(o: Order) {
    if (!window.confirm(`Mark the order for ${o.email} as refunded? Do this after you've issued the refund (Razorpay, PayPal, or bank). The customer will be emailed a confirmation. This does not move money itself.`)) return;
    setRefundingId(o.id);
    try {
      await adminApi.refundOrder(o.id);
      reload();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to mark refunded.");
    } finally {
      setRefundingId(null);
    }
  }

  if (loading || error)
    return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <div>
      <FilterBar value={filter} onChange={setFilter} placeholder="Search email, plan, payment id…" count={filtered.length} />
      <ReconcilePaymentsButton onDone={reload} />
      <DataTable head={["Date", "Email", "Amount", "Status", "Plan", "Payment ID", ""]}>
        {filtered.length === 0 ? (
          <Tr>
            <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">No matching orders.</td>
          </Tr>
        ) : (
          filtered.map((o) => (
            <Tr key={o.id}>
              <Td>{formatDateTime(o.created_at)}</Td>
              <Td>{o.email}</Td>
              <Td>{formatINR(o.amount)}</Td>
              <Td><StatusPill status={o.status} /></Td>
              <Td>{o.plan_code}</Td>
              <Td mono>{o.razorpay_payment_id || "-"}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  {o.status === "paid" && (
                    <button
                      onClick={() => refund(o)}
                      disabled={refundingId === o.id}
                      className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-500/20 disabled:opacity-50 dark:text-amber-300"
                    >
                      {refundingId === o.id ? "…" : "Mark refunded"}
                    </button>
                  )}
                  {o.license_id && (
                    <button
                      onClick={() => revokeKey(o)}
                      disabled={revokingId === o.id}
                      className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-700 transition hover:bg-orange-500/20 disabled:opacity-50 dark:text-orange-300"
                    >
                      {revokingId === o.id ? "…" : "Revoke key"}
                    </button>
                  )}
                  <RowDeleteButton onClick={() => remove(o)} busy={deletingId === o.id} />
                </div>
              </Td>
            </Tr>
          ))
        )}
      </DataTable>
    </div>
  );
}

/**
 * Ask Razorpay about orders that never reached paid, and fulfil the ones that were.
 *
 * WHY A BUTTON AND NOT JUST THE TIMER. The moment this answers is a customer
 * writing "I paid and nothing happened", and telling them to wait up to fifteen
 * minutes for a scheduled sweep is not an answer. It also settles which half is
 * broken: if this fulfils the order, the money was always there and only the
 * delivery failed.
 */
function ReconcilePaymentsButton({ onDone }: { onDone: () => void }) {
  const [res, setRes] = useState<PaymentReconciliation | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setBusy(true);
    setErr("");
    setRes(null);
    try {
      const out = await adminApi.reconcilePayments();
      setRes(out);
      if (out.recovered.length > 0) onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not reconcile payments");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-3 space-y-1.5">
      <button onClick={() => void run()} disabled={busy} className="btn-ghost px-3 py-2 text-xs disabled:opacity-40">
        {busy ? "Asking Razorpay…" : "Check for payments the webhook missed"}
      </button>

      {err && <p className="text-xs text-rose-600">{err}</p>}

      {res && (
        <div className="space-y-1 text-xs">
          {/* Said first, because an operator who believes they are covered and is
              not is worse off than one who knows they are not. */}
          {!res.configured && (
            <p className="text-amber-700 dark:text-amber-300">
              No Razorpay keys are configured, so nothing was checked and the automatic sweep is not
              running either. Set them in Settings.
            </p>
          )}
          {res.configured && res.recovered.length > 0 ? (
            <>
              <p className="text-emerald-700 dark:text-emerald-300">
                Fulfilled {res.recovered.length} paid order
                {res.recovered.length === 1 ? "" : "s"} the webhook never delivered.
              </p>
              <p className="break-all font-mono text-[11px] text-muted-foreground">{res.recovered.join(", ")}</p>
              {res.recovered.length > 2 && (
                <p className="text-amber-700 dark:text-amber-300">
                  More than a couple at once points at the webhook itself. Razorpay disables a webhook
                  after 24 hours of failed deliveries; check it is still enabled in their dashboard.
                </p>
              )}
            </>
          ) : res.configured ? (
            <p className="text-muted-foreground">
              Nothing to fulfil. Checked {res.checked} unfulfilled order{res.checked === 1 ? "" : "s"};{" "}
              {res.abandoned} {res.abandoned === 1 ? "was an" : "were"} abandoned checkout
              {res.abandoned === 1 ? "" : "s"}.
            </p>
          ) : null}
          {res.failed.length > 0 && (
            <p className="text-amber-700 dark:text-amber-300">
              Razorpay would not answer for {res.failed.join(", ")}. These are retried automatically.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
