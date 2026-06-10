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
              <Td><RowDeleteButton onClick={() => remove(o)} busy={deletingId === o.id} /></Td>
            </Tr>
          ))
        )}
      </DataTable>
    </div>
  );
}
