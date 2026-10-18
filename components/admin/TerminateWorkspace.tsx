"use client";

import { useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { terminateConfirmed } from "@/lib/adminGaps";

// Erasing a workspace now, rather than at the end of its export window. It
// destroys the machine's data for good, so the button waits until the
// operator has typed the workspace's own address.
export function TerminateWorkspace({
  id,
  address,
  onDone,
  startOpen = false,
}: {
  id: string;
  address: string;
  onDone: (msg: string) => void;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(startOpen);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ready = terminateConfirmed(typed, address);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
        Erase…
      </button>
    );
  }

  async function erase() {
    setBusy(true);
    setError("");
    try {
      await adminApi.terminateInstance(id, typed.trim());
      onDone(`${address} was erased and its machine returned to the pool.`);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The workspace was not erased.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full space-y-2 rounded-md border border-rose-300 p-3 text-xs dark:border-rose-800">
      <p className="text-foreground">
        Erase <strong>{address}</strong> now? Everything on its machine is destroyed, and this cannot be undone. Type{" "}
        <strong>{address}</strong> to confirm.
      </p>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder={address}
        aria-label={`Type ${address} to confirm`}
        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
      />
      {error && <p className="text-rose-600 dark:text-rose-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => void erase()}
          disabled={!ready || busy}
          className="btn-primary bg-rose-600 px-3 py-1.5 text-xs disabled:opacity-40"
        >
          {busy ? "Erasing…" : "Erase this workspace"}
        </button>
        <button onClick={() => setOpen(false)} disabled={busy} className="btn-ghost px-3 py-1.5 text-xs">
          Keep it
        </button>
      </div>
    </div>
  );
}
