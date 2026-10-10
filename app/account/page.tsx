"use client";

import { useCallback, useEffect, useState } from "react";
import { portalApi, PortalAuthError, type PortalInstance, type PortalOverview } from "@/lib/portalApi";
import { AccountLogin } from "@/components/account/AccountLogin";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { preloadStoragePricing } from "@/components/account/StorageAddon";
import { readPurchase } from "@/lib/purchaseHandoff";

type State =
  | { phase: "loading" }
  | { phase: "signedOut" }
  | { phase: "signedIn"; overview: PortalOverview; instances: PortalInstance[] | null }
  | { phase: "error"; message: string };

/**
 * While the session is checked: the page's frame, as tall as the window, so
 * the footer is out of sight and nothing on screen moves when the account
 * (or the sign-in form) takes its place. It said "Loading…" in a 70vh box,
 * and the dashboard that replaced it pushed the footer and every section
 * below it down: a layout shift of 0.47 on a phone.
 */
function Waiting() {
  return (
    <div role="status" aria-label="Checking your sign-in…" className="container-x min-h-[calc(100dvh-3.5rem)] pb-24 pt-10 sm:pt-14">
      <div className="h-9 w-48 rounded-md bg-muted sm:h-10" />
      <div className="mt-3 h-4 w-64 max-w-full rounded bg-muted" />
      <div className="mt-10 h-px bg-border" />
      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [state, setState] = useState<State>({ phase: "loading" });
  // Set when a sign-in link from an email did not work, to say so and keep the address.
  const [linkEmail, setLinkEmail] = useState("");
  const [linkNotice, setLinkNotice] = useState("");

  const load = useCallback(async () => {
    // The overview and the workspaces in parallel, so the account arrives in
    // one piece: the workspace card used to load after the page had drawn,
    // and moved everything under it. A workspace read that fails is left to
    // the card, which asks again and says so. The storage offer's price is
    // read alongside for the same reason.
    const instances = portalApi.instances().catch(() => null);
    preloadStoragePricing().catch(() => {});
    try {
      const overview = await portalApi.me();
      setState({ phase: "signedIn", overview, instances: await instances });
    } catch (err) {
      if (err instanceof PortalAuthError) {
        setState({ phase: "signedOut" });
      } else {
        setState({ phase: "error", message: err instanceof Error ? err.message : "Something went wrong." });
      }
    }
  }, []);

  useEffect(() => {
    // A sign-in link from an email (?email=&signin=): use it once, then take it
    // out of the address bar so it is neither bookmarked nor shared.
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email") ?? "";
    const token = params.get("signin") ?? "";
    if (!email || !token) {
      load();
      return;
    }
    window.history.replaceState(null, "", window.location.pathname);
    portalApi
      .verify(email, token)
      .catch(() => {
        setLinkEmail(email);
        setLinkNotice("That sign-in link has been used or has expired. We can email you a code instead.");
      })
      .finally(load);
  }, [load]);

  async function logout() {
    await portalApi.logout();
    setState({ phase: "signedOut" });
  }

  if (state.phase === "loading") return <Waiting />;

  if (state.phase === "error") {
    return (
      <div className="container-x min-h-[calc(100dvh-3.5rem)] pb-24 pt-10 sm:pt-14">
        <div role="alert" className="max-w-md">
          <h1 className="text-[1.875rem] leading-[2.25rem] tracking-[-0.022em] text-foreground">Your account did not load</h1>
          <p className="mt-3 text-body text-muted-foreground">{state.message}</p>
          <p className="mt-1 text-small text-muted-foreground">
            Nothing in your account has changed. If it keeps happening, write to support@onemana.dev.
          </p>
          <button
            onClick={() => {
              setState({ phase: "loading" });
              load();
            }}
            className="btn-ghost mt-6 h-11 px-4 py-0 sm:h-10"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "signedOut") {
    // A buyer arriving from the receipt in this tab has typed their email once
    // already; see lib/purchaseHandoff. Only reached in the browser, after the
    // first request, so the server render never reads it.
    return (
      <AccountLogin
        onSignedIn={load}
        initialEmail={linkEmail || readPurchase()?.email || ""}
        initialNotice={linkNotice}
      />
    );
  }

  return <AccountDashboard overview={state.overview} instances={state.instances} onLogout={logout} onReload={load} />;
}
