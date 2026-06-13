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
import { DocsManager } from "@/components/admin/DocsManager";
import { VisitorsPanel } from "@/components/admin/VisitorsPanel";
import { EarningsPanel } from "@/components/admin/EarningsPanel";
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";
import { GiftForm } from "@/components/admin/GiftForm";

const TABS = ["orders", "earnings", "subscriptions", "customers", "invoices", "visitors", "announcements", "blog", "docs", "settings"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const { status, signIn, signOut } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("orders");

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
        {TABS.map((t) => (
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

      {tab === "orders" && <OrdersTable />}
      {tab === "earnings" && <EarningsPanel />}
      {tab === "subscriptions" && <SubscriptionsTable />}
      {tab === "customers" && (
        <div>
          <GiftForm />
          <CustomersTable />
        </div>
      )}
      {tab === "invoices" && <InvoicesTable />}
      {tab === "visitors" && <VisitorsPanel />}
      {tab === "announcements" && <AnnouncementsManager />}
      {tab === "blog" && <BlogManager />}
      {tab === "docs" && <DocsManager />}
      {tab === "settings" && <SettingsForm />}
    </div>
  );
}
