"use client";

import { adminApi, type Customer } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { formatDateTime } from "@/lib/format";
import { AsyncState, DataTable, Td, Tr } from "./ui";

export function CustomersTable() {
  const { data, loading, error, reload } = useAsync<Customer[]>(() => adminApi.customers());
  const customers = data ?? [];

  if (loading || error)
    return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <DataTable head={["Joined", "Email", "Name", "GSTIN", "State", "Country"]}>
      {customers.length === 0 ? (
        <Tr>
          <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-400">No customers yet.</td>
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
          </Tr>
        ))
      )}
    </DataTable>
  );
}
