"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { ADMIN_TABS, AdminPanel, type AdminTab } from "@/components/admin/AdminPanel";

export default function AdminPage() {
  const { status, signIn, signOut } = useAdminAuth();
  const [tab, setTab] = useState<AdminTab>("metrics");

  if (status === "checking") {
    return <div className="grid min-h-[70vh] place-items-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (status === "unauthed") {
    return <AdminLogin onSignIn={signIn} />;
  }

  return (
    <div className="container-x py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">OneMana Admin</h1>
        <button onClick={signOut} className="btn-ghost px-4 py-2 text-sm">
          Sign out
        </button>
      </header>

      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted p-1 text-sm" aria-label="Admin sections">
        {ADMIN_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-current={tab === t ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 font-medium capitalize transition ${
              tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <AdminPanel tab={tab} />
    </div>
  );
}
