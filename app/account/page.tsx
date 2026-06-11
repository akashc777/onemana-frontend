"use client";

import { useCallback, useEffect, useState } from "react";
import { portalApi, PortalAuthError, type PortalOverview } from "@/lib/portalApi";
import { AccountLogin } from "@/components/account/AccountLogin";
import { AccountDashboard } from "@/components/account/AccountDashboard";

type State =
  | { phase: "loading" }
  | { phase: "signedOut" }
  | { phase: "signedIn"; overview: PortalOverview }
  | { phase: "error"; message: string };

export default function AccountPage() {
  const [state, setState] = useState<State>({ phase: "loading" });

  const load = useCallback(async () => {
    setState({ phase: "loading" });
    try {
      const overview = await portalApi.me();
      setState({ phase: "signedIn", overview });
    } catch (err) {
      if (err instanceof PortalAuthError) {
        setState({ phase: "signedOut" });
      } else {
        setState({ phase: "error", message: err instanceof Error ? err.message : "Something went wrong." });
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await portalApi.logout();
    setState({ phase: "signedOut" });
  }

  if (state.phase === "loading") {
    return <div className="grid min-h-[70vh] place-items-center text-sm text-slate-500">Loading…</div>;
  }

  if (state.phase === "error") {
    return (
      <div className="grid min-h-[70vh] place-items-center px-5 text-center text-sm">
        <div>
          <p className="text-red-400">{state.message}</p>
          <button onClick={load} className="btn-ghost mt-3 px-4 py-2 text-xs">Retry</button>
        </div>
      </div>
    );
  }

  if (state.phase === "signedOut") {
    return <AccountLogin onSignedIn={load} />;
  }

  return <AccountDashboard overview={state.overview} onLogout={logout} onReload={load} />;
}
