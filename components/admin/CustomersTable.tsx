"use client";

import { useState } from "react";
import { adminApi, type Customer } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { formatDateTime } from "@/lib/format";
import { AsyncState, DataTable, RowDeleteButton, Td, Tr } from "./ui";

export function CustomersTable() {
  const { data, loading, error, reload } = useAsync<Customer[]>(() => adminApi.customers());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const customers = data ?? [];

  async function remove(c: Customer) {
    if (!window.confirm(`Delete ${c.email}? This also removes their orders, invoices, and subscriptions. This cannot be undone.`)) return;
    setDeletingId(c.id);
    try {
      await adminApi.deleteCustomer(c.id);
      reload();
    } catch {
      window.alert("Failed to delete customer.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading || error)
    return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <DataTable head={["Joined", "Email", "Name", "GSTIN", "State", "Country", ""]}>
      {customers.length === 0 ? (
        <Tr>
          <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">No customers yet.</td>
        </Tr>
      ) : (
        customers.map((c) => (
          <Tr key={c.id}>
            <Td>{formatDateTime(c.created_at)}</Td>
            <Td>{c.email}</Td>
            <Td>{c.name || "-"}</Td>
            <Td>{c.gstin || "-"}</Td>
            <Td>{c.state || "-"}</Td>
            <Td>{c.country}</Td>
            <Td><RowDeleteButton onClick={() => remove(c)} busy={deletingId === c.id} /></Td>
          </Tr>
        ))
      )}
    </DataTable>
  );
}
