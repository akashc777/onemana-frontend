"use client";

import { useMemo, useState } from "react";
import { adminApi, type Order } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { formatINR, formatDateTime } from "@/lib/format";
import { AsyncState, DataTable, RowDeleteButton, StatusPill, Td, Tr } from "./ui";
import { FilterBar, emptyFilter, matchesQuery, withinRange, type RangeFilter } from "./filtering";

export function OrdersTable() {
  const { data, loading, error, reload } = useAsync<Order[]>(() => adminApi.orders());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<RangeFilter>(emptyFilter);

  const filtered = useMemo(
    () =>
      (data ?? []).filter(
        (o) => withinRange(o.created_at, filter.from, filter.to) && matchesQuery(filter.q, o.email, o.plan_code, o.razorpay_payment_id, o.status),
      ),
    [data, filter],
  );

  async function remove(o: Order) {
    if (!window.confirm(`Delete order for ${o.email}? This also removes its invoice. This cannot be undone.`)) return;
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
      <DataTable head={["Date", "Email", "Amount", "Status", "Plan", "Payment ID", ""]}>
        {filtered.length === 0 ? (
          <Tr>
            <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">No matching orders.</td>
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
                      className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
                    >
                      {refundingId === o.id ? "…" : "Mark refunded"}
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
