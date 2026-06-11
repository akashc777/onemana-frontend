"use client";

import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { CustomersTable } from "@/components/admin/CustomersTable";
import { InvoicesTable } from "@/components/admin/InvoicesTable";
import { SubscriptionsTable } from "@/components/admin/SubscriptionsTable";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { BlogManager } from "@/components/admin/BlogManager";
import { VisitorsPanel } from "@/components/admin/VisitorsPanel";
import { EarningsPanel } from "@/components/admin/EarningsPanel";

const TABS = ["orders", "earnings", "subscriptions", "customers", "invoices", "visitors", "blog", "settings"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const { status, signIn, signOut } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("orders");

  if (status === "checking") {
    return <div className="grid min-h-[70vh] place-items-center text-sm text-slate-500">Loading…</div>;
  }
  if (status === "unauthed") {
    return <AdminLogin onSignIn={signIn} />;
  }

  return (
    <div className="container-x py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">OneMana Admin</h1>
        <button onClick={signOut} className="btn-ghost px-4 py-2 text-sm">
          Sign out
        </button>
      </header>

      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-1 text-sm" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-current={tab === t ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 font-medium capitalize transition ${
              tab === t ? "bg-brand text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "orders" && <OrdersTable />}
      {tab === "earnings" && <EarningsPanel />}
      {tab === "subscriptions" && <SubscriptionsTable />}
      {tab === "customers" && <CustomersTable />}
      {tab === "invoices" && <InvoicesTable />}
      {tab === "visitors" && <VisitorsPanel />}
      {tab === "blog" && <BlogManager />}
      {tab === "settings" && <SettingsForm />}
    </div>
  );
}
