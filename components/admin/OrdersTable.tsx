"use client";

import { adminApi, type Order } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { formatINR, formatDateTime } from "@/lib/format";
import { AsyncState, DataTable, StatusPill, Td, Tr } from "./ui";

export function OrdersTable() {
  const { data, loading, error, reload } = useAsync<Order[]>(() => adminApi.orders());
  const orders = data ?? [];

  if (loading || error)
    return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <DataTable head={["Date", "Email", "Amount", "Status", "Plan", "Payment ID"]}>
      {orders.length === 0 ? (
        <Tr>
          <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-400">No orders yet.</td>
        </Tr>
      ) : (
        orders.map((o) => (
          <Tr key={o.id}>
            <Td>{formatDateTime(o.created_at)}</Td>
            <Td>{o.email}</Td>
            <Td>{formatINR(o.amount)}</Td>
            <Td><StatusPill status={o.status} /></Td>
            <Td>{o.plan_code}</Td>
            <Td mono>{o.razorpay_payment_id || "—"}</Td>
          </Tr>
        ))
      )}
    </DataTable>
  );
}
