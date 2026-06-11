"use client";

import { useMemo, useState } from "react";
import { adminApi, type Subscription, type Customer } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { formatDateTime, formatDate } from "@/lib/format";
import { AsyncState, DataTable, StatusPill, Td, Tr } from "./ui";
import { FilterBar, emptyFilter, matchesQuery, withinRange, type RangeFilter } from "./filtering";

interface Loaded {
  subs: Subscription[];
  emailById: Record<string, string>;
}

export function SubscriptionsTable() {
  const { data, loading, error, reload } = useAsync<Loaded>(() =>
    Promise.all([adminApi.subscriptions(), adminApi.customers()]).then(([subs, custs]) => ({
      subs,
      emailById: Object.fromEntries(custs.map((c: Customer) => [c.id, c.email])),
    })),
  );
  const [filter, setFilter] = useState<RangeFilter>(emptyFilter);

  const emailById = data?.emailById ?? {};
  const filtered = useMemo(() => {
    const map = data?.emailById ?? {};
    return (data?.subs ?? []).filter(
      (s) =>
        withinRange(s.created_at, filter.from, filter.to) &&
        matchesQuery(filter.q, map[s.customer_id] ?? "", s.plan_code, s.status, s.razorpay_subscription_id),
    );
  }, [data, filter]);

  if (loading || error) return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <div>
      <p className="mb-3 text-sm text-slate-400">
        OneCamp Cloud subscriptions. Failed auto-pay is stopped automatically and the customer is emailed; every successful charge issues a GST invoice (see the Invoices tab).
      </p>
      <FilterBar value={filter} onChange={setFilter} placeholder="Search email, plan, status…" count={filtered.length} />
      <DataTable head={["Customer", "Plan", "Status", "Seats", "Next due", "Created", "Razorpay ID"]}>
        {filtered.length === 0 ? (
          <Tr>
            <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">No matching subscriptions.</td>
          </Tr>
        ) : (
          filtered.map((s) => (
            <Tr key={s.id}>
              <Td>{emailById[s.customer_id] || <span className="text-slate-500">unknown</span>}</Td>
              <Td>{s.plan_code}</Td>
              <Td>
                <div className="flex items-center gap-1.5">
                  <StatusPill status={s.status} />
                  {s.cancel_at_period_end && s.status !== "cancelled" && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-300">cancels at period end</span>
                  )}
                </div>
              </Td>
              <Td>{s.seats}</Td>
              <Td>{s.current_period_end ? formatDate(s.current_period_end) : "—"}</Td>
              <Td>{formatDateTime(s.created_at)}</Td>
              <Td mono>{s.razorpay_subscription_id || "—"}</Td>
            </Tr>
          ))
        )}
      </DataTable>
    </div>
  );
}
