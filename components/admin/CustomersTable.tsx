"use client";

import { useMemo, useState } from "react";
import { adminApi, type Customer } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { formatDateTime } from "@/lib/format";
import { AsyncState, DataTable, RowDeleteButton, Td, Tr } from "./ui";
import { FilterBar, emptyFilter, matchesQuery, withinRange, type RangeFilter } from "./filtering";

export function CustomersTable() {
  const { data, loading, error, reload } = useAsync<Customer[]>(() => adminApi.customers());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<RangeFilter>(emptyFilter);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const filtered = useMemo(
    () =>
      (data ?? []).filter(
        (c) => withinRange(c.created_at, filter.from, filter.to) && matchesQuery(filter.q, c.email, c.name, c.gstin, c.state, c.country),
      ),
    [data, filter],
  );

  function startEdit(c: Customer) {
    setEditingId(c.id);
    setEditName(c.name || "");
  }

  async function saveName(c: Customer) {
    if (!editName.trim()) {
      window.alert("Name cannot be empty.");
      return;
    }
    setSavingName(true);
    try {
      await adminApi.updateCustomerName(c.id, editName.trim());
      setEditingId(null);
      reload();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to update name.");
    } finally {
      setSavingName(false);
    }
  }

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
    <div>
      <FilterBar value={filter} onChange={setFilter} placeholder="Search email, name, GSTIN…" count={filtered.length} />
      <DataTable head={["Joined", "Email", "Name", "GSTIN", "State", "Country", ""]}>
        {filtered.length === 0 ? (
          <Tr>
            <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">No matching customers.</td>
          </Tr>
        ) : (
          filtered.map((c) => (
            <Tr key={c.id}>
              <Td>{formatDateTime(c.created_at)}</Td>
              <Td>{c.email}</Td>
              <Td>
                {editingId === c.id ? (
                  <span className="flex items-center gap-1.5">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName(c);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="w-36 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-brand"
                    />
                    <button onClick={() => saveName(c)} disabled={savingName} className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50">
                      {savingName ? "…" : "Save"}
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400 hover:bg-white/10">
                      Cancel
                    </button>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {c.name || "-"}
                    <button onClick={() => startEdit(c)} className="text-xs text-slate-500 hover:text-brand-light">Edit</button>
                  </span>
                )}
              </Td>
              <Td>{c.gstin || "-"}</Td>
              <Td>{c.state || "-"}</Td>
              <Td>{c.country}</Td>
              <Td><RowDeleteButton onClick={() => remove(c)} busy={deletingId === c.id} /></Td>
            </Tr>
          ))
        )}
      </DataTable>
    </div>
  );
}
