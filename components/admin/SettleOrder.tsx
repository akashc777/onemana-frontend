"use client";

import { useState } from "react";
import { adminApi } from "@/lib/adminApi";

// A machine order attempt whose checkout did not answer cleanly, and which
// OVH's order list could not settle. Nothing more is bought until a person
// says what happened: the OVH order it placed, or nothing bought.
export function SettleOrder({ id, onDone }: { id: string; onDone: () => void }) {
  const [orderId, setOrderId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function settle(asOrder: string) {
    if (asOrder === "" && !window.confirm("Record that this attempt bought nothing? Auto-ordering resumes.")) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.resolveServerOrder(id, asOrder);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The attempt was not settled.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="OVH order number"
        aria-label="OVH order number"
        inputMode="numeric"
        className="w-32 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
      />
      <button
        onClick={() => void settle(orderId.trim())}
        disabled={busy || orderId.trim() === ""}
        className="btn-ghost px-2 py-1 text-xs disabled:opacity-40"
      >
        It was bought
      </button>
      <button onClick={() => void settle("")} disabled={busy} className="btn-ghost px-2 py-1 text-xs disabled:opacity-40">
        Nothing was bought
      </button>
      {error && <span className="text-rose-600 dark:text-rose-400">{error}</span>}
    </div>
  );
}
