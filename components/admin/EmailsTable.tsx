"use client";

/**
 * Transactional email that has been attempted, and what happened to it.
 *
 * WHY IT EXISTS. Every customer email went out as one synchronous attempt whose
 * error was logged and dropped, so the honest answer to "did that customer get
 * their licence key" was to grep a log on the server. The worst case is silent
 * and expensive: somebody pays, the provider rate-limits for thirty seconds, and
 * the only person who knows is nobody.
 *
 * The queue retries on its own. This screen is for the messages it could not
 * rescue, and for answering the question above in a second rather than an hour.
 */

import { useMemo, useState } from "react";
import { adminApi, type OutboxEmail, type OutboxStatus } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { formatDateTime } from "@/lib/format";
import { AsyncState, DataTable, StatusPill, Td, Tr } from "./ui";
import { FilterBar, emptyFilter, matchesQuery, withinRange, type RangeFilter } from "./filtering";

/** Dead first: it is the only state that needs a person. */
const TABS: { key: OutboxStatus | "all"; label: string }[] = [
  { key: "dead", label: "Needs attention" },
  { key: "pending", label: "Queued" },
  { key: "sent", label: "Sent" },
  { key: "all", label: "All" },
];

export function EmailsTable() {
  const [tab, setTab] = useState<OutboxStatus | "all">("dead");
  const [filter, setFilter] = useState<RangeFilter>(emptyFilter);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const { data, loading, error, reload } = useAsync(
    () => adminApi.listEmails(tab === "all" ? undefined : tab),
    [tab],
  );

  const counts = data?.counts ?? {};

  // Derived inside the memo rather than above it: `data?.emails ?? []` is a new
  // array on every render, which would make the memo recompute every time and
  // defeat the point of having one.
  const filtered = useMemo(
    () =>
      (data?.emails ?? []).filter(
        (e) =>
          withinRange(e.created_at, filter.from, filter.to) &&
          matchesQuery(filter.q, e.to_email, e.subject, e.kind, e.status),
      ),
    [data, filter],
  );

  async function resend(e: OutboxEmail) {
    setResendingId(e.id);
    try {
      const msg = await adminApi.resendEmail(e.id);
      window.alert(msg);
      reload();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not queue the resend.");
    } finally {
      setResendingId(null);
    }
  }

  if (loading || error) return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const n = t.key === "all" ? undefined : counts[t.key];
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-current={tab === t.key ? "page" : undefined}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {n ? <span className="ml-1.5 opacity-70">{n}</span> : null}
            </button>
          );
        })}
      </div>

      <FilterBar value={filter} onChange={setFilter} placeholder="Search recipient, subject, kind…" count={filtered.length} />

      <DataTable head={["Recipient", "Subject", "Kind", "Status", "Attempts", "Last error", "Created", ""]}>
        {filtered.length === 0 ? (
          <Tr>
            <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
              {tab === "dead" ? "Nothing needs attention." : "No matching emails."}
            </td>
          </Tr>
        ) : (
          filtered.map((e) => (
            <Tr key={e.id}>
              <Td mono>{e.to_email}</Td>
              <Td>{e.subject}</Td>
              <Td>{e.kind || "—"}</Td>
              <Td>
                <StatusPill status={e.status} />
              </Td>
              <Td>{e.attempts}</Td>
              {/* Truncated: a provider error can be a whole response body, and the
                  full text is in the server log for anyone who needs it. */}
              <Td>
                <span className="block max-w-xs truncate text-muted-foreground" title={e.last_error}>
                  {e.last_error || "—"}
                </span>
              </Td>
              <Td>{formatDateTime(e.created_at)}</Td>
              <Td>
                {e.status === "sent" ? null : (
                  <button
                    onClick={() => resend(e)}
                    disabled={resendingId === e.id}
                    className="btn-ghost px-2 py-1 text-xs disabled:opacity-50"
                  >
                    {resendingId === e.id ? "…" : "Send again"}
                  </button>
                )}
              </Td>
            </Tr>
          ))
        )}
      </DataTable>
    </div>
  );
}
