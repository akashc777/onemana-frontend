"use client";

import { useMemo, useState } from "react";
import { adminApi, type Customer, type EmailChangeResult } from "@/lib/adminApi";
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
            <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">No matching customers.</td>
          </Tr>
        ) : (
          filtered.map((c) => (
            <Tr key={c.id}>
              <Td>{formatDateTime(c.created_at)}</Td>
              <Td>
                <ChangeEmailCell customer={c} onChanged={reload} />
              </Td>
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
                      className="w-36 rounded-md border border-border bg-muted px-2 py-1 text-xs text-foreground outline-none focus:border-brand"
                    />
                    <button onClick={() => saveName(c)} disabled={savingName} className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-300">
                      {savingName ? "…" : "Save"}
                    </button>
                    <button onClick={() => setEditingId(null)} className="rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted">
                      Cancel
                    </button>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {c.name || "-"}
                    <button onClick={() => startEdit(c)} className="text-xs text-muted-foreground hover:text-brand">Edit</button>
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

/**
 * Moving a customer to a new address.
 *
 * THE CASE NO RESET CAN REACH. Every other recovery path delivers to the customer's
 * mailbox, and on a managed workspace that address is also their workspace admin
 * login, so a mailbox that is gone takes the whole account with it.
 *
 * DELIBERATELY AWKWARD. Changing the address on a paid account is how an account
 * gets stolen, and "I've lost access to my email, point it at this one instead" is
 * the pretext that does it. So it is two fields rather than one: the current address
 * has to be typed out, which is also what stops a mis-click landing on the
 * neighbouring row. The backend checks it again and is the real gate.
 */
function ChangeEmailCell({ customer, onChanged }: { customer: Customer; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<EmailChangeResult | null>(null);

  function close() {
    setOpen(false);
    setCurrent("");
    setNext("");
    setError("");
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const out = await adminApi.changeCustomerEmail(customer.id, next.trim(), current.trim());
      setResult(out);
      close();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not change the address");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-1 text-xs">
        <p className="text-foreground">{result.new_email}</p>
        <p className="text-emerald-700 dark:text-emerald-300">
          Moved from {result.old_email}
          {result.workspaces_updated.length > 0 && `, workspaces updated: ${result.workspaces_updated.join(", ")}`}
        </p>
        {/* Billing already moved, so these are not a failure of the change: they are
            the workspaces still holding the old login, and they need finishing. */}
        {result.workspaces_failed.length > 0 && (
          <p className="text-amber-700 dark:text-amber-300">
            Could not reach {result.workspaces_failed.join(", ")}. Run on each:{" "}
            <code className="font-mono">make change-email OLD={result.old_email} NEW={result.new_email}</code>
          </p>
        )}
        {(!result.old_notified || !result.new_notified) && (
          <p className="text-amber-700 dark:text-amber-300">
            Could not email {!result.old_notified ? result.old_email : ""}
            {!result.old_notified && !result.new_notified ? " or " : ""}
            {!result.new_notified ? result.new_email : ""}. Tell them yourself.
          </p>
        )}
      </div>
    );
  }

  if (!open) {
    return (
      <span className="flex items-center gap-2">
        {customer.email}
        <button onClick={() => setOpen(true)} className="text-xs text-muted-foreground hover:text-brand">
          Change
        </button>
      </span>
    );
  }

  return (
    <div className="space-y-1.5">
      <input
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        placeholder="Type the current address"
        autoFocus
        className="w-56 rounded-md border border-border bg-muted px-2 py-1 text-xs text-foreground outline-none focus:border-brand"
      />
      <input
        value={next}
        onChange={(e) => setNext(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && current.trim() && next.trim()) void submit();
          if (e.key === "Escape") close();
        }}
        placeholder="New address"
        className="w-56 rounded-md border border-border bg-muted px-2 py-1 text-xs text-foreground outline-none focus:border-brand"
      />
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => void submit()}
          disabled={busy || !current.trim() || !next.trim()}
          className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-300"
        >
          {busy ? "…" : "Change"}
        </button>
        <button onClick={close} className="rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted">
          Cancel
        </button>
      </div>
      <p className="max-w-56 text-[11px] text-muted-foreground">
        Also moves their workspace login. Both addresses are told.
      </p>
      {error && <p className="max-w-56 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
